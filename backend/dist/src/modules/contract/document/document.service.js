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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const tenant_module_1 = require("../../../tenant/tenant.module");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const uuid_1 = require("uuid");
let DocumentService = DocumentService_1 = class DocumentService {
    prisma;
    logger = new common_1.Logger(DocumentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateContractDocument(contractId, userId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                customer: true,
                product: true,
                items: true,
            }
        });
        if (!contract) {
            throw new Error('Contrato não encontrado');
        }
        const templatePath = path.resolve(process.cwd(), 'templates', 'contract_template.docx');
        if (!fs.existsSync(templatePath)) {
            this.logger.warn(`Template não encontrado em ${templatePath}. O documento final será gerado sem template (fallback).`);
            return this.generateFallbackTxt(contract, userId);
        }
        try {
            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new pizzip_1.default(content);
            const doc = new docxtemplater_1.default(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            const data = {
                'customer.name': contract.customer.corporateName,
                'customer.cnpj': contract.customer.document,
                'contract.value': Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                'software.name': contract.product.name,
            };
            doc.render(data);
            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });
            const fileName = `contract_${contractId}_${(0, uuid_1.v4)()}.docx`;
            const outputPath = path.resolve(process.cwd(), 'documents', fileName);
            fs.writeFileSync(outputPath, buf);
            await this.prisma.contractDocument.create({
                data: {
                    contractId,
                    type: 'DOCX',
                    path: outputPath,
                    status: 'GENERATED',
                    createdBy: userId,
                }
            });
            this.logger.log(`Documento do contrato ${contractId} gerado com sucesso em ${outputPath}`);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`Erro ao gerar documento do contrato: ${error.message}`);
            throw error;
        }
    }
    async generateFallbackTxt(contract, userId) {
        const fileName = `contract_${contract.id}_${(0, uuid_1.v4)()}.txt`;
        const outputPath = path.resolve(process.cwd(), 'documents', fileName);
        const content = `CONTRATO DE LICENCIAMENTO DE SOFTWARE\n\n
Cliente: ${contract.customer.corporateName}
CNPJ: ${contract.customer.document}
Produto: ${contract.product.name}
Valor Total: R$ ${Number(contract.totalValue).toFixed(2)}
Data: ${new Date().toLocaleDateString('pt-BR')}\n\n(Documento de Fallback - Template DOCX não encontrado)`;
        fs.writeFileSync(outputPath, content, 'utf8');
        await this.prisma.contractDocument.create({
            data: {
                contractId: contract.id,
                type: 'TXT',
                path: outputPath,
                status: 'GENERATED',
                createdBy: userId,
            }
        });
        return outputPath;
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_module_1.TENANT_PRISMA_SERVICE)),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], DocumentService);
//# sourceMappingURL=document.service.js.map