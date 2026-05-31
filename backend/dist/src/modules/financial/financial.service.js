"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_module_1 = require("../../tenant/tenant.module");
const notification_service_1 = require("../notification/notification.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FinancialService = class FinancialService {
    prisma;
    notificationService;
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async findAllReceivables() {
        return this.prisma.receivable.findMany({
            include: {
                customer: { select: { corporateName: true, document: true } },
                contract: { select: { id: true, status: true } },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async generateBilling(userId) {
        const activeContracts = await this.prisma.contract.findMany({
            where: { status: 'ACTIVE' },
            include: { items: true },
        });
        const now = new Date();
        const competence = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let generatedCount = 0;
        for (const contract of activeContracts) {
            const existing = await this.prisma.receivable.findFirst({
                where: {
                    contractId: contract.id,
                    competence,
                    type: 'RECURRING',
                }
            });
            if (!existing) {
                const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
                await this.prisma.receivable.create({
                    data: {
                        contractId: contract.id,
                        customerId: contract.customerId,
                        amount: contract.totalValue,
                        dueDate,
                        description: `Mensalidade - Competência ${competence}`,
                        type: 'RECURRING',
                        status: 'PENDING',
                        competence,
                        createdBy: userId,
                    }
                });
                generatedCount++;
            }
        }
        return { message: `Faturamento gerado. ${generatedCount} novos títulos criados para ${competence}.` };
    }
    async registerPayment(receivableId, amount, method, receiptBuffer, receiptName, userId) {
        const receivable = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
        if (!receivable)
            throw new common_1.NotFoundException('Conta a receber não encontrada.');
        if (receivable.status === 'PAID')
            throw new common_1.BadRequestException('Esta conta já está paga.');
        let receiptUrl = null;
        if (receiptBuffer && receiptName) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileName = `${Date.now()}-${receiptName}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, receiptBuffer);
            receiptUrl = `/uploads/receipts/${fileName}`;
        }
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    receivableId,
                    amount,
                    paymentDate: new Date(),
                    method,
                    receiptUrl,
                    createdBy: userId,
                }
            });
            const status = Number(amount) >= Number(receivable.amount) ? 'PAID' : 'PENDING';
            const updatedReceivable = await tx.receivable.update({
                where: { id: receivableId },
                data: {
                    status,
                    updatedBy: userId,
                }
            });
            if (status === 'PAID') {
                const customer = await tx.customer.findUnique({ where: { id: receivable.customerId } });
                if (customer) {
                    await tx.customer.update({
                        where: { id: customer.id },
                        data: {
                            delinquencyScore: Math.min(1000, customer.delinquencyScore + 10)
                        }
                    });
                }
            }
            return updatedReceivable;
        });
    }
    async createRenegotiation(customerId, receivableIds, discount, userId) {
        const receivables = await this.prisma.receivable.findMany({
            where: {
                id: { in: receivableIds },
                customerId,
                status: { in: ['PENDING', 'OVERDUE'] }
            }
        });
        if (receivables.length === 0) {
            throw new common_1.BadRequestException('Nenhum título válido para renegociação.');
        }
        const originalDebt = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
        const interestApplied = originalDebt * 0.05;
        const penaltyApplied = originalDebt * 0.02;
        const finalAmount = originalDebt + interestApplied + penaltyApplied - discount;
        if (finalAmount <= 0)
            throw new common_1.BadRequestException('O valor final da renegociação deve ser maior que zero.');
        return this.prisma.$transaction(async (tx) => {
            const renegotiation = await tx.debtRenegotiation.create({
                data: {
                    customerId,
                    originalDebt,
                    interestApplied,
                    penaltyApplied,
                    discount,
                    finalAmount,
                    status: 'APPROVED',
                    consolidatedReceivableIds: receivableIds,
                    createdBy: userId,
                }
            });
            await tx.receivable.updateMany({
                where: { id: { in: receivableIds } },
                data: {
                    status: 'RENEGOTIATED',
                    renegotiationId: renegotiation.id,
                    updatedBy: userId,
                }
            });
            await tx.receivable.create({
                data: {
                    customerId,
                    description: `Acordo de Renegociação #${renegotiation.id.split('-')[0]}`,
                    type: 'RENEGOTIATION',
                    amount: finalAmount,
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    status: 'PENDING',
                    renegotiationId: renegotiation.id,
                    createdBy: userId,
                }
            });
            return renegotiation;
        });
    }
    async uploadBoleto(receivableId, boletoBuffer, boletoName, userId) {
        const receivable = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
        if (!receivable)
            throw new common_1.NotFoundException('Conta a receber não encontrada.');
        const uploadDir = path.join(process.cwd(), 'uploads', 'boletos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${boletoName}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, boletoBuffer);
        const boletoUrl = `/uploads/boletos/${fileName}`;
        const updatedReceivable = await this.prisma.receivable.update({
            where: { id: receivableId },
            data: {
                boletoUrl,
                updatedBy: userId,
            },
            include: {
                customer: { include: { contacts: true } },
            }
        });
        const firstContact = updatedReceivable.customer?.contacts?.[0];
        if (firstContact?.email) {
            this.notificationService.sendNotification('NEW_BOLETO', firstContact.email, {
                customer: updatedReceivable.customer,
                receivable: updatedReceivable,
            });
        }
        return updatedReceivable;
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        notification_service_1.NotificationService])
], FinancialService);
//# sourceMappingURL=financial.service.js.map