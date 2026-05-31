import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContractCronService {
  private readonly logger = new Logger(ContractCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleContractRenewals() {
    this.logger.log('Iniciando processamento de renovação automática de contratos...');

    // Busca todos os tenants ativos no schema public
    const tenants = await this.prisma.client.tenant.findMany();

    for (const tenant of tenants) {
      try {
        const schema = tenant.schema;
        this.logger.log(`Processando tenant: ${schema}`);
        
        // Cria um client com a extensão para o schema do tenant
        const tenantPrisma = this.prisma.client.$extends({
          query: {
            $allModels: {
              async $allOperations({ args, query }) {
                const [, result] = await this.prisma.client.$transaction([
                  this.prisma.client.$executeRawUnsafe(`SET search_path TO "${schema}"`),
                  query(args),
                ]);
                return result;
              },
            },
          },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Busca contratos ativos que expiram hoje ou já expiraram e estão configurados para renovação automática
        const contractsToRenew = await tenantPrisma.contract.findMany({
          where: {
            status: 'ACTIVE',
            renewalMode: 'AUTOMATIC',
            endDate: {
              lte: today,
            },
          },
          include: {
            items: true,
          }
        });

        for (const contract of contractsToRenew) {
          try {
            await tenantPrisma.$transaction(async (tx) => {
              const newStartDate = new Date();
              const newEndDate = new Date();
              newEndDate.setFullYear(newEndDate.getFullYear() + 1);

              // Atualiza as datas do contrato (renovado)
              const updatedContract = await tx.contract.update({
                where: { id: contract.id },
                data: {
                  startDate: newStartDate,
                  endDate: newEndDate,
                  updatedBy: 'system-cron',
                },
              });

              // Carrega itens para payload
              const items = await tx.contractItem.findMany({ where: { contractId: contract.id } });
              const modulesPayload = {
                globalDiscount: Number(contract.globalDiscount),
                items: items.map(it => ({
                  moduleId: it.moduleId,
                  quantity: it.quantity,
                  unitPrice: Number(it.unitPrice),
                  discount: Number(it.discount),
                }))
              };

              // Gera histórico de renovação
              await tx.contractHistory.create({
                data: {
                  contractId: contract.id,
                  status: 'ACTIVE',
                  totalValue: contract.totalValue,
                  changedBy: 'system-cron',
                  reason: 'Renovação automática',
                  modulesPayload,
                }
              });

              this.logger.log(`Contrato ${contract.id} renovado automaticamente no tenant ${schema}.`);
            });
          } catch (contractError) {
            this.logger.error(`Erro ao renovar contrato ${contract.id} no tenant ${schema}: ${contractError.message}`);
          }
        }
      } catch (tenantError) {
        this.logger.error(`Erro ao processar renovações no tenant ${tenant.schema}: ${tenantError.message}`);
      }
    }

    this.logger.log('Processamento de renovações concluído.');
  }
}
