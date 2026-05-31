import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { GotenbergService } from './gotenberg.service';
import { TemplateService } from './template.service';
import { ClicksignService } from './clicksign.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
    private readonly gotenberg: GotenbergService,
    private readonly template: TemplateService,
    private readonly clicksign: ClicksignService,
  ) {}

  async getTemplates() {
    return this.prisma.documentTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async generateContractDocument(contractId: string, templateId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        customer: true,
        product: true
      }
    });

    if (!contract) throw new NotFoundException('Contrato não encontrado');

    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) throw new NotFoundException('Template não encontrado');

    // Emulação: Ler o DOCX do disco
    let templateBuffer: Buffer;
    try {
      templateBuffer = await fs.readFile(template.path);
    } catch (e) {
      throw new Error(`Não foi possível ler o arquivo do template: ${template.path}`);
    }

    // Preparar dados para o docxtemplater
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

    // Preencher o DOCX
    const filledDocxBuffer = await this.template.fillTemplate(templateBuffer, viewData);

    // Converter para PDF via Gotenberg
    const pdfBuffer = await this.gotenberg.convertDocxToPdf(filledDocxBuffer, 'contract.docx');

    // Emulação: Salvar PDF na pasta uploads
    const uploadsDir = path.resolve(__dirname, '../../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const outputFilename = `contract_${contractId}_${Date.now()}.pdf`;
    const outputPath = path.join(uploadsDir, outputFilename);
    await fs.writeFile(outputPath, pdfBuffer);

    // Salvar registro no banco
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

  async markAsManuallySigned(documentId: string, userId: string) {
    const document = await this.prisma.contractDocument.update({
      where: { id: documentId },
      data: {
        status: 'SIGNED',
      }
    });
    return document;
  }

  async uploadTemplate(file: Express.Multer.File, name: string, description: string, userId: string) {
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
}
