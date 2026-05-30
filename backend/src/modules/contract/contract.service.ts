import { PrismaClient } from '@prisma/client';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class ContractService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
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
        items: true,
        history: {
          orderBy: { changedAt: 'desc' }
        },
      }
    });
  }
}
