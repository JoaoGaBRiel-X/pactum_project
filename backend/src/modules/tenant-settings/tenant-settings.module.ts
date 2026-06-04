import { Module as NestModule } from '@nestjs/common';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSettingsService } from './tenant-settings.service';
import { TenantModule } from '../../tenant/tenant.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@NestModule({
  imports: [TenantModule, StorageModule],
  controllers: [TenantSettingsController],
  providers: [TenantSettingsService],
  exports: [TenantSettingsService],
})
export class TenantSettingsModule {}
