"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalAuthModule = void 0;
const common_1 = require("@nestjs/common");
const portal_auth_service_1 = require("./portal-auth.service");
const portal_auth_controller_1 = require("./portal-auth.controller");
const jwt_1 = require("@nestjs/jwt");
const tenant_module_1 = require("../../../tenant/tenant.module");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PortalAuthModule = class PortalAuthModule {
};
exports.PortalAuthModule = PortalAuthModule;
exports.PortalAuthModule = PortalAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_module_1.TenantModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super-secret',
                signOptions: { expiresIn: '15m' },
            }),
        ],
        controllers: [portal_auth_controller_1.PortalAuthController],
        providers: [portal_auth_service_1.PortalAuthService, prisma_service_1.PrismaService],
        exports: [portal_auth_service_1.PortalAuthService],
    })
], PortalAuthModule);
//# sourceMappingURL=portal-auth.module.js.map