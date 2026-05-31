import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

const mockPrisma = {
  client: {
    $transaction: jest.fn((cb) => cb),
    $executeRawUnsafe: jest.fn(),
    contract: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    softwareProduct: {
      findUnique: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    contractHistory: {
      create: jest.fn(),
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
      modules: [{ id: 'mod-1', price: 100 }]
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

    const result = await service.create(createDto);
    
    expect(mockPrisma.client.softwareProduct.findUnique).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      include: { modules: true },
    });
    
    expect(mockPrisma.client.contract.create).toHaveBeenCalled();
    expect(result.totalValue).toBe(180);
    expect(result.status).toBe('DRAFT');
  });
});
