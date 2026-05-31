import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BacenService } from './bacen.service';

@Injectable()
export class AdjustmentService {
  private readonly logger = new Logger(AdjustmentService.name);

  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
    private readonly bacen: BacenService,
  ) {}

  async createIndex(data: { name: string; description?: string }, userId: string) {
    return this.prisma.adjustmentIndex.create({
      data: { ...data, createdBy: userId }
    });
  }

  async findAllIndexes() {
    return this.prisma.adjustmentIndex.findMany({
      include: {
        rates: {
          orderBy: { competence: 'desc' }
        }
      }
    });
  }

  async addRate(indexId: string, competence: string, accumulatedRate: number) {
    return this.prisma.adjustmentRate.upsert({
      where: {
        indexId_competence: {
          indexId,
          competence,
        }
      },
      update: { accumulatedRate },
      create: {
        indexId,
        competence,
        accumulatedRate,
      }
    });
  }

  async applyManualAdjustment(contractId: string, percentage: number, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contrato não encontrado.');
    if (contract.status !== 'ACTIVE') throw new BadRequestException('Apenas contratos ativos podem ser reajustados.');

    const previousValue = Number(contract.totalValue);
    const newValue = previousValue * (1 + (percentage / 100));

    return this.prisma.$transaction(async (tx) => {
      // Create adjustment record
      await tx.contractAdjustment.create({
        data: {
          contractId,
          previousValue,
          newValue,
          appliedRate: percentage,
          type: 'MANUAL',
          reason: 'Reajuste manual / renovação',
          appliedBy: userId,
        }
      });

      // Update contract value and nextAdjustmentDate (1 year from now)
      const nextDate = contract.nextAdjustmentDate ? new Date(contract.nextAdjustmentDate) : new Date();
      nextDate.setFullYear(nextDate.getFullYear() + 1);

      const updatedContract = await tx.contract.update({
        where: { id: contractId },
        data: {
          totalValue: newValue,
          nextAdjustmentDate: nextDate,
        }
      });

      // Add to history
      await tx.contractHistory.create({
        data: {
          contractId,
          status: updatedContract.status,
          totalValue: updatedContract.totalValue,
          changedBy: userId,
          reason: `Reajuste manual de ${percentage}%`,
          modulesPayload: { type: 'ADJUSTMENT', percentage, previousValue, newValue }
        }
      });

      return updatedContract;
    });
  }

  // Cron Job para Reajustes Automáticos
  // Roda todo dia 1 da manhã
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleAutomaticAdjustments() {
    this.logger.log('Iniciando processamento de reajustes automáticos...');
    // Competence of the current month
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Note: since this is a multi-tenant app, the Cron ideally should iterate over ALL tenants and run this.
    // As the TenantPrismaService is request-scoped, we have a structural issue: @Cron runs outside the request context!
    // For this prototype phase, we will expose a route to trigger it, so the context is populated via header.
    this.logger.warn('CronJob ativado, mas requer contexto de Tenant. Use a rota /adjustments/run-automatic para executar no tenant específico por enquanto.');
  }

  async runAutomaticAdjustmentsForTenant(userId: string) {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Find contracts that are ACTIVE, AUTOMATIC renewal, and nextAdjustmentDate is <= now
    const eligibleContracts = await this.prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        renewalMode: 'AUTOMATIC',
        adjustmentIndexId: { not: null },
        nextAdjustmentDate: { lte: now },
      },
      include: {
        adjustmentIndex: {
          include: {
            rates: {
              where: { competence: currentMonthStr }
            }
          }
        }
      }
    });

    let processedCount = 0;

    for (const contract of eligibleContracts) {
      const currentRate = contract.adjustmentIndex?.rates[0]?.accumulatedRate;
      if (currentRate === undefined) {
        this.logger.warn(`Contrato ${contract.id} requer reajuste pelo ${contract.adjustmentIndex?.name}, mas não há taxa para a competência ${currentMonthStr}.`);
        continue;
      }

      const percentage = Number(currentRate);
      const previousValue = Number(contract.totalValue);
      const newValue = previousValue * (1 + (percentage / 100));

      await this.prisma.$transaction(async (tx) => {
        await tx.contractAdjustment.create({
          data: {
            contractId: contract.id,
            previousValue,
            newValue,
            appliedRate: percentage,
            type: 'AUTOMATIC',
            reason: `Reajuste automático - Competência ${currentMonthStr}`,
            appliedBy: 'system',
          }
        });

        const nextDate = new Date(contract.nextAdjustmentDate!);
        nextDate.setFullYear(nextDate.getFullYear() + 1);

        const updatedContract = await tx.contract.update({
          where: { id: contract.id },
          data: {
            totalValue: newValue,
            nextAdjustmentDate: nextDate,
          }
        });

        await tx.contractHistory.create({
          data: {
            contractId: contract.id,
            status: updatedContract.status,
            totalValue: updatedContract.totalValue,
            changedBy: 'system',
            reason: `Reajuste automático de ${percentage}% aplicado (${contract.adjustmentIndex?.name})`,
            modulesPayload: { type: 'AUTOMATIC_ADJUSTMENT', percentage, previousValue, newValue }
          }
        });
      });

      processedCount++;
    }

    return { message: `${processedCount} contratos reajustados automaticamente.` };
  }

  async syncBacenRatesForTenant(userId: string) {
    const now = new Date();
    // Ex: "2026-05"
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let processed = 0;

    // IGPM (189)
    const igpmIndex = await this.prisma.adjustmentIndex.findFirst({ where: { name: { equals: 'IGPM', mode: 'insensitive' } } });
    if (igpmIndex) {
      try {
        const rate = await this.bacen.fetchAccumulatedRate(189);
        await this.addRate(igpmIndex.id, currentMonthStr, rate);
        processed++;
      } catch (e) {
        this.logger.error('Erro ao sincronizar IGPM', e);
      }
    }

    // IPCA (433)
    const ipcaIndex = await this.prisma.adjustmentIndex.findFirst({ where: { name: { equals: 'IPCA', mode: 'insensitive' } } });
    if (ipcaIndex) {
      try {
        const rate = await this.bacen.fetchAccumulatedRate(433);
        await this.addRate(ipcaIndex.id, currentMonthStr, rate);
        processed++;
      } catch (e) {
        this.logger.error('Erro ao sincronizar IPCA', e);
      }
    }

    return { message: `${processed} índices (IGPM/IPCA) sincronizados com o Bacen para ${currentMonthStr}.` };
  }
}
