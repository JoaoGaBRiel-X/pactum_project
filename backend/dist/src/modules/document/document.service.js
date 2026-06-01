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
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_module_1 = require("../../tenant/tenant.module");
const gotenberg_service_1 = require("./gotenberg.service");
const template_service_1 = require("./template.service");
const clicksign_service_1 = require("./clicksign.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let DocumentService = DocumentService_1 = class DocumentService {
    prisma;
    globalPrisma;
    gotenberg;
    template;
    clicksign;
    logger = new common_1.Logger(DocumentService_1.name);
    constructor(prisma, globalPrisma, gotenberg, template, clicksign) {
        this.prisma = prisma;
        this.globalPrisma = globalPrisma;
        this.gotenberg = gotenberg;
        this.template = template;
        this.clicksign = clicksign;
    }
    async getTemplates() {
        return this.prisma.documentTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async generateContractDocument(contractId, templateId, userId, tenantId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                customer: {
                    include: {
                        contacts: true,
                    }
                },
                product: true,
                items: true,
            }
        });
        if (!contract)
            throw new common_1.NotFoundException('Contrato não encontrado');
        const template = await this.prisma.documentTemplate.findUnique({
            where: { id: templateId }
        });
        if (!template)
            throw new common_1.NotFoundException('Template não encontrado');
        let tenantInfo = { name: 'Locatário Padrão', document: '00.000.000/0000-00', legalRepName: 'Administrador Padrão', legalRepCpf: '000.000.000-00' };
        if (tenantId) {
            const globalTenant = await this.globalPrisma.client.tenant.findUnique({ where: { id: tenantId } });
            if (globalTenant) {
                tenantInfo = {
                    name: globalTenant.name,
                    document: globalTenant.document,
                    legalRepName: globalTenant.legalRepName || 'Administrador',
                    legalRepCpf: globalTenant.legalRepCpf || '000.000.000-00'
                };
            }
        }
        let templateBuffer;
        try {
            templateBuffer = await fs.readFile(template.path);
        }
        catch (e) {
            throw new Error(`Não foi possível ler o arquivo do template: ${template.path}`);
        }
        const viewData = {
            tenant: {
                name: tenantInfo.name,
                document: tenantInfo.document,
                legalRepName: tenantInfo.legalRepName,
                legalRepCpf: tenantInfo.legalRepCpf,
            },
            customer: {
                corporateName: contract.customer.corporateName,
                tradeName: contract.customer.tradeName || contract.customer.corporateName,
                document: contract.customer.document,
                address: contract.customer.street
                    ? `${contract.customer.street}, ${contract.customer.number || 'S/N'} - ${contract.customer.neighborhood} - ${contract.customer.city}/${contract.customer.state}`
                    : 'Endereço não informado',
                contactName: contract.customer.contacts?.[0]?.name || 'Representante não informado',
                contactCpf: contract.customer.contacts?.[0]?.cpf || 'CPF não informado',
            },
            contract: {
                globalDiscount: Number(contract.globalDiscount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                totalValue: Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                renewalMode: contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual',
            },
            software: {
                name: contract.product.name,
                description: contract.product.description || '',
            },
            modules: contract.items.map(item => ({
                name: item.moduleId,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                discount: Number(item.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            }))
        };
        const filledDocxBuffer = await this.template.fillTemplate(templateBuffer, viewData);
        const pdfBuffer = await this.gotenberg.convertDocxToPdf(filledDocxBuffer, 'contract.docx');
        const uploadsDir = path.resolve(__dirname, '../../../uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const outputFilename = `contract_${contractId}_${Date.now()}.pdf`;
        const outputPath = path.join(uploadsDir, outputFilename);
        await fs.writeFile(outputPath, pdfBuffer);
        const document = await this.prisma.contractDocument.create({
            data: {
                contractId: contract.id,
                type: 'PDF',
                path: outputPath,
                status: 'GENERATED',
                createdBy: userId
            }
        });
        return document;
    }
    async markAsManuallySigned(documentId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const document = await tx.contractDocument.update({
                where: { id: documentId },
                data: {
                    status: 'SIGNED',
                }
            });
            const contract = await tx.contract.findUnique({
                where: { id: document.contractId },
                include: { items: true }
            });
            if (contract && contract.status === 'PENDING_SIGNATURE' || contract?.status === 'DRAFT') {
                await tx.contract.update({
                    where: { id: contract.id },
                    data: { status: 'ACTIVE', updatedBy: userId, startDate: new Date() }
                });
                await tx.contractHistory.create({
                    data: {
                        contractId: contract.id,
                        status: 'ACTIVE',
                        totalValue: contract.totalValue,
                        changedBy: userId,
                        reason: 'Ativado via Assinatura Manual de Documento',
                        modulesPayload: {
                            globalDiscount: Number(contract.globalDiscount),
                            items: contract.items.map(it => ({
                                moduleId: it.moduleId,
                                quantity: it.quantity,
                                unitPrice: Number(it.unitPrice),
                                discount: Number(it.discount),
                            }))
                        },
                    }
                });
            }
            return document;
        });
    }
    async uploadTemplate(file, name, description, userId) {
        const uploadsDir = path.resolve(__dirname, '../../../uploads/templates');
        await fs.mkdir(uploadsDir, { recursive: true });
        const outputPath = path.join(uploadsDir, `${Date.now()}_${file.originalname}`);
        await fs.writeFile(outputPath, file.buffer);
        return this.prisma.documentTemplate.create({
            data: {
                name,
                description,
                path: outputPath,
                createdBy: userId
            }
        });
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        prisma_service_1.PrismaService,
        gotenberg_service_1.GotenbergService,
        template_service_1.TemplateService,
        clicksign_service_1.ClicksignService])
], DocumentService);
//# sourceMappingURL=document.service.js.map