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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_module_1 = require("../../tenant/tenant.module");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics() {
        const activeContracts = await this.prisma.contract.findMany({
            where: { status: 'ACTIVE' },
            select: { totalValue: true },
        });
        const activeContractsCount = activeContracts.length;
        const mrr = activeContracts.reduce((sum, contract) => sum + Number(contract.totalValue), 0);
        const overdueReceivables = await this.prisma.receivable.findMany({
            where: { status: 'OVERDUE' },
            select: { amount: true },
        });
        const overdueAmount = overdueReceivables.reduce((sum, rec) => sum + Number(rec.amount), 0);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const churnedContractsThisMonth = await this.prisma.contractHistory.count({
            where: {
                status: 'CANCELLED',
                changedAt: { gte: startOfMonth },
            },
        });
        const churnRate = activeContractsCount > 0
            ? (churnedContractsThisMonth / (activeContractsCount + churnedContractsThisMonth)) * 100
            : 0;
        return {
            activeContracts: activeContractsCount,
            mrr,
            overdueAmount,
            churnRate: Number(churnRate.toFixed(2)),
        };
    }
    async getUpcomingRenewals() {
        const today = new Date();
        const in60Days = new Date();
        in60Days.setDate(today.getDate() + 60);
        return this.prisma.contract.findMany({
            where: {
                status: 'ACTIVE',
                endDate: {
                    gte: today,
                    lte: in60Days,
                },
            },
            include: {
                customer: { select: { corporateName: true, document: true } },
                product: { select: { name: true } },
            },
            orderBy: { endDate: 'asc' },
            take: 5,
        });
    }
    async getRecentOverdue() {
        return this.prisma.receivable.findMany({
            where: { status: 'OVERDUE' },
            include: {
                customer: { select: { corporateName: true, document: true } },
            },
            orderBy: { dueDate: 'asc' },
            take: 5,
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map