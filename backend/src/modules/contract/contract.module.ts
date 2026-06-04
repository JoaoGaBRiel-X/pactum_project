import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { ContractCronService } from './contract-cron.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [ContractService, ContractCronService],
  controllers: [ContractController]
})
export class ContractModule {}
