import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { ConflictException } from '@nestjs/common';

const mockPrismaService = {
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
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
      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: {
          document: '12345678901234',
          corporateName: 'Test Corp',
          createdBy: 'user-1',
          contacts: {
            create: [{ name: 'John Doe', email: 'john@test.com', createdBy: 'user-1' }],
          },
          partners: {
            create: [{ name: 'Jane Doe', document: '12345678901', percentage: 50, createdBy: 'user-1' }],
          },
        },
        include: {
          contacts: true,
          partners: true,
        },
      });
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
});
