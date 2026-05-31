import { Test, TestingModule } from '@nestjs/testing';
import { AdjustmentService } from './adjustment.service';

describe('AdjustmentService', () => {
  let service: AdjustmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdjustmentService],
    }).compile();

    service = module.get<AdjustmentService>(AdjustmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
