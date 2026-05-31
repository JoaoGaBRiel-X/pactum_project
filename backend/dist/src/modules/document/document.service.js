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
const tenant_module_1 = require("../../tenant/tenant.module");
const gotenberg_service_1 = require("./gotenberg.service");
const template_service_1 = require("./template.service");
const clicksign_service_1 = require("./clicksign.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let DocumentService = DocumentService_1 = class DocumentService {
    prisma;
    gotenberg;
    template;
    clicksign;
    logger = new common_1.Logger(DocumentService_1.name);
    constructor(prisma, gotenberg, template, clicksign) {
        this.prisma = prisma;
        this.gotenberg = gotenberg;
        this.template = template;
        this.clicksign = clicksign;
    }
    async getTemplates() {
        return this.prisma.documentTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async generateContractDocument(contractId, templateId, userId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                customer: true,
                product: true
            }
        });
        if (!contract)
            throw new common_1.NotFoundException('Contrato não encontrado');
        const template = await this.prisma.documentTemplate.findUnique({
            where: { id: templateId }
        });
        if (!template)
            throw new common_1.NotFoundException('Template não encontrado');
        let templateBuffer;
        try {
            templateBuffer = await fs.readFile(template.path);
        }
        catch (e) {
            throw new Error(`Não foi possível ler o arquivo do template: ${template.path}`);
        }
        const viewData = {
            customer: {
                name: contract.customer.corporateName,
                cnpj: contract.customer.document,
            },
            contract: {
                value: Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            },
            software: {
                name: contract.product.name
            }
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
        const document = await this.prisma.contractDocument.update({
            where: { id: documentId },
            data: {
                status: 'SIGNED',
            }
        });
        return document;
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
        gotenberg_service_1.GotenbergService,
        template_service_1.TemplateService,
        clicksign_service_1.ClicksignService])
], DocumentService);
//# sourceMappingURL=document.service.js.map