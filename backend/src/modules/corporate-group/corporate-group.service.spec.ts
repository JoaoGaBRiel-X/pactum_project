import { Test, TestingModule } from '@nestjs/testing';
import { CorporateGroupService } from './corporate-group.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  corporateGroup: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  customer: {
    count: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  },
  contract: {
    findMany: jest.fn(),
  },
  receivable: {
    findMany: jest.fn(),
  },
};

describe('CorporateGroupService', () => {
  let service: CorporateGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorporateGroupService,
        {
          provide: TENANT_PRISMA_SERVICE,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CorporateGroupService>(CorporateGroupService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a corporate group', async () => {
      const dto = { name: 'Test Group' };
      mockPrismaService.corporateGroup.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto as any, 'user-1');
      expect(result).toHaveProperty('id', '1');
      expect(mockPrismaService.corporateGroup.create).toHaveBeenCalledWith({
        data: { ...dto, createdBy: 'user-1' },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of groups', async () => {
      const groups = [{ id: '1', name: 'Test' }];
      mockPrismaService.corporateGroup.findMany.mockResolvedValue(groups);

      const result = await service.findAll();
      expect(result).toEqual(groups);
      expect(mockPrismaService.corporateGroup.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a group', async () => {
      const group = { id: '1', name: 'Test' };
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue(group);

      const result = await service.findOne('1');
      expect(result).toEqual(group);
      expect(mockPrismaService.corporateGroup.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group not found', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue({ id: '1' });
      const updateDto = { name: 'Updated' };
      mockPrismaService.corporateGroup.update.mockResolvedValue({ id: '1', ...updateDto });

      const result = await service.update('1', updateDto as any, 'user-1');
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if there are linked customers', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.customer.count.mockResolvedValue(1);

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.corporateGroup.delete).not.toHaveBeenCalled();
    });

    it('should remove the group if no linked customers', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.customer.count.mockResolvedValue(0);
      mockPrismaService.corporateGroup.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.message).toContain('sucesso');
      expect(mockPrismaService.corporateGroup.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('getFinancialSummary', () => {
    it('should return financial summary', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.contract.findMany.mockResolvedValue([{ totalValue: 100 }, { totalValue: 200 }]);
      mockPrismaService.receivable.findMany.mockResolvedValue([{ amount: 50 }]);

      const result = await service.getFinancialSummary('1');
      expect(result.activeContractsCount).toBe(2);
      expect(result.totalActiveContractsValue).toBe(300);
      expect(result.totalPendingDebt).toBe(50);
    });
  });

  describe('linkCustomers', () => {
    it('should link customers to the group', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.customer.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.linkCustomers('1', ['c1', 'c2'], 'user-1');
      expect(result.message).toContain('sucesso');
      expect(mockPrismaService.customer.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['c1', 'c2'] } },
        data: { corporateGroupId: '1', updatedBy: 'user-1' }
      });
    });
  });

  describe('unlinkCustomer', () => {
    it('should unlink a customer from the group', async () => {
      mockPrismaService.corporateGroup.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.customer.update.mockResolvedValue({ id: 'c1' });

      const result = await service.unlinkCustomer('1', 'c1', 'user-1');
      expect(result.message).toContain('sucesso');
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { corporateGroupId: null, updatedBy: 'user-1' }
      });
    });
  });
});
