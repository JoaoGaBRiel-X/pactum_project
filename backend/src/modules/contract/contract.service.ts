import { PrismaClient, Prisma } from '@prisma/client';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto, ContractStatus } from './dto/update-contract-status.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ContractService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createDto: CreateContractDto, userId: string) {
    const { customerId, productId, items, globalDiscount = 0, renewalMode = 'AUTOMATIC' } = createDto;

    // Validate Customer
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Cliente não encontrado.');

    // Validate Product and fetch Modules to get the base prices
    const product = await this.prisma.softwareProduct.findUnique({
      where: { id: productId },
      include: { modules: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado.');

    // Calculate totals and prepare items
    let totalValue = 0;
    const contractItemsData: any[] = [];
    const historyPayloadItems: any[] = [];

    for (const item of items) {
      const module = product.modules.find(m => m.id === item.moduleId);
      if (!module) throw new BadRequestException(`Módulo ${item.moduleId} não pertence a este produto.`);
      if (!module.isActive) throw new BadRequestException(`Módulo ${module.name} está inativo.`);
      
      if (module.maxQuantity && item.quantity > module.maxQuantity) {
        throw new BadRequestException(`Quantidade do módulo ${module.name} excede o limite permitido (${module.maxQuantity}).`);
      }

      const unitPrice = Number(module.price);
      const discount = item.discount || 0;
      
      const itemTotal = (unitPrice - discount) * item.quantity;
      if (itemTotal < 0) throw new BadRequestException(`Desconto maior que o preço no módulo ${module.name}`);

      totalValue += itemTotal;

      contractItemsData.push({
        moduleId: item.moduleId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        discount: discount,
      });

      historyPayloadItems.push({
        moduleId: item.moduleId,
        moduleName: module.name,
        quantity: item.quantity,
        unitPrice: unitPrice,
        discount: discount,
      });
    }

    totalValue -= globalDiscount;
    if (totalValue < 0) throw new BadRequestException('Desconto global maior que o valor total do contrato.');

    // Use interactive transaction to guarantee consistency
    return this.prisma.$transaction(async (tx) => {
      let nextAdjustmentDate = null;
      if (createDto.adjustmentIndexId) {
        // Set next adjustment date to 1 year from now
        nextAdjustmentDate = new Date();
        nextAdjustmentDate.setFullYear(nextAdjustmentDate.getFullYear() + 1);
      }

      // 1. Create the Contract and its Items
      const contract = await tx.contract.create({
        data: {
          customerId,
          productId,
          globalDiscount,
          totalValue,
          renewalMode,
          status: 'DRAFT',
          createdBy: userId,
          adjustmentIndexId: createDto.adjustmentIndexId,
          nextAdjustmentDate: nextAdjustmentDate,
          items: {
            create: contractItemsData,
          },
        },
        include: {
          items: true,
        }
      });

      // 2. Generate initial History Snapshot
      await tx.contractHistory.create({
        data: {
          contractId: contract.id,
          status: 'DRAFT',
          totalValue: totalValue,
          changedBy: userId,
          reason: 'Criação do contrato',
          modulesPayload: {
            globalDiscount,
            items: historyPayloadItems,
          },
        }
      });

      return contract;
    });
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        items: true,
        customer: { select: { corporateName: true, document: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        product: { include: { modules: true } },
        items: true,
        documents: { orderBy: { createdAt: 'desc' } },
        history: {
          orderBy: { changedAt: 'desc' }
        },
      }
    });
  }

  async update(id: string, updateDto: UpdateContractDto, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id }, include: { items: true } });
    if (!contract) throw new NotFoundException('Contrato não encontrado.');
    if (contract.status !== 'DRAFT') throw new BadRequestException('Apenas contratos em rascunho podem ser alterados diretamente.');

    // We can simplify by expecting the full list of items if items are provided
    // For simplicity in this iteration, we delete existing items and recreate if items are passed
    return this.prisma.$transaction(async (tx) => {
      let totalValue = Number(contract.totalValue);
      let globalDiscount = updateDto.globalDiscount !== undefined ? updateDto.globalDiscount : Number(contract.globalDiscount);
      let historyPayloadItems: any[] = [];
      const contractItemsData: any[] = [];

      if (updateDto.items && updateDto.items.length > 0) {
        totalValue = 0;
        
        // Fetch product modules again to get prices
        const product = await tx.softwareProduct.findUnique({
          where: { id: updateDto.productId || contract.productId },
          include: { modules: true }
        });
        if (!product) throw new NotFoundException('Produto não encontrado.');

        for (const item of updateDto.items) {
          const module = product.modules.find(m => m.id === item.moduleId);
          if (!module) throw new BadRequestException(`Módulo ${item.moduleId} não encontrado no produto.`);
          
          const unitPrice = Number(module.price);
          const discount = item.discount || 0;
          const itemTotal = (unitPrice - discount) * item.quantity;
          
          totalValue += itemTotal;

          contractItemsData.push({
            moduleId: item.moduleId,
            quantity: item.quantity,
            unitPrice: unitPrice,
            discount: discount,
          });

          historyPayloadItems.push({
            moduleId: item.moduleId,
            moduleName: module.name,
            quantity: item.quantity,
            unitPrice: unitPrice,
            discount: discount,
          });
        }
        
        totalValue -= globalDiscount;
        if (totalValue < 0) throw new BadRequestException('Desconto global maior que o valor total.');

        // Delete old items
        await tx.contractItem.deleteMany({ where: { contractId: id } });
      } else {
        // Just keep old items if not updated, recalculate total if global discount changed
        // In a complete implementation, we should re-fetch items to rebuild payload, but we'll skip for brevity
        // or just apply discount difference. Let's recalculate from existing items:
        if (updateDto.globalDiscount !== undefined) {
           const items = await tx.contractItem.findMany({ where: { contractId: id } });
           totalValue = items.reduce((acc, it) => acc + ((Number(it.unitPrice) - Number(it.discount)) * it.quantity), 0);
           totalValue -= globalDiscount;
        }
      }

      const updatedContract = await tx.contract.update({
        where: { id },
        data: {
          customerId: updateDto.customerId,
          productId: updateDto.productId,
          globalDiscount,
          totalValue,
          renewalMode: updateDto.renewalMode,
          updatedBy: userId,
          ...(contractItemsData.length > 0 && {
            items: { create: contractItemsData }
          })
        },
        include: { items: true }
      });

      // Update snapshot
      await tx.contractHistory.create({
        data: {
          contractId: id,
          status: updatedContract.status,
          totalValue: totalValue,
          changedBy: userId,
          reason: 'Atualização do rascunho',
          modulesPayload: {
            globalDiscount,
            items: historyPayloadItems.length > 0 ? historyPayloadItems : undefined, // Could also store existing items snapshot here
          },
        }
      });

      return updatedContract;
    });
  }

  async amendContract(id: string, amendDto: UpdateContractDto, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contrato não encontrado.');
    if (contract.status !== 'ACTIVE') throw new BadRequestException('Apenas contratos ativos podem receber aditivos.');

    let totalValue = 0;
    let globalDiscount = amendDto.globalDiscount !== undefined ? amendDto.globalDiscount : Number(contract.globalDiscount);
    const contractItemsData: any[] = [];

    if (amendDto.items && amendDto.items.length > 0) {
      const product = await this.prisma.softwareProduct.findUnique({
        where: { id: amendDto.productId || contract.productId },
        include: { modules: true }
      });
      if (!product) throw new NotFoundException('Produto não encontrado.');

      for (const item of amendDto.items) {
        const module = product.modules.find(m => m.id === item.moduleId);
        if (!module) throw new BadRequestException(`Módulo ${item.moduleId} não encontrado no produto.`);
        
        if (module.maxQuantity && item.quantity > module.maxQuantity) {
          throw new BadRequestException(`Quantidade do módulo ${module.name} excede o limite permitido (${module.maxQuantity}).`);
        }
        
        const unitPrice = Number(module.price);
        const discount = item.discount || 0;
        const itemTotal = (unitPrice - discount) * item.quantity;
        
        totalValue += itemTotal;

        contractItemsData.push({
          moduleId: item.moduleId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          discount: discount,
        });
      }
      
      totalValue -= globalDiscount;
      if (totalValue < 0) throw new BadRequestException('Desconto global maior que o valor total.');
    } else {
      throw new BadRequestException('É necessário informar os itens do aditivo.');
    }

    const pendingAmendment = {
      items: contractItemsData,
      globalDiscount,
      totalValue,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    return this.prisma.contract.update({
      where: { id },
      data: {
        pendingAmendment,
      }
    });
  }

  async applyAmendment(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id }, include: { items: true } });
    if (!contract) throw new NotFoundException('Contrato não encontrado.');
    if (!contract.pendingAmendment) throw new BadRequestException('Não há aditivo pendente para este contrato.');

    const amendment = contract.pendingAmendment as any;

    return this.prisma.$transaction(async (tx) => {
      // Exclui os itens antigos
      await tx.contractItem.deleteMany({ where: { contractId: id } });

      // Atualiza os valores e itens e limpa o pending
      const updatedContract = await tx.contract.update({
        where: { id },
        data: {
          totalValue: amendment.totalValue,
          globalDiscount: amendment.globalDiscount,
          pendingAmendment: Prisma.DbNull, // Limpa o pending
          items: {
            create: amendment.items,
          }
        },
        include: { items: true }
      });

      // Salva snapshot no history
      const historyPayloadItems = amendment.items.map((item: any) => ({
        moduleId: item.moduleId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      }));

      await tx.contractHistory.create({
        data: {
          contractId: id,
          status: 'ACTIVE',
          totalValue: amendment.totalValue,
          changedBy: userId,
          reason: 'Aprovação de Aditivo Contratual',
          modulesPayload: {
            globalDiscount: amendment.globalDiscount,
            items: historyPayloadItems,
          },
        }
      });

      return updatedContract;
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateContractStatusDto, userId: string) {
    const { status, reason } = updateStatusDto;

    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!contract) throw new NotFoundException('Contrato não encontrado.');

    // Validations for transitions
    const currentStatus = contract.status;
    const invalidTransition = () => new BadRequestException(`Transição de status inválida: ${currentStatus} -> ${status}`);

    if (currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') {
      throw new BadRequestException(`Contrato não pode ser alterado a partir do status ${currentStatus}`);
    }

    if (status === 'PENDING_SIGNATURE') {
      const documentsCount = await this.prisma.contractDocument.count({
        where: { contractId: id }
      });
      if (documentsCount === 0) {
        throw new BadRequestException('Não é possível enviar para assinatura sem um documento gerado.');
      }
    }

    if (status === 'ACTIVE') {
      const tenantSettings = await this.prisma.tenantSetting.findFirst();
      const allowActivationWithoutDoc = tenantSettings?.allowActivationWithoutDocument ?? false;
      
      if (!allowActivationWithoutDoc) {
        const signedDocsCount = await this.prisma.contractDocument.count({
          where: { contractId: id, status: 'SIGNED' }
        });
        if (signedDocsCount === 0) {
          throw new BadRequestException('Não é possível ativar um contrato sem um documento assinado.');
        }
      }
    }

    if (status === 'ACTIVE' && currentStatus === 'DRAFT') {
      // Allow draft to active if skipping signature, or maybe require PENDING_SIGNATURE
      // We will allow it for simplicity, but normally it goes DRAFT -> PENDING_SIGNATURE -> ACTIVE
    }

    let startDate = contract.startDate;
    let endDate = contract.endDate;

    if (status === 'ACTIVE' && !startDate) {
      startDate = new Date();
      // Set end date to 1 year from now by default if not set
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let financialReasonStr = '';
      if (status === 'CANCELLED') {
        const tenantSettings = await tx.tenantSetting.findFirst();
        const strategy = tenantSettings?.billingCutoffStrategy || 'GLOBAL';
        let cutoffDay = tenantSettings?.globalCutoffDay || 15;

        if (strategy === 'PER_CONTRACT') {
          cutoffDay = contract.cutoffDay || cutoffDay;
        } else if (strategy === 'PER_PRODUCT_GROUP') {
          const product = await tx.softwareProduct.findUnique({
             where: { id: contract.productId },
             include: { productGroup: true }
          });
          cutoffDay = product?.cutoffDay || product?.productGroup?.cutoffDay || cutoffDay;
        }

        const today = new Date().getDate();
        const keepNextInvoice = today > cutoffDay;

        const pendingReceivables = await tx.receivable.findMany({
          where: { contractId: contract.id, status: 'PENDING' },
          orderBy: { dueDate: 'asc' }
        });

        if (pendingReceivables.length > 0) {
          const receivablesToCancel = keepNextInvoice ? pendingReceivables.slice(1) : pendingReceivables;
          if (receivablesToCancel.length > 0) {
            await tx.receivable.updateMany({
              where: { id: { in: receivablesToCancel.map(r => r.id) } },
              data: { status: 'CANCELED', updatedBy: userId }
            });
          }
          financialReasonStr = keepNextInvoice 
            ? ` Cancelamento após data de corte (dia ${cutoffDay}). Próxima fatura mantida, demais canceladas.` 
            : ` Cancelamento no limite da data de corte (dia ${cutoffDay}). Todas as faturas futuras canceladas.`;
        }
      }

      const updatedContract = await tx.contract.update({
        where: { id },
        data: {
          status,
          updatedBy: userId,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      });

      // Load items for payload snapshot
      const items = await tx.contractItem.findMany({ where: { contractId: id } });
      const modulesPayload = {
        globalDiscount: Number(contract.globalDiscount),
        items: items.map(it => ({
          moduleId: it.moduleId,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
          discount: Number(it.discount),
        }))
      };

      await tx.contractHistory.create({
        data: {
          contractId: id,
          status,
          totalValue: contract.totalValue,
          changedBy: userId,
          reason: reason ? reason + financialReasonStr : financialReasonStr.trim(),
          modulesPayload,
        }
      });

      return updatedContract;
    });

    // Fora da transação (after commit)
    if (status === 'ACTIVE' && currentStatus !== 'ACTIVE') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: contract.customerId },
        include: { contacts: true },
      });
      const toEmail = customer?.contacts?.[0]?.email;
      if (toEmail) {
        await this.notificationService.sendNotification('CONTRACT_ACTIVATED', toEmail, {
          customer,
          contract: result,
        }, customer.id, userId);
      }
    }

    return result;
  }

  async remove(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado.');
    }

    if (contract.status !== 'DRAFT') {
      throw new BadRequestException('Apenas contratos em rascunho podem ser excluídos.');
    }

    await this.prisma.contract.delete({
      where: { id }
    });

    return { message: 'Contrato excluído com sucesso.' };
  }
}
