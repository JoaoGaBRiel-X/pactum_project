import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { NotificationService } from '../notification/notification.service';

const mockPrisma = {
  client: {
    $transaction: jest.fn((cb) => cb),
    $executeRawUnsafe: jest.fn(),
    contract: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    contractItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    softwareProduct: {
      findUnique: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    contractHistory: {
      create: jest.fn(),
    },
    contractDocument: {
      count: jest.fn(),
    },
    tenantSetting: {
      findFirst: jest.fn(),
    },
    receivable: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    }
  }
};

describe('ContractService', () => {
  let service: ContractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: TENANT_PRISMA_SERVICE,
          useValue: mockPrisma.client, // Pass the client directly!
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a contract successfully', async () => {
    const createDto = {
      customerId: 'cust-1',
      productId: 'prod-1',
      globalDiscount: 10,
      renewalMode: 'AUTOMATIC' as const,
      items: [
        { moduleId: 'mod-1', quantity: 2, discount: 5 }
      ]
    };

    mockPrisma.client.customer.findUnique.mockResolvedValue({ id: 'cust-1', corporateName: 'Test' });
    mockPrisma.client.softwareProduct.findUnique.mockResolvedValue({
      id: 'prod-1',
      modules: [{ id: 'mod-1', name: 'Módulo 1', price: 100, isActive: true }]
    });

    const expectedTotalValue = ((100 - 5) * 2) - 10; // 180

    mockPrisma.client.contract.create.mockResolvedValue({
      id: 'contract-1',
      totalValue: expectedTotalValue,
      status: 'DRAFT',
    });

    // We mock $transaction to just execute the function if it's an array of promises or a function
    mockPrisma.client.$transaction.mockImplementation(async (arg) => {
      if (typeof arg === 'function') {
        return arg(mockPrisma.client);
      }
      return Promise.all(arg);
    });

    const result = await service.create(createDto, 'user-1');
    
    expect(mockPrisma.client.softwareProduct.findUnique).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      include: { modules: true },
    });
    
    expect(mockPrisma.client.contract.create).toHaveBeenCalled();
    expect(result.totalValue).toBe(180);
    expect(result.status).toBe('DRAFT');
  });

  it('should transition status from DRAFT to PENDING_SIGNATURE', async () => {
    mockPrisma.client.contract.findUnique.mockResolvedValue({
      id: 'contract-1',
      status: 'DRAFT',
      customerId: 'cust-1',
      globalDiscount: 0,
      totalValue: 180,
    });

    mockPrisma.client.contract.update.mockResolvedValue({
      id: 'contract-1',
      status: 'PENDING_SIGNATURE',
    });

    mockPrisma.client.contractItem.findMany.mockResolvedValue([
      { moduleId: 'mod-1', quantity: 2, unitPrice: 100, discount: 5 }
    ]);

    mockPrisma.client.contractHistory.create.mockResolvedValue({});

    // We mock $transaction to just execute the function
    mockPrisma.client.$transaction.mockImplementation(async (arg) => {
      if (typeof arg === 'function') {
        return arg(mockPrisma.client);
      }
      return Promise.all(arg);
    });

    mockPrisma.client.contractDocument.count.mockResolvedValue(1);

    const result = await service.updateStatus('contract-1', { status: 'PENDING_SIGNATURE', reason: 'Enviado' }, 'user-1');
    
    expect(mockPrisma.client.contract.update).toHaveBeenCalledWith({
      where: { id: 'contract-1' },
      data: expect.objectContaining({ status: 'PENDING_SIGNATURE' })
    });
    expect(mockPrisma.client.contractHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'PENDING_SIGNATURE',
        reason: 'Enviado'
      })
    });
    expect(result.status).toBe('PENDING_SIGNATURE');
  });

  it('should amend an active contract and save pending amendment', async () => {
    mockPrisma.client.contract.findUnique.mockResolvedValue({
      id: 'contract-1',
      status: 'ACTIVE',
      productId: 'prod-1',
      globalDiscount: 0,
      totalValue: 180,
    });

    mockPrisma.client.softwareProduct.findUnique.mockResolvedValue({
      id: 'prod-1',
      modules: [{ id: 'mod-1', name: 'Módulo 1', price: 100, isActive: true }]
    });

    mockPrisma.client.contract.update.mockResolvedValue({
      id: 'contract-1',
      pendingAmendment: expect.any(Object),
    });

    const amendDto = {
      items: [{ moduleId: 'mod-1', quantity: 3, discount: 0 }],
      globalDiscount: 10,
    };

    await service.amendContract('contract-1', amendDto as any, 'user-1');

    expect(mockPrisma.client.contract.update).toHaveBeenCalledWith({
      where: { id: 'contract-1' },
      data: expect.objectContaining({
        pendingAmendment: expect.objectContaining({
          totalValue: 290, // (100 * 3) - 10
          globalDiscount: 10,
          items: expect.any(Array),
        })
      })
    });
  });

  it('should apply pending amendment and save history snapshot', async () => {
    mockPrisma.client.contract.findUnique.mockResolvedValue({
      id: 'contract-1',
      status: 'ACTIVE',
      pendingAmendment: {
        totalValue: 290,
        globalDiscount: 10,
        items: [
          { moduleId: 'mod-1', quantity: 3, unitPrice: 100, discount: 0 }
        ]
      }
    });

    mockPrisma.client.contract.update.mockResolvedValue({
      id: 'contract-1',
      totalValue: 290,
    });

    // We mock $transaction to just execute the function
    mockPrisma.client.$transaction.mockImplementation(async (arg) => {
      if (typeof arg === 'function') {
        return arg(mockPrisma.client);
      }
      return Promise.all(arg);
    });

    await service.applyAmendment('contract-1', 'user-1');

    expect(mockPrisma.client.contractItem.deleteMany).toHaveBeenCalledWith({ where: { contractId: 'contract-1' } });
    expect(mockPrisma.client.contract.update).toHaveBeenCalledWith({
      where: { id: 'contract-1' },
      data: expect.objectContaining({
        totalValue: 290,
        globalDiscount: 10,
        pendingAmendment: expect.anything(), // Prisma.DbNull
      }),
      include: { items: true }
    });
    expect(mockPrisma.client.contractHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reason: 'Aprovação de Aditivo Contratual',
        totalValue: 290,
      })
    });
  });

  describe('Cancellation and Cutoff Rule', () => {
    beforeEach(() => {
      mockPrisma.client.contract.findUnique.mockResolvedValue({
        id: 'contract-1',
        status: 'ACTIVE',
        customerId: 'cust-1',
        globalDiscount: 0,
        totalValue: 180,
        startDate: new Date(),
        endDate: new Date(),
      });

      mockPrisma.client.contract.update.mockResolvedValue({
        id: 'contract-1',
        status: 'CANCELLED',
      });

      mockPrisma.client.receivable.findMany.mockResolvedValue([
        { id: 'rec-1', status: 'PENDING', dueDate: new Date() },
        { id: 'rec-2', status: 'PENDING', dueDate: new Date() },
      ]);

      mockPrisma.client.receivable.updateMany.mockResolvedValue({ count: 2 });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should cancel all receivables if today <= cutoffDay', async () => {
      jest.spyOn(global.Date.prototype, 'getDate').mockReturnValue(10);
      mockPrisma.client.tenantSetting.findFirst.mockResolvedValue({
        billingCutoffStrategy: 'GLOBAL',
        globalCutoffDay: 15,
      });

      await service.updateStatus('contract-1', { status: 'CANCELLED', reason: 'Cancelado pelo cliente' }, 'user-1');

      // today (10) <= cutoff (15), should cancel ALL
      expect(mockPrisma.client.receivable.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['rec-1', 'rec-2'] } },
        data: expect.objectContaining({ status: 'CANCELED' })
      });
      
      expect(mockPrisma.client.contractHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reason: expect.stringContaining('Cancelamento no limite da data de corte')
        })
      });
    });

    it('should keep next invoice and cancel the rest if today > cutoffDay', async () => {
      jest.spyOn(global.Date.prototype, 'getDate').mockReturnValue(20);
      mockPrisma.client.tenantSetting.findFirst.mockResolvedValue({
        billingCutoffStrategy: 'GLOBAL',
        globalCutoffDay: 15,
      });

      await service.updateStatus('contract-1', { status: 'CANCELLED', reason: 'Cancelado pelo cliente' }, 'user-1');

      // today (20) > cutoff (15), should keep rec-1 and cancel rec-2
      expect(mockPrisma.client.receivable.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['rec-2'] } }, // rec-1 is kept
        data: expect.objectContaining({ status: 'CANCELED' })
      });

      expect(mockPrisma.client.contractHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reason: expect.stringContaining('Próxima fatura mantida')
        })
      });
    });
  });
});
