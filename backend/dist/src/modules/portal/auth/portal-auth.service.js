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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const tenant_module_1 = require("../../../tenant/tenant.module");
const jwt_1 = require("@nestjs/jwt");
let PortalAuthService = class PortalAuthService {
    globalPrisma;
    jwtService;
    constructor(globalPrisma, jwtService) {
        this.globalPrisma = globalPrisma;
        this.jwtService = jwtService;
    }
    async login(tenantSlug, email, passwordString) {
        const tenant = await this.globalPrisma.client.tenant.findUnique({
            where: { schema: tenantSlug },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        if (!tenant.schema) {
            throw new common_1.UnauthorizedException('Configuração da empresa inválida');
        }
        const tenantPrisma = await (0, tenant_module_1.getTenantClient)(tenant.schema);
        const contact = await tenantPrisma.contact.findFirst({
            where: { email },
        });
        if (!contact) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!contact.portalAccess) {
            throw new common_1.UnauthorizedException('Este contato não possui acesso ao portal. Fale com seu gestor.');
        }
        if (contact.passwordHash !== passwordString) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = {
            sub: contact.id,
            email: contact.email,
            role: 'CUSTOMER',
            tenantId: tenant.id,
            tenantSlug: tenant.schema,
            customerId: contact.customerId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                role: 'CUSTOMER',
                tenantId: tenant.id,
            }
        };
    }
    async setPassword(tenantSlug, contactId, passwordString) {
        const tenant = await this.globalPrisma.client.tenant.findUnique({
            where: { schema: tenantSlug },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Empresa não encontrada');
        const tenantPrisma = await (0, tenant_module_1.getTenantClient)(tenant.schema);
        const contact = await tenantPrisma.contact.update({
            where: { id: contactId },
            data: {
                passwordHash: passwordString,
                portalAccess: true,
            }
        });
        return { message: 'Senha definida com sucesso', contactId: contact.id };
    }
};
exports.PortalAuthService = PortalAuthService;
exports.PortalAuthService = PortalAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], PortalAuthService);
//# sourceMappingURL=portal-auth.service.js.map