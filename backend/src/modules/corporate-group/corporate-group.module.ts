import { Module } from '@nestjs/common';
import { CorporateGroupService } from './corporate-group.service';
import { CorporateGroupController } from './corporate-group.controller';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [CorporateGroupController],
  providers: [CorporateGroupService],
  exports: [CorporateGroupService],
})
export class CorporateGroupModule {}
