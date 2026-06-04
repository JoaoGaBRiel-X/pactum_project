import { Module } from '@nestjs/common';
import { StorageModule } from './infrastructure/storage/storage.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './tenant/tenant.module';
import { IamModule } from './iam/iam.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ProductModule } from './modules/product/product.module';
import { AuditModule } from './modules/audit/audit.module';
import { ContractModule } from './modules/contract/contract.module';
import { FinancialModule } from './modules/financial/financial.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdjustmentModule } from './modules/adjustment/adjustment.module';
import { DocumentModule } from './modules/document/document.module';
import { TenantManagementModule } from './modules/tenant-management/tenant-management.module';
import { CorporateGroupModule } from './modules/corporate-group/corporate-group.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PortalAuthModule } from './modules/portal/auth/portal-auth.module';
import { PortalFinancialModule } from './modules/portal/financial/portal-financial.module';
import { PublicApiModule } from './modules/public-api/public-api.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { TenantSettingsModule } from './modules/tenant-settings/tenant-settings.module';
import { ProductGroupModule } from './modules/product-group/product-group.module';
import { RoleProfileModule } from './modules/role-profile/role-profile.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    TenantModule, 
    IamModule, 
    CustomerModule, 
    ProductModule, 
    ProductGroupModule,
    AuditModule, 
    ContractModule,
    FinancialModule,
    AdjustmentModule,
    TenantManagementModule,
    DocumentModule,
    CorporateGroupModule,
    NotificationModule,
    PortalAuthModule,
    PortalFinancialModule,
    PublicApiModule,
    DashboardModule,
    TenantSettingsModule,
    StorageModule,
    MailModule,
    UserManagementModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    RoleProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
