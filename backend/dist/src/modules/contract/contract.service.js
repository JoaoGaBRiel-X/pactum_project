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
exports.ContractService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../tenant/tenant.module");
let ContractService = class ContractService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, userId) {
        const { customerId, productId, items, globalDiscount = 0, renewalMode = 'AUTOMATIC' } = createDto;
        const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Cliente não encontrado.');
        const product = await this.prisma.softwareProduct.findUnique({
            where: { id: productId },
            include: { modules: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Produto não encontrado.');
        let totalValue = 0;
        const contractItemsData = [];
        const historyPayloadItems = [];
        for (const item of items) {
            const module = product.modules.find(m => m.id === item.moduleId);
            if (!module)
                throw new common_1.BadRequestException(`Módulo ${item.moduleId} não pertence a este produto.`);
            if (!module.isActive)
                throw new common_1.BadRequestException(`Módulo ${module.name} está inativo.`);
            const unitPrice = Number(module.price);
            const discount = item.discount || 0;
            const itemTotal = (unitPrice - discount) * item.quantity;
            if (itemTotal < 0)
                throw new common_1.BadRequestException(`Desconto maior que o preço no módulo ${module.name}`);
            totalValue += itemTotal;
            contractItemsData.push({
                moduleId: item.moduleId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                discount: discount,
            });
            historyPayloadItems.push({
                moduleId: item.moduleId,
                moduleName: module.name,
                quantity: item.quantity,
                unitPrice: unitPrice,
                discount: discount,
            });
        }
        totalValue -= globalDiscount;
        if (totalValue < 0)
            throw new common_1.BadRequestException('Desconto global maior que o valor total do contrato.');
        return this.prisma.$transaction(async (tx) => {
            const contract = await tx.contract.create({
                data: {
                    customerId,
                    productId,
                    globalDiscount,
                    totalValue,
                    renewalMode,
                    status: 'DRAFT',
                    createdBy: userId,
                    items: {
                        create: contractItemsData,
                    },
                },
                include: {
                    items: true,
                }
            });
            await tx.contractHistory.create({
                data: {
                    contractId: contract.id,
                    status: 'DRAFT',
                    totalValue: totalValue,
                    changedBy: userId,
                    reason: 'Criação do contrato',
                    modulesPayload: {
                        globalDiscount,
                        items: historyPayloadItems,
                    },
                }
            });
            return contract;
        });
    }
    async findAll() {
        return this.prisma.contract.findMany({
            include: {
                items: true,
                customer: { select: { corporateName: true, document: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        return this.prisma.contract.findUnique({
            where: { id },
            include: {
                items: true,
                history: {
                    orderBy: { changedAt: 'desc' }
                },
            }
        });
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ContractService);
//# sourceMappingURL=contract.service.js.map