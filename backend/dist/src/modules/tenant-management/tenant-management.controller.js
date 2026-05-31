"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementController = void 0;
const common_1 = require("@nestjs/common");
const tenant_management_service_1 = require("./tenant-management.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const swagger_1 = require("@nestjs/swagger");
const backoffice_guard_1 = require("../../iam/guards/backoffice.guard");
const public_decorator_1 = require("../../iam/decorators/public.decorator");
let TenantManagementController = class TenantManagementController {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async create(createDto) {
        return this.tenantService.createTenant(createDto);
    }
    async findAll() {
        return this.tenantService.listTenants();
    }
    async findOne(id) {
        return this.tenantService.getTenant(id);
    }
    async update(id, updateDto) {
        return this.tenantService.updateTenant(id, updateDto);
    }
};
exports.TenantManagementController = TenantManagementController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantManagementController.prototype, "update", null);
exports.TenantManagementController = TenantManagementController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Management'),
    (0, common_1.Controller)('tenants'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(backoffice_guard_1.BackofficeGuard),
    (0, swagger_1.ApiSecurity)('x-api-key'),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService])
], TenantManagementController);
//# sourceMappingURL=tenant-management.controller.js.map