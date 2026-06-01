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
var TenantSettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSettingsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../tenant/tenant.module");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let TenantSettingsService = TenantSettingsService_1 = class TenantSettingsService {
    tenantClient;
    prismaService;
    logger = new common_1.Logger(TenantSettingsService_1.name);
    constructor(tenantClient, prismaService) {
        this.tenantClient = tenantClient;
        this.prismaService = prismaService;
    }
    async getSettings(tenantId) {
        const publicTenant = await this.prismaService.client.tenant.findUnique({
            where: { id: tenantId },
            select: { name: true, tradeName: true, document: true, legalRepName: true, legalRepCpf: true, slug: true }
        });
        let settings = await this.tenantClient.tenantSetting.findFirst();
        if (!settings) {
            settings = await this.tenantClient.tenantSetting.create({
                data: {
                    primaryColor: '#1E40AF',
                }
            });
        }
        return { ...settings, ...publicTenant };
    }
    async updateSettings(tenantId, dto) {
        const { name, tradeName, document, legalRepName, legalRepCpf, slug, ...settingsData } = dto;
        if (slug) {
            const existing = await this.prismaService.client.tenant.findUnique({
                where: { slug }
            });
            if (existing && existing.id !== tenantId) {
                throw new Error('Este domínio já está em uso por outra empresa. Tente outro nome de domínio.');
            }
        }
        if (name || tradeName || document || slug !== undefined || legalRepName !== undefined || legalRepCpf !== undefined) {
            await this.prismaService.client.tenant.update({
                where: { id: tenantId },
                data: {
                    ...(name && { name }),
                    ...(tradeName && { tradeName }),
                    ...(document && { document }),
                    ...(slug !== undefined && { slug }),
                    ...(legalRepName !== undefined && { legalRepName }),
                    ...(legalRepCpf !== undefined && { legalRepCpf })
                }
            });
        }
        let settings = await this.tenantClient.tenantSetting.findFirst();
        if (!settings) {
            settings = await this.tenantClient.tenantSetting.create({
                data: settingsData,
            });
        }
        else {
            settings = await this.tenantClient.tenantSetting.update({
                where: { id: settings.id },
                data: settingsData,
            });
        }
        const updatedPublicTenant = await this.prismaService.client.tenant.findUnique({
            where: { id: tenantId },
            select: { name: true, tradeName: true, document: true, legalRepName: true, legalRepCpf: true, slug: true }
        });
        return { ...settings, ...updatedPublicTenant };
    }
};
exports.TenantSettingsService = TenantSettingsService;
exports.TenantSettingsService = TenantSettingsService = TenantSettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        prisma_service_1.PrismaService])
], TenantSettingsService);
//# sourceMappingURL=tenant-settings.service.js.map