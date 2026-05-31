import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Cache de clientes por schema (reutilizados entre execuções do cron)
const cronClientCache = new Map<string, PrismaClient>();

async function getCronTenantClient(schemaName: string): Promise<PrismaClient> {
  if (cronClientCache.has(schemaName)) {
    return cronClientCache.get(schemaName)!;
  }

  const dbUrl = new URL(process.env.DATABASE_URL as string);

  const pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
    database: dbUrl.pathname.slice(1),
    max: 3,
  });

  const adapter = new PrismaPg(pool, { schema: schemaName });
  const client = new PrismaClient({ adapter });
  await client.$connect();

  cronClientCache.set(schemaName, client);
  return client;
}

@Injectable()
export class ContractCronService {
  private readonly logger = new Logger(ContractCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleContractRenewals() {
    this.logger.log('Iniciando processamento de renovação automática de contratos...');

    const tenants = await this.prisma.client.tenant.findMany();

    for (const tenant of tenants) {
      try {
        const schema = tenant.schema;
        this.logger.log(`Processando tenant: ${schema}`);

        const tenantPrisma = await getCronTenantClient(schema);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const contractsToRenew = await tenantPrisma.contract.findMany({
          where: {
            status: 'ACTIVE',
            renewalMode: 'AUTOMATIC',
            endDate: { lte: today },
          },
          include: { items: true },
        });

        for (const contract of contractsToRenew) {
          try {
            await tenantPrisma.$transaction(async (tx) => {
              const newStartDate = new Date();
              const newEndDate = new Date();
              newEndDate.setFullYear(newEndDate.getFullYear() + 1);

              await tx.contract.update({
                where: { id: contract.id },
                data: { startDate: newStartDate, endDate: newEndDate, updatedBy: 'system-cron' },
              });

              const items = await tx.contractItem.findMany({ where: { contractId: contract.id } });
              const modulesPayload = {
                globalDiscount: Number(contract.globalDiscount),
                items: items.map((it) => ({
                  moduleId: it.moduleId,
                  quantity: it.quantity,
                  unitPrice: Number(it.unitPrice),
                  discount: Number(it.discount),
                })),
              };

              await tx.contractHistory.create({
                data: {
                  contractId: contract.id,
                  status: 'ACTIVE',
                  totalValue: contract.totalValue,
                  changedBy: 'system-cron',
                  reason: 'Renovação automática',
                  modulesPayload,
                },
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
