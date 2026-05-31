import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TenantModule, 
    IamModule, 
    CustomerModule, 
    ProductModule, 
    AuditModule, 
    ContractModule,
    FinancialModule,
    AdjustmentModule,
    TenantManagementModule,
    DocumentModule
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
