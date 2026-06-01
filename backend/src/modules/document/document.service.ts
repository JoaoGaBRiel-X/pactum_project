import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
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
    private readonly globalPrisma: PrismaService,
    private readonly gotenberg: GotenbergService,
    private readonly template: TemplateService,
    private readonly clicksign: ClicksignService,
  ) {}

  async getTemplates() {
    return this.prisma.documentTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async generateContractDocument(contractId: string, templateId: string, userId: string, tenantId?: string) {
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

    if (!contract) throw new NotFoundException('Contrato não encontrado');

    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) throw new NotFoundException('Template não encontrado');

    // Fetch Tenant Info from Global Schema
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

    // Emulação: Ler o DOCX do disco
    let templateBuffer: Buffer;
    try {
      templateBuffer = await fs.readFile(template.path);
    } catch (e) {
      throw new Error(`Não foi possível ler o arquivo do template: ${template.path}`);
    }

    // Preparar dados para o docxtemplater
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
        contactCpf: (contract.customer.contacts?.[0] as any)?.cpf || 'CPF não informado',
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
        name: item.moduleId, // Ideally we should join with SoftwareModule to get the real name, but it is stored in Product
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        discount: Number(item.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      }))
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

        // Create history snapshot
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
