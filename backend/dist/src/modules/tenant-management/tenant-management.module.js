"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_management_controller_1 = require("./tenant-management.controller");
const tenant_management_service_1 = require("./tenant-management.service");
const api_keys_controller_1 = require("./api-keys.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
let TenantManagementModule = class TenantManagementModule {
};
exports.TenantManagementModule = TenantManagementModule;
exports.TenantManagementModule = TenantManagementModule = __decorate([
    (0, common_1.Module)({
        controllers: [tenant_management_controller_1.TenantManagementController, api_keys_controller_1.ApiKeysController],
        providers: [tenant_management_service_1.TenantManagementService, prisma_service_1.PrismaService],
    })
], TenantManagementModule);
//# sourceMappingURL=tenant-management.module.js.map