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
exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../tenant/tenant.module");
let ProductService = class ProductService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto, userId) {
        const { modules, ...productData } = createProductDto;
        return this.prisma.softwareProduct.create({
            data: {
                ...productData,
                createdBy: userId,
                modules: modules ? {
                    create: modules.map(m => ({ ...m, createdBy: userId }))
                } : undefined,
            },
            include: {
                modules: true,
            }
        });
    }
    async findAll() {
        return this.prisma.softwareProduct.findMany({
            include: {
                modules: true,
            }
        });
    }
    async findOne(id) {
        const product = await this.prisma.softwareProduct.findUnique({
            where: { id },
            include: {
                modules: true,
            }
        });
        if (!product) {
            throw new common_1.NotFoundException('Produto não encontrado.');
        }
        return product;
    }
    async update(id, updateProductDto, userId) {
        const currentProduct = await this.findOne(id);
        const { modules, ...productData } = updateProductDto;
        if (modules !== undefined) {
            const incomingModuleIds = modules.filter(m => m.id).map(m => m.id);
            const modulesToInactivate = currentProduct.modules
                .filter(m => m.isActive && !incomingModuleIds.includes(m.id))
                .map(m => m.id);
            const modulesToCreate = modules.filter(m => !m.id);
            const modulesToUpdate = modules.filter(m => m.id);
            return this.prisma.softwareProduct.update({
                where: { id },
                data: {
                    ...productData,
                    updatedBy: userId,
                    modules: {
                        create: modulesToCreate.map(m => ({
                            name: m.name,
                            description: m.description,
                            price: m.price,
                            createdBy: userId,
                            updatedBy: userId,
                        })),
                        update: modulesToUpdate.map(m => ({
                            where: { id: m.id },
                            data: {
                                name: m.name,
                                description: m.description,
                                price: m.price,
                                isActive: true,
                                updatedBy: userId,
                            }
                        })),
                        updateMany: modulesToInactivate.length > 0 ? {
                            where: { id: { in: modulesToInactivate } },
                            data: { isActive: false, updatedBy: userId }
                        } : undefined
                    }
                },
                include: {
                    modules: true,
                }
            });
        }
        return this.prisma.softwareProduct.update({
            where: { id },
            data: {
                ...productData,
                updatedBy: userId,
            },
            include: {
                modules: true,
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        try {
            await this.prisma.softwareProduct.delete({
                where: { id }
            });
            return { message: 'Produto excluído com sucesso.' };
        }
        catch (error) {
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Não é possível excluir este produto, pois existem contratos vinculados a ele.');
            }
            throw error;
        }
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ProductService);
//# sourceMappingURL=product.service.js.map