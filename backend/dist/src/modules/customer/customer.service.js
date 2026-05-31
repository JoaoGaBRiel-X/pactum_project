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
exports.CustomerService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../tenant/tenant.module");
let CustomerService = class CustomerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCustomerDto, userId) {
        const { contacts = [], partners, ...dtoRest } = createCustomerDto;
        const { email, phone, ...customerData } = dtoRest;
        if (email || phone) {
            contacts.push({
                name: 'Contato Principal',
                email: email || '',
                phone: phone || '',
            });
        }
        try {
            const customer = await this.prisma.customer.create({
                data: {
                    ...customerData,
                    createdBy: userId,
                    contacts: contacts.length > 0 ? {
                        create: contacts.map(c => ({ ...c, createdBy: userId }))
                    } : undefined,
                    partners: partners && partners.length > 0 ? {
                        create: partners.map(p => ({ ...p, createdBy: userId }))
                    } : undefined,
                },
                include: {
                    contacts: true,
                    partners: true,
                }
            });
            return customer;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Já existe um cliente cadastrado com este CNPJ neste tenant.');
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.customer.findMany({
            include: {
                contacts: true,
                corporateGroup: true,
            }
        });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                contacts: true,
                partners: true,
                corporateGroup: true,
            }
        });
        if (!customer) {
            throw new common_1.NotFoundException('Cliente não encontrado.');
        }
        return customer;
    }
    async update(id, updateCustomerDto, userId) {
        await this.findOne(id);
        const { contacts, partners, ...dtoRest } = updateCustomerDto;
        const { email, phone, ...customerData } = dtoRest;
        const finalContacts = contacts || [];
        if (email || phone) {
            finalContacts.push({
                name: 'Contato Principal',
                email: email || '',
                phone: phone || '',
            });
        }
        try {
            const customer = await this.prisma.customer.update({
                where: { id },
                data: {
                    ...customerData,
                    updatedBy: userId,
                    contacts: finalContacts.length >= 0 && contacts !== undefined ? {
                        deleteMany: {},
                        create: finalContacts.map(c => ({ ...c, createdBy: userId, updatedBy: userId }))
                    } : undefined,
                    partners: partners !== undefined ? {
                        deleteMany: {},
                        create: partners.map(p => ({ ...p, createdBy: userId, updatedBy: userId }))
                    } : undefined,
                },
                include: {
                    contacts: true,
                    partners: true,
                }
            });
            return customer;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Já existe um cliente cadastrado com este CNPJ neste tenant.');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        try {
            await this.prisma.customer.delete({
                where: { id }
            });
            return { message: 'Cliente excluído com sucesso.' };
        }
        catch (error) {
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Não é possível excluir este cliente, pois existem contratos ou registros vinculados a ele.');
            }
            throw error;
        }
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], CustomerService);
//# sourceMappingURL=customer.service.js.map