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
const portal_auth_service_1 = require("../portal/auth/portal-auth.service");
let CustomerService = class CustomerService {
    prisma;
    portalAuthService;
    constructor(prisma, portalAuthService) {
        this.prisma = prisma;
        this.portalAuthService = portalAuthService;
    }
    async create(createCustomerDto, userId) {
        const { contacts = [], partners, legalRepresentatives, ...dtoRest } = createCustomerDto;
        const { email, phone, ...customerData } = dtoRest;
        if (email || phone) {
            contacts.push({
                name: 'Contato Principal',
                email: email || '',
                phone: phone || '',
            });
        }
        if (customerData.corporateGroupId) {
            const group = await this.prisma.corporateGroup.findUnique({ where: { id: customerData.corporateGroupId } });
            if (!group)
                throw new common_1.NotFoundException('Grupo Econômico não encontrado.');
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
                    legalRepresentatives: legalRepresentatives && legalRepresentatives.length > 0 ? {
                        create: legalRepresentatives.map(lr => ({ ...lr, createdBy: userId }))
                    } : undefined,
                },
                include: {
                    contacts: true,
                    partners: true,
                    legalRepresentatives: true,
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
                contracts: {
                    select: {
                        status: true
                    }
                }
            }
        });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                contacts: true,
                partners: true,
                legalRepresentatives: true,
                corporateGroup: true,
                contracts: {
                    include: {
                        product: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!customer) {
            throw new common_1.NotFoundException('Cliente não encontrado.');
        }
        return customer;
    }
    async update(id, updateCustomerDto, userId, tenantSlug) {
        const existingCustomer = await this.findOne(id);
        if (updateCustomerDto.document && updateCustomerDto.document !== existingCustomer.document) {
            if (existingCustomer.contracts && existingCustomer.contracts.length > 0) {
                throw new common_1.BadRequestException('Não é permitido alterar o CNPJ de um cliente que já possui contratos vinculados, pois isso descaracteriza o cliente.');
            }
        }
        const { contacts, partners, legalRepresentatives, ...dtoRest } = updateCustomerDto;
        const { email, phone, ...customerData } = dtoRest;
        const finalContacts = contacts || [];
        if (email || phone) {
            finalContacts.push({
                name: 'Contato Principal',
                email: email || '',
                phone: phone || '',
            });
        }
        if (customerData.corporateGroupId) {
            const group = await this.prisma.corporateGroup.findUnique({ where: { id: customerData.corporateGroupId } });
            if (!group)
                throw new common_1.NotFoundException('Grupo Econômico não encontrado.');
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
                    legalRepresentatives: legalRepresentatives !== undefined ? {
                        deleteMany: {},
                        create: legalRepresentatives.map(lr => ({ ...lr, createdBy: userId, updatedBy: userId }))
                    } : undefined,
                },
                include: {
                    contacts: true,
                    partners: true,
                    legalRepresentatives: true,
                }
            });
            if (tenantSlug && contacts && contacts.length > 0) {
                for (const c of customer.contacts) {
                    const oldContact = existingCustomer.contacts.find((oc) => oc.email === c.email);
                    if (c.portalAccess && (!oldContact || !oldContact.portalAccess)) {
                        try {
                            await this.portalAuthService.generateSetupToken(tenantSlug, c.id, c.email);
                        }
                        catch (e) {
                            console.error(`Falha ao disparar magic link para ${c.email}:`, e.message);
                        }
                    }
                }
            }
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
    __metadata("design:paramtypes", [client_1.PrismaClient,
        portal_auth_service_1.PortalAuthService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map