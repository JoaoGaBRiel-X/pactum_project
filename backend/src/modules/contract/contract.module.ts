import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { DocumentService } from './document/document.service';
import { ContractCronService } from './contract-cron.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [ContractService, DocumentService, ContractCronService],
  controllers: [ContractController]
})
export class ContractModule {}
