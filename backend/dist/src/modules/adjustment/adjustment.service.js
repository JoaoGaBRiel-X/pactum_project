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
var AdjustmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_module_1 = require("../../tenant/tenant.module");
const schedule_1 = require("@nestjs/schedule");
const bacen_service_1 = require("./bacen.service");
let AdjustmentService = AdjustmentService_1 = class AdjustmentService {
    prisma;
    bacen;
    logger = new common_1.Logger(AdjustmentService_1.name);
    constructor(prisma, bacen) {
        this.prisma = prisma;
        this.bacen = bacen;
    }
    async createIndex(data, userId) {
        return this.prisma.adjustmentIndex.create({
            data: { ...data, createdBy: userId }
        });
    }
    async findAllIndexes() {
        return this.prisma.adjustmentIndex.findMany({
            include: {
                rates: {
                    orderBy: { competence: 'desc' }
                }
            }
        });
    }
    async addRate(indexId, competence, accumulatedRate) {
        return this.prisma.adjustmentRate.upsert({
            where: {
                indexId_competence: {
                    indexId,
                    competence,
                }
            },
            update: { accumulatedRate },
            create: {
                indexId,
                competence,
                accumulatedRate,
            }
        });
    }
    async applyManualAdjustment(contractId, percentage, userId) {
        const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
        if (!contract)
            throw new common_1.NotFoundException('Contrato não encontrado.');
        if (contract.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Apenas contratos ativos podem ser reajustados.');
        const previousValue = Number(contract.totalValue);
        const newValue = previousValue * (1 + (percentage / 100));
        return this.prisma.$transaction(async (tx) => {
            await tx.contractAdjustment.create({
                data: {
                    contractId,
                    previousValue,
                    newValue,
                    appliedRate: percentage,
                    type: 'MANUAL',
                    reason: 'Reajuste manual / renovação',
                    appliedBy: userId,
                }
            });
            const nextDate = contract.nextAdjustmentDate ? new Date(contract.nextAdjustmentDate) : new Date();
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            const updatedContract = await tx.contract.update({
                where: { id: contractId },
                data: {
                    totalValue: newValue,
                    nextAdjustmentDate: nextDate,
                }
            });
            await tx.contractHistory.create({
                data: {
                    contractId,
                    status: updatedContract.status,
                    totalValue: updatedContract.totalValue,
                    changedBy: userId,
                    reason: `Reajuste manual de ${percentage}%`,
                    modulesPayload: { type: 'ADJUSTMENT', percentage, previousValue, newValue }
                }
            });
            return updatedContract;
        });
    }
    async handleAutomaticAdjustments() {
        this.logger.log('Iniciando processamento de reajustes automáticos...');
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        this.logger.warn('CronJob ativado, mas requer contexto de Tenant. Use a rota /adjustments/run-automatic para executar no tenant específico por enquanto.');
    }
    async runAutomaticAdjustmentsForTenant(userId) {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const eligibleContracts = await this.prisma.contract.findMany({
            where: {
                status: 'ACTIVE',
                renewalMode: 'AUTOMATIC',
                adjustmentIndexId: { not: null },
                nextAdjustmentDate: { lte: now },
            },
            include: {
                adjustmentIndex: {
                    include: {
                        rates: {
                            where: { competence: currentMonthStr }
                        }
                    }
                }
            }
        });
        let processedCount = 0;
        for (const contract of eligibleContracts) {
            const currentRate = contract.adjustmentIndex?.rates[0]?.accumulatedRate;
            if (currentRate === undefined) {
                this.logger.warn(`Contrato ${contract.id} requer reajuste pelo ${contract.adjustmentIndex?.name}, mas não há taxa para a competência ${currentMonthStr}.`);
                continue;
            }
            const percentage = Number(currentRate);
            const previousValue = Number(contract.totalValue);
            const newValue = previousValue * (1 + (percentage / 100));
            await this.prisma.$transaction(async (tx) => {
                await tx.contractAdjustment.create({
                    data: {
                        contractId: contract.id,
                        previousValue,
                        newValue,
                        appliedRate: percentage,
                        type: 'AUTOMATIC',
                        reason: `Reajuste automático - Competência ${currentMonthStr}`,
                        appliedBy: 'system',
                    }
                });
                const nextDate = new Date(contract.nextAdjustmentDate);
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                const updatedContract = await tx.contract.update({
                    where: { id: contract.id },
                    data: {
                        totalValue: newValue,
                        nextAdjustmentDate: nextDate,
                    }
                });
                await tx.contractHistory.create({
                    data: {
                        contractId: contract.id,
                        status: updatedContract.status,
                        totalValue: updatedContract.totalValue,
                        changedBy: 'system',
                        reason: `Reajuste automático de ${percentage}% aplicado (${contract.adjustmentIndex?.name})`,
                        modulesPayload: { type: 'AUTOMATIC_ADJUSTMENT', percentage, previousValue, newValue }
                    }
                });
            });
            processedCount++;
        }
        return { message: `${processedCount} contratos reajustados automaticamente.` };
    }
    async syncBacenRatesForTenant(userId) {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let processed = 0;
        const igpmIndex = await this.prisma.adjustmentIndex.findFirst({ where: { name: { equals: 'IGPM', mode: 'insensitive' } } });
        if (igpmIndex) {
            try {
                const rate = await this.bacen.fetchAccumulatedRate(189);
                await this.addRate(igpmIndex.id, currentMonthStr, rate);
                processed++;
            }
            catch (e) {
                this.logger.error('Erro ao sincronizar IGPM', e);
            }
        }
        const ipcaIndex = await this.prisma.adjustmentIndex.findFirst({ where: { name: { equals: 'IPCA', mode: 'insensitive' } } });
        if (ipcaIndex) {
            try {
                const rate = await this.bacen.fetchAccumulatedRate(433);
                await this.addRate(ipcaIndex.id, currentMonthStr, rate);
                processed++;
            }
            catch (e) {
                this.logger.error('Erro ao sincronizar IPCA', e);
            }
        }
        return { message: `${processed} índices (IGPM/IPCA) sincronizados com o Bacen para ${currentMonthStr}.` };
    }
};
exports.AdjustmentService = AdjustmentService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdjustmentService.prototype, "handleAutomaticAdjustments", null);
exports.AdjustmentService = AdjustmentService = AdjustmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        bacen_service_1.BacenService])
], AdjustmentService);
//# sourceMappingURL=adjustment.service.js.map