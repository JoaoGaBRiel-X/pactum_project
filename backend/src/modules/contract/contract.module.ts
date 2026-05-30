import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { DocumentService } from './document/document.service';

@Module({
  providers: [ContractService, DocumentService],
  controllers: [ContractController]
})
export class ContractModule {}
