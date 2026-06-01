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
exports.PortalFinancialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const tenant_module_1 = require("../../../tenant/tenant.module");
let PortalFinancialService = class PortalFinancialService {
    globalPrisma;
    constructor(globalPrisma) {
        this.globalPrisma = globalPrisma;
    }
    async findAll(tenantSlug, customerId) {
        const tenant = await this.globalPrisma.client.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant || !tenant.schema) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        const tenantPrisma = await (0, tenant_module_1.getTenantClient)(tenant.schema);
        return tenantPrisma.receivable.findMany({
            where: { customerId },
            orderBy: { dueDate: 'desc' },
            include: {
                contract: {
                    select: {
                        id: true,
                        product: { select: { name: true } },
                    }
                }
            }
        });
    }
};
exports.PortalFinancialService = PortalFinancialService;
exports.PortalFinancialService = PortalFinancialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortalFinancialService);
//# sourceMappingURL=portal-financial.service.js.map