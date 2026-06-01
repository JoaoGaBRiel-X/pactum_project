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
exports.TenantGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let TenantGuard = class TenantGuard {
    prisma;
    reflector;
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(jwt_auth_guard_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = request.headers['x-tenant-id'];
        if (!tenantId) {
            return true;
        }
        if (user?.role === 'API_CLIENT') {
            if (!tenantId || tenantId !== user.tenantId) {
                throw new common_1.ForbiddenException('Acesso negado para este locatário (API_CLIENT)');
            }
            request.tenantContext = {
                tenantId: user.tenantId,
                role: 'API_CLIENT'
            };
            return true;
        }
        const globalUser = await this.prisma.client.user.findUnique({
            where: { id: user.userId || user.sub },
            select: { isSuperAdmin: true }
        });
        if (globalUser?.isSuperAdmin) {
            request.tenantContext = {
                tenantId: tenantId,
                role: 'SUPERADMIN'
            };
            return true;
        }
        const userTenant = await this.prisma.client.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: user.userId,
                    tenantId: tenantId,
                }
            }
        });
        if (!userTenant) {
            throw new common_1.ForbiddenException('Usuário não tem acesso a este locatário');
        }
        request.tenantContext = {
            tenantId: userTenant.tenantId,
            role: userTenant.role
        };
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map