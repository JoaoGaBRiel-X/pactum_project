import { Injectable, Inject, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { GotenbergService } from './gotenberg.service';
import { TemplateService } from './template.service';
import { ClicksignService } from './clicksign.service';
import { StorageService } from '../../infrastructure/storage/storage.service';

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
    private readonly storage: StorageService,
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
        product: {
          include: { modules: true }
        },
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

    // Baixar o DOCX do MinIO
    let templateBuffer: Buffer;
    try {
      templateBuffer = await this.storage.getFileBuffer(template.path);
    } catch (e) {
      throw new InternalServerErrorException(`Não foi possível ler o arquivo do template: ${template.path}. Erro interno: ${e.message}`);
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
        name: contract.customer.corporateName,
        cnpj: contract.customer.document,
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
        value: Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        globalDiscount: Number(contract.globalDiscount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        totalValue: Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        renewalMode: contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual',
      },
      software: {
        name: contract.product?.name || 'Vários Produtos',
        description: contract.product?.description || '',
      },
      modules: contract.items.map(item => {
        const moduleDef = contract.product?.modules.find(m => m.id === item.moduleId);
        return {
          name: moduleDef ? moduleDef.name : item.moduleId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          discount: Number(item.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        };
      })
    };

    // Preencher o DOCX
    let filledDocxBuffer: Buffer;
    try {
      filledDocxBuffer = await this.template.fillTemplate(templateBuffer, viewData);
    } catch (e) {
      throw new InternalServerErrorException(`Erro ao preencher o template DOCX: ${e.message}`);
    }

    // Converter para PDF via Gotenberg
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await this.gotenberg.convertDocxToPdf(filledDocxBuffer, 'contract.docx');
    } catch (e) {
      throw new InternalServerErrorException(`Erro ao converter DOCX para PDF no Gotenberg: ${e.message}`);
    }

    // Salvar PDF no MinIO
    const outputFilename = `contracts/contract_${contractId}_${Date.now()}.pdf`;
    try {
      await this.storage.uploadFile(outputFilename, pdfBuffer, 'application/pdf');
    } catch (e) {
      throw new InternalServerErrorException(`Erro ao fazer upload do PDF para o MinIO: ${e.message}`);
    }

    // Salvar registro no banco
    const document = await this.prisma.contractDocument.create({
      data: {
        contractId: contract.id,
        type: 'PDF',
        path: outputFilename,
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

  async uploadTemplate(file: Express.Multer.File, name: string, description: string, category: string, userId: string) {
    if (!file) {
      throw new Error('Nenhum arquivo recebido pelo backend');
    }
    
    const key = `templates/${Date.now()}_${file.originalname}`;
    await this.storage.uploadFile(key, file.buffer, file.mimetype || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.documentTemplate.findFirst({
        where: { name, category: category || 'STANDARD', isActive: true },
        orderBy: { version: 'desc' }
      });

      if (existing) {
        await tx.documentTemplate.update({
          where: { id: existing.id },
          data: { isActive: false }
        });
      }

      return tx.documentTemplate.create({
        data: {
          name,
          description,
          category: category || 'STANDARD',
          version: existing ? existing.version + 1 : 1,
          path: key,
          createdBy: userId
        }
      });
    });
  }

  async getDocument(documentId: string) {
    const document = await this.prisma.contractDocument.findUnique({
      where: { id: documentId }
    });
    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }
    return document;
  }

  async toggleTemplateStatus(templateId: string, isActive: boolean) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });
    
    if (!template) throw new NotFoundException('Template não encontrado');

    return this.prisma.documentTemplate.update({
      where: { id: templateId },
      data: { isActive }
    });
  }

  async getTemplate(templateId: string) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });
    if (!template) throw new NotFoundException('Template não encontrado');
    return template;
  }

  async deleteTemplate(templateId: string) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });
    if (!template) throw new NotFoundException('Template não encontrado');

    try {
      await this.storage.deleteFile(template.path);
      this.logger.log(`Arquivo do template removido do MinIO: ${template.path}`);
    } catch (err: any) {
      this.logger.warn(`Falha ao remover arquivo do template do MinIO (${template.path}): ${err.message}`);
    }

    return this.prisma.documentTemplate.delete({
      where: { id: templateId }
    });
  }

  async deleteDocument(documentId: string) {
    const document = await this.prisma.contractDocument.findUnique({
      where: { id: documentId }
    });
    
    if (!document) throw new NotFoundException('Documento não encontrado');
    if (document.status === 'SIGNED') {
      throw new BadRequestException('Não é possível remover um documento assinado.');
    }

    try {
      await this.storage.deleteFile(document.path);
      this.logger.log(`Arquivo removido do MinIO: ${document.path}`);
    } catch (err: any) {
      this.logger.warn(`Falha ao remover arquivo do MinIO (${document.path}): ${err.message}`);
    }

    return this.prisma.contractDocument.delete({
      where: { id: documentId }
    });
  }

  async getTemplateStream(templateId: string) {
    const template = await this.getTemplate(templateId);
    return {
      stream: await this.storage.getFileStream(template.path),
      name: template.name
    };
  }

  async getDocumentStream(documentId: string) {
    const document = await this.getDocument(documentId);
    return {
      stream: await this.storage.getFileStream(document.path),
      id: document.id
    };
  }
}
