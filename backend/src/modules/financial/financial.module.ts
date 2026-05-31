import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { TenantModule } from '../../tenant/tenant.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TenantModule, NotificationModule],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
