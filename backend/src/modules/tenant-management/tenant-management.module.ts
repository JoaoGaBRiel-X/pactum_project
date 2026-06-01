import { Module } from '@nestjs/common';
import { TenantManagementController } from './tenant-management.controller';
import { TenantManagementService } from './tenant-management.service';
import { ApiKeysController } from './api-keys.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TenantManagementController, ApiKeysController],
  providers: [TenantManagementService, PrismaService],
})
export class TenantManagementModule {}
