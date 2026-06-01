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
exports.CorporateGroupService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../tenant/tenant.module");
let CorporateGroupService = class CorporateGroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCorporateGroupDto, userId) {
        return this.prisma.corporateGroup.create({
            data: {
                ...createCorporateGroupDto,
                createdBy: userId,
            },
        });
    }
    async findAll() {
        return this.prisma.corporateGroup.findMany({
            include: {
                _count: {
                    select: { customers: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const group = await this.prisma.corporateGroup.findUnique({
            where: { id },
            include: {
                customers: {
                    select: {
                        id: true,
                        corporateName: true,
                        document: true
                    }
                }
            }
        });
        if (!group) {
            throw new common_1.NotFoundException('Grupo Econômico não encontrado.');
        }
        return group;
    }
    async update(id, updateCorporateGroupDto, userId) {
        await this.findOne(id);
        return this.prisma.corporateGroup.update({
            where: { id },
            data: {
                ...updateCorporateGroupDto,
                updatedBy: userId,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        try {
            await this.prisma.corporateGroup.delete({
                where: { id }
            });
            return { message: 'Grupo Econômico excluído com sucesso.' };
        }
        catch (error) {
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Não é possível excluir este grupo, pois existem clientes vinculados a ele.');
            }
            throw error;
        }
    }
    async getFinancialSummary(id) {
        await this.findOne(id);
        const contracts = await this.prisma.contract.findMany({
            where: {
                customer: { corporateGroupId: id },
                status: 'ACTIVE'
            },
            select: { totalValue: true }
        });
        const activeContractsCount = contracts.length;
        const totalActiveContractsValue = contracts.reduce((sum, c) => sum + Number(c.totalValue || 0), 0);
        const receivables = await this.prisma.receivable.findMany({
            where: {
                customer: { corporateGroupId: id },
                status: { in: ['PENDING', 'OVERDUE'] }
            },
            select: { amount: true }
        });
        const totalPendingDebt = receivables.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        return {
            activeContractsCount,
            totalActiveContractsValue,
            totalPendingDebt
        };
    }
    async linkCustomers(id, customerIds, userId) {
        await this.findOne(id);
        await this.prisma.customer.updateMany({
            where: { id: { in: customerIds } },
            data: {
                corporateGroupId: id,
                updatedBy: userId,
            }
        });
        return { message: 'Clientes vinculados com sucesso.' };
    }
    async unlinkCustomer(id, customerId, userId) {
        await this.findOne(id);
        await this.prisma.customer.update({
            where: { id: customerId },
            data: {
                corporateGroupId: null,
                updatedBy: userId,
            }
        });
        return { message: 'Cliente desvinculado com sucesso.' };
    }
};
exports.CorporateGroupService = CorporateGroupService;
exports.CorporateGroupService = CorporateGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], CorporateGroupService);
//# sourceMappingURL=corporate-group.service.js.map