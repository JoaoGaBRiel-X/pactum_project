import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: TENANT_PRISMA_SERVICE, useValue: {} },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
