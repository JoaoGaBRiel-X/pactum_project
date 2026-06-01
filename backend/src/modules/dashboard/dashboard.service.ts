import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async getMetrics() {
    // 1. Contratos Ativos & MRR
    const activeContracts = await this.prisma.contract.findMany({
      where: { status: 'ACTIVE' },
      select: { totalValue: true },
    });

    const activeContractsCount = activeContracts.length;
    const mrr = activeContracts.reduce((sum, contract) => sum + Number(contract.totalValue), 0);

    // 2. Inadimplência (Recebíveis OVERDUE)
    const overdueReceivables = await this.prisma.receivable.findMany({
      where: { status: 'OVERDUE' },
      select: { amount: true },
    });
    
    const overdueAmount = overdueReceivables.reduce((sum, rec) => sum + Number(rec.amount), 0);

    // 3. Contratos Cancelados neste mês (para cálculo básico de churn)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const churnedContractsThisMonth = await this.prisma.contractHistory.count({
      where: {
        status: 'CANCELLED',
        changedAt: { gte: startOfMonth },
      },
    });

    const churnRate = activeContractsCount > 0 
      ? (churnedContractsThisMonth / (activeContractsCount + churnedContractsThisMonth)) * 100 
      : 0;

    return {
      activeContracts: activeContractsCount,
      mrr,
      overdueAmount,
      churnRate: Number(churnRate.toFixed(2)),
    };
  }

  async getUpcomingRenewals() {
    const today = new Date();
    const in60Days = new Date();
    in60Days.setDate(today.getDate() + 60);

    return this.prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: in60Days,
        },
      },
      include: {
        customer: { select: { corporateName: true, document: true } },
        product: { select: { name: true } },
      },
      orderBy: { endDate: 'asc' },
      take: 5,
    });
  }

  async getRecentOverdue() {
    return this.prisma.receivable.findMany({
      where: { status: 'OVERDUE' },
      include: {
        customer: { select: { corporateName: true, document: true } },
      },
      orderBy: { dueDate: 'asc' }, // Older first, or newer first? usually oldest unpaid are most critical
      take: 5,
    });
  }
}
