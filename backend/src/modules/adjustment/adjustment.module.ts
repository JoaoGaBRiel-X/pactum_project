import { Module } from '@nestjs/common';
import { AdjustmentController } from './adjustment.controller';
import { AdjustmentService } from './adjustment.service';
import { BacenService } from './bacen.service';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [AdjustmentController],
  providers: [AdjustmentService, BacenService],
  exports: [AdjustmentService, BacenService]
})
export class AdjustmentModule {}
