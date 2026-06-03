import { Test, TestingModule } from '@nestjs/testing';
import { CorporateGroupController } from './corporate-group.controller';
import { CorporateGroupService } from './corporate-group.service';

const mockCorporateGroupService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getFinancialSummary: jest.fn(),
  linkCustomers: jest.fn(),
  unlinkCustomer: jest.fn(),
};

describe('CorporateGroupController', () => {
  let controller: CorporateGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorporateGroupController],
      providers: [
        {
          provide: CorporateGroupService,
          useValue: mockCorporateGroupService,
        },
      ],
    }).compile();

    controller = module.get<CorporateGroupController>(CorporateGroupController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service create', async () => {
      const dto = { name: 'Group 1' };
      const req = { user: { sub: 'user-1' } };
      mockCorporateGroupService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto as any, req);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockCorporateGroupService.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('should fallback to system-user', async () => {
      mockCorporateGroupService.create.mockResolvedValue({ id: '1' });
      await controller.create({} as any, {});
      expect(mockCorporateGroupService.create).toHaveBeenCalledWith(expect.any(Object), 'system-user');
    });
  });

  describe('findAll', () => {
    it('should call service findAll', async () => {
      mockCorporateGroupService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(mockCorporateGroupService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      mockCorporateGroupService.findOne.mockResolvedValue({ id: '1' });
      const result = await controller.findOne('1');
      expect(result).toEqual({ id: '1' });
      expect(mockCorporateGroupService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const req = { user: { sub: 'user-1' } };
      mockCorporateGroupService.update.mockResolvedValue({ id: '1' });
      
      const result = await controller.update('1', { name: 'Test' }, req);
      expect(result).toEqual({ id: '1' });
      expect(mockCorporateGroupService.update).toHaveBeenCalledWith('1', { name: 'Test' }, 'user-1');
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      mockCorporateGroupService.remove.mockResolvedValue({ message: 'Excluído' });
      const result = await controller.remove('1');
      expect(result).toEqual({ message: 'Excluído' });
      expect(mockCorporateGroupService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getFinancialSummary', () => {
    it('should call service getFinancialSummary', async () => {
      mockCorporateGroupService.getFinancialSummary.mockResolvedValue({ activeContractsCount: 1 });
      const result = await controller.getFinancialSummary('1');
      expect(result.activeContractsCount).toBe(1);
      expect(mockCorporateGroupService.getFinancialSummary).toHaveBeenCalledWith('1');
    });
  });

  describe('linkCustomers', () => {
    it('should call service linkCustomers', async () => {
      const req = { user: { sub: 'user-1' } };
      mockCorporateGroupService.linkCustomers.mockResolvedValue({ message: 'Linked' });
      const result = await controller.linkCustomers('1', { customerIds: ['c1', 'c2'] }, req);
      expect(result.message).toBe('Linked');
      expect(mockCorporateGroupService.linkCustomers).toHaveBeenCalledWith('1', ['c1', 'c2'], 'user-1');
    });
  });

  describe('unlinkCustomer', () => {
    it('should call service unlinkCustomer', async () => {
      const req = { user: { sub: 'user-1' } };
      mockCorporateGroupService.unlinkCustomer.mockResolvedValue({ message: 'Unlinked' });
      const result = await controller.unlinkCustomer('1', 'c1', req);
      expect(result.message).toBe('Unlinked');
      expect(mockCorporateGroupService.unlinkCustomer).toHaveBeenCalledWith('1', 'c1', 'user-1');
    });
  });
});
