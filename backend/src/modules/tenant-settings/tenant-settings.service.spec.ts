import { Test, TestingModule } from '@nestjs/testing';
import { TenantSettingsService } from './tenant-settings.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('TenantSettingsService', () => {
  let service: TenantSettingsService;
  let mockTenantClient: any;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockTenantClient = {
      tenantSetting: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    mockPrismaService = {
      client: {
        tenant: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSettingsService,
        {
          provide: TENANT_PRISMA_SERVICE,
          useValue: mockTenantClient,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TenantSettingsService>(TenantSettingsService);
  });

  it('should update needsMappingConfig successfully', async () => {
    mockPrismaService.client.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
    mockTenantClient.tenantSetting.findFirst.mockResolvedValue({ id: 'setting-1' });
    mockTenantClient.tenantSetting.update.mockResolvedValue({ id: 'setting-1', needsMappingConfig: [{ label: 'Q1', type: 'text' }] });

    const dto = { needsMappingConfig: [{ label: 'Q1', type: 'text' }] };
    
    const result = await service.updateSettings('tenant-1', dto as any);

    expect(mockTenantClient.tenantSetting.update).toHaveBeenCalledWith({
      where: { id: 'setting-1' },
      data: { needsMappingConfig: [{ label: 'Q1', type: 'text' }] },
    });
    
    expect(result.needsMappingConfig).toBeDefined();
  });
});
