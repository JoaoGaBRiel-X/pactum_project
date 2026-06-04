import { Test, TestingModule } from '@nestjs/testing';
import { AdjustmentController } from './adjustment.controller';
import { AdjustmentService } from './adjustment.service';

describe('AdjustmentController', () => {
  let controller: AdjustmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdjustmentController],
      providers: [{ provide: AdjustmentService, useValue: {} }],
    }).compile();

    controller = module.get<AdjustmentController>(AdjustmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
