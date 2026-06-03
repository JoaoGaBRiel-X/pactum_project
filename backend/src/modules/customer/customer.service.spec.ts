import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PortalAuthService } from '../portal/auth/portal-auth.service';

const mockPrismaService = {
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  corporateGroup: {
    findUnique: jest.fn(),
  }
};

const mockPortalAuthService = {
  generateSetupToken: jest.fn(),
};

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: TENANT_PRISMA_SERVICE,
          useValue: mockPrismaService,
        },
        {
          provide: PortalAuthService,
          useValue: mockPortalAuthService,
        }
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer with contacts and partners', async () => {
      const createCustomerDto = {
        document: '12345678901234',
        corporateName: 'Test Corp',
        contacts: [{ name: 'John Doe', email: 'john@test.com' }],
        partners: [{ name: 'Jane Doe', document: '12345678901', percentage: 50 }],
      };
      
      mockPrismaService.customer.create.mockResolvedValue({
        id: '1',
        ...createCustomerDto,
      });

      const result = await service.create(createCustomerDto, 'user-1');

      expect(result).toHaveProperty('id', '1');
      expect(mockPrismaService.customer.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if corporateGroupId is provided but group not found', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue(null);
      await expect(service.create({ document: '123', corporateName: 'Test', corporateGroupId: 'invalid' }, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if document already exists (P2002)', async () => {
      const createCustomerDto = {
        document: '12345678901234',
        corporateName: 'Test Corp',
      };
      
      mockPrismaService.customer.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createCustomerDto, 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const customers = [{ id: '1', corporateName: 'Test' }];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();
      expect(result).toEqual(customers);
      expect(mockPrismaService.customer.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const customer = { id: '1', corporateName: 'Test' };
      mockPrismaService.customer.findUnique.mockResolvedValue(customer);

      const result = await service.findOne('1');
      expect(result).toEqual(customer);
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: '1' }}));
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer successfully', async () => {
      const existingCustomer = { id: '1', document: '123', contacts: [] };
      mockPrismaService.customer.findUnique.mockResolvedValue(existingCustomer);
      
      const updateData = { corporateName: 'Updated Corp' };
      mockPrismaService.customer.update.mockResolvedValue({ ...existingCustomer, ...updateData });

      const result = await service.update('1', updateData, 'user-1');
      expect(result.corporateName).toBe('Updated Corp');
      expect(mockPrismaService.customer.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if changing CNPJ and contracts exist', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({ 
        id: '1', 
        document: '123', 
        contracts: [{ id: 'c1' }] 
      });

      await expect(service.update('1', { document: '999' }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should trigger magic link generation if contact gets portalAccess', async () => {
      const existingCustomer = { 
        id: '1', 
        document: '123', 
        contacts: [{ id: 'c1', email: 'test@test.com', portalAccess: false }] 
      };
      mockPrismaService.customer.findUnique.mockResolvedValue(existingCustomer);
      
      const updatedCustomer = { 
        id: '1', 
        contacts: [{ id: 'c1', email: 'test@test.com', portalAccess: true }] 
      };
      mockPrismaService.customer.update.mockResolvedValue(updatedCustomer);
      mockPortalAuthService.generateSetupToken.mockResolvedValue(true);

      await service.update('1', { contacts: [{ name: 'Test', email: 'test@test.com', portalAccess: true }] }, 'user-1', 'mock-slug');
      expect(mockPortalAuthService.generateSetupToken).toHaveBeenCalledWith('mock-slug', 'c1', 'test@test.com');
    });
  });

  describe('remove', () => {
    it('should remove a customer', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.customer.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.message).toContain('excluído');
      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw BadRequestException if Prisma throws P2003 (foreign key constraint)', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.customer.delete.mockRejectedValue({ code: 'P2003' });

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});
