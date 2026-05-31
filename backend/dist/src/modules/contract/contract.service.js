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
                customer: true,
                product: { include: { modules: true } },
                items: true,
                history: {
                    orderBy: { changedAt: 'desc' }
                },
            }
        });
    }
    async update(id, updateDto, userId) {
        const contract = await this.prisma.contract.findUnique({ where: { id }, include: { items: true } });
        if (!contract)
            throw new common_1.NotFoundException('Contrato não encontrado.');
        if (contract.status !== 'DRAFT')
            throw new common_1.BadRequestException('Apenas contratos em rascunho podem ser alterados diretamente.');
        return this.prisma.$transaction(async (tx) => {
            let totalValue = Number(contract.totalValue);
            let globalDiscount = updateDto.globalDiscount !== undefined ? updateDto.globalDiscount : Number(contract.globalDiscount);
            let historyPayloadItems = [];
            const contractItemsData = [];
            if (updateDto.items && updateDto.items.length > 0) {
                totalValue = 0;
                const product = await tx.softwareProduct.findUnique({
                    where: { id: updateDto.productId || contract.productId },
                    include: { modules: true }
                });
                if (!product)
                    throw new common_1.NotFoundException('Produto não encontrado.');
                for (const item of updateDto.items) {
                    const module = product.modules.find(m => m.id === item.moduleId);
                    if (!module)
                        throw new common_1.BadRequestException(`Módulo ${item.moduleId} não encontrado no produto.`);
                    const unitPrice = Number(module.price);
                    const discount = item.discount || 0;
                    const itemTotal = (unitPrice - discount) * item.quantity;
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
                    throw new common_1.BadRequestException('Desconto global maior que o valor total.');
                await tx.contractItem.deleteMany({ where: { contractId: id } });
            }
            else {
                if (updateDto.globalDiscount !== undefined) {
                    const items = await tx.contractItem.findMany({ where: { contractId: id } });
                    totalValue = items.reduce((acc, it) => acc + ((Number(it.unitPrice) - Number(it.discount)) * it.quantity), 0);
                    totalValue -= globalDiscount;
                }
            }
            const updatedContract = await tx.contract.update({
                where: { id },
                data: {
                    customerId: updateDto.customerId,
                    productId: updateDto.productId,
                    globalDiscount,
                    totalValue,
                    renewalMode: updateDto.renewalMode,
                    updatedBy: userId,
                    ...(contractItemsData.length > 0 && {
                        items: { create: contractItemsData }
                    })
                },
                include: { items: true }
            });
            await tx.contractHistory.create({
                data: {
                    contractId: id,
                    status: updatedContract.status,
                    totalValue: totalValue,
                    changedBy: userId,
                    reason: 'Atualização do rascunho',
                    modulesPayload: {
                        globalDiscount,
                        items: historyPayloadItems.length > 0 ? historyPayloadItems : undefined,
                    },
                }
            });
            return updatedContract;
        });
    }
    async updateStatus(id, updateStatusDto, userId) {
        const { status, reason } = updateStatusDto;
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!contract)
            throw new common_1.NotFoundException('Contrato não encontrado.');
        const currentStatus = contract.status;
        const invalidTransition = () => new common_1.BadRequestException(`Transição de status inválida: ${currentStatus} -> ${status}`);
        if (currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') {
            throw new common_1.BadRequestException(`Contrato não pode ser alterado a partir do status ${currentStatus}`);
        }
        if (status === 'ACTIVE' && currentStatus === 'DRAFT') {
        }
        let startDate = contract.startDate;
        let endDate = contract.endDate;
        if (status === 'ACTIVE' && !startDate) {
            startDate = new Date();
            endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedContract = await tx.contract.update({
                where: { id },
                data: {
                    status,
                    updatedBy: userId,
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                },
            });
            const items = await tx.contractItem.findMany({ where: { contractId: id } });
            const modulesPayload = {
                globalDiscount: Number(contract.globalDiscount),
                items: items.map(it => ({
                    moduleId: it.moduleId,
                    quantity: it.quantity,
                    unitPrice: Number(it.unitPrice),
                    discount: Number(it.discount),
                }))
            };
            await tx.contractHistory.create({
                data: {
                    contractId: id,
                    status,
                    totalValue: contract.totalValue,
                    changedBy: userId,
                    reason,
                    modulesPayload,
                }
            });
            return updatedContract;
        });
    }
    async remove(id) {
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            select: { status: true }
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contrato não encontrado.');
        }
        if (contract.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Apenas contratos em rascunho podem ser excluídos.');
        }
        await this.prisma.contract.delete({
            where: { id }
        });
        return { message: 'Contrato excluído com sucesso.' };
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ContractService);
//# sourceMappingURL=contract.service.js.map