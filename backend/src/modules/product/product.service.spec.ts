import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

const mockPrismaService = {
  softwareProduct: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: TENANT_PRISMA_SERVICE,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with modules', async () => {
      const createDto = { name: 'ERP', description: 'Sistema', modules: [{ name: 'Financeiro', price: 100, isActive: true }] };
      
      mockPrismaService.softwareProduct.create.mockResolvedValue({
        id: '1',
        ...createDto,
      });

      const result = await service.create(createDto, 'user-1');

      expect(result).toHaveProperty('id', '1');
      expect(mockPrismaService.softwareProduct.create).toHaveBeenCalledWith({
        data: {
          name: 'ERP',
          description: 'Sistema',
          modules: {
            create: [
              {
                name: 'Financeiro',
                price: 100,
                isActive: true,
                createdBy: 'user-1'
              }
            ]
          },
          createdBy: 'user-1'
        },
        include: { modules: true, productGroup: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const items = [{ id: '1', name: 'ERP' }];
      mockPrismaService.softwareProduct.findMany.mockResolvedValue(items);

      const result = await service.findAll();
      expect(result).toEqual(items);
      expect(mockPrismaService.softwareProduct.findMany).toHaveBeenCalled();
    });
  });
});
