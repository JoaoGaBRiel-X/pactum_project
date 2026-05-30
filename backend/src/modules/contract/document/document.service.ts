import { PrismaClient } from '@prisma/client';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../../tenant/tenant.module';
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async generateContractDocument(contractId: string, userId: string): Promise<string> {
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
    
    // Create a dummy template if not exists (for demonstration purposes)
    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`Template não encontrado em ${templatePath}. O documento final será gerado sem template (fallback).`);
      // Fallback: we will just write a .txt file
      return this.generateFallbackTxt(contract, userId);
    }

    try {
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for the template
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

      const fileName = `contract_${contractId}_${uuidv4()}.docx`;
      const outputPath = path.resolve(process.cwd(), 'documents', fileName);
      
      fs.writeFileSync(outputPath, buf);

      // Save to database
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

    } catch (error) {
      this.logger.error(`Erro ao gerar documento do contrato: ${error.message}`);
      throw error;
    }
  }

  private async generateFallbackTxt(contract: any, userId: string): Promise<string> {
    const fileName = `contract_${contract.id}_${uuidv4()}.txt`;
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
}
