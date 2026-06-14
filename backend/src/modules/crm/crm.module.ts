import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { PrismaCrmRepository } from './repositories/prisma-crm.repository';
import { CRM_REPOSITORY } from './repositories/crm.repository.interface';

@Module({
  controllers: [CrmController],
  providers: [
    CrmService,
    {
      provide: CRM_REPOSITORY,
      useClass: PrismaCrmRepository,
    }
  ]
})
export class CrmModule {}
