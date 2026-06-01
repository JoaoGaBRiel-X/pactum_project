"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const tenant_module_1 = require("../../tenant/tenant.module");
const email_processor_1 = require("./email.processor");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_module_1.TenantModule,
            bull_1.BullModule.registerQueue({
                name: 'email',
            }),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [
            {
                provide: notification_service_1.NotificationService,
                scope: common_1.Scope.REQUEST,
                useClass: notification_service_1.NotificationService,
            },
            email_processor_1.EmailProcessor,
        ],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map