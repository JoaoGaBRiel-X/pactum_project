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
exports.ProductGroupService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_module_1 = require("../../tenant/tenant.module");
let ProductGroupService = class ProductGroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductGroupDto, userId) {
        return this.prisma.productGroup.create({
            data: {
                ...createProductGroupDto,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }
    async findAll() {
        return this.prisma.productGroup.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async findOne(id) {
        const group = await this.prisma.productGroup.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        modules: true,
                        contracts: {
                            where: { status: 'ACTIVE' },
                            include: {
                                items: true
                            }
                        }
                    }
                },
            }
        });
        if (!group) {
            throw new common_1.NotFoundException('Grupo de Produtos não encontrado.');
        }
        return group;
    }
    async update(id, updateProductGroupDto, userId) {
        await this.findOne(id);
        return this.prisma.productGroup.update({
            where: { id },
            data: {
                ...updateProductGroupDto,
                updatedBy: userId,
            },
        });
    }
    async remove(id) {
        const group = await this.findOne(id);
        if (group.products && group.products.length > 0) {
            throw new common_1.BadRequestException('Não é possível excluir o grupo de produtos pois ele possui produtos vinculados.');
        }
        return this.prisma.productGroup.delete({
            where: { id },
        });
    }
};
exports.ProductGroupService = ProductGroupService;
exports.ProductGroupService = ProductGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ProductGroupService);
//# sourceMappingURL=product-group.service.js.map