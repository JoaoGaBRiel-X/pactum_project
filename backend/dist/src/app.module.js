"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const audit_interceptor_1 = require("./modules/audit/audit.interceptor");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const tenant_module_1 = require("./tenant/tenant.module");
const iam_module_1 = require("./iam/iam.module");
const customer_module_1 = require("./modules/customer/customer.module");
const product_module_1 = require("./modules/product/product.module");
const audit_module_1 = require("./modules/audit/audit.module");
const contract_module_1 = require("./modules/contract/contract.module");
const financial_module_1 = require("./modules/financial/financial.module");
const schedule_1 = require("@nestjs/schedule");
const adjustment_module_1 = require("./modules/adjustment/adjustment.module");
const document_module_1 = require("./modules/document/document.module");
const tenant_management_module_1 = require("./modules/tenant-management/tenant-management.module");
const corporate_group_module_1 = require("./modules/corporate-group/corporate-group.module");
const notification_module_1 = require("./modules/notification/notification.module");
const portal_auth_module_1 = require("./modules/portal/auth/portal-auth.module");
const portal_financial_module_1 = require("./modules/portal/financial/portal-financial.module");
const public_api_module_1 = require("./modules/public-api/public-api.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const bull_1 = require("@nestjs/bull");
const throttler_1 = require("@nestjs/throttler");
const tenant_settings_module_1 = require("./modules/tenant-settings/tenant-settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                },
            }),
            tenant_module_1.TenantModule,
            iam_module_1.IamModule,
            customer_module_1.CustomerModule,
            product_module_1.ProductModule,
            audit_module_1.AuditModule,
            contract_module_1.ContractModule,
            financial_module_1.FinancialModule,
            adjustment_module_1.AdjustmentModule,
            tenant_management_module_1.TenantManagementModule,
            document_module_1.DocumentModule,
            corporate_group_module_1.CorporateGroupModule,
            notification_module_1.NotificationModule,
            portal_auth_module_1.PortalAuthModule,
            portal_financial_module_1.PortalFinancialModule,
            public_api_module_1.PublicApiModule,
            dashboard_module_1.DashboardModule,
            tenant_settings_module_1.TenantSettingsModule,
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 60,
                }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map