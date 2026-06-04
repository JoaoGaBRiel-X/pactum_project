import { Test, TestingModule } from '@nestjs/testing';
import { AdjustmentService } from './adjustment.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { BacenService } from './bacen.service';

describe('AdjustmentService', () => {
  let service: AdjustmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentService,
        { provide: TENANT_PRISMA_SERVICE, useValue: {} },
        { provide: BacenService, useValue: {} },
      ],
    }).compile();

    service = module.get<AdjustmentService>(AdjustmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
