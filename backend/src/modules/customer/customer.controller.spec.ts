import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

const mockCustomerService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call customerService.create with dto and userId', async () => {
      const dto = { document: '123', corporateName: 'Test' };
      const req = { user: { id: 'user-1' } };
      mockCustomerService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto as any, req);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockCustomerService.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('should fallback to system-user if user is not in req', async () => {
      mockCustomerService.create.mockResolvedValue({ id: '1' });
      await controller.create({} as any, {});
      expect(mockCustomerService.create).toHaveBeenCalledWith(expect.any(Object), 'system-user');
    });
  });

  describe('findAll', () => {
    it('should call customerService.findAll', async () => {
      mockCustomerService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(mockCustomerService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call customerService.findOne', async () => {
      mockCustomerService.findOne.mockResolvedValue({ id: '1' });
      const result = await controller.findOne('1');
      expect(result).toEqual({ id: '1' });
      expect(mockCustomerService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call customerService.update with tenant slug from headers', async () => {
      const req = { 
        user: { id: 'user-1' }, 
        headers: { 'x-tenant-id': 'tenant-mock' } 
      };
      mockCustomerService.update.mockResolvedValue({ id: '1' });
      
      const result = await controller.update('1', { corporateName: 'Test' }, req);
      expect(result).toEqual({ id: '1' });
      expect(mockCustomerService.update).toHaveBeenCalledWith('1', { corporateName: 'Test' }, 'user-1', 'tenant-mock');
    });
  });

  describe('remove', () => {
    it('should call customerService.remove', async () => {
      mockCustomerService.remove.mockResolvedValue({ message: 'Excluído' });
      const result = await controller.remove('1');
      expect(result).toEqual({ message: 'Excluído' });
      expect(mockCustomerService.remove).toHaveBeenCalledWith('1');
    });
  });
});
