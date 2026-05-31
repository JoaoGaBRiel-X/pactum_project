import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { NotificationService } from '../notification/notification.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FinancialService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllReceivables() {
    return this.prisma.receivable.findMany({
      include: {
        customer: { select: { corporateName: true, document: true } },
        contract: { select: { id: true, status: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Simulates a cron job generating monthly bills for active contracts
  async generateBilling(userId: string) {
    const activeContracts = await this.prisma.contract.findMany({
      where: { status: 'ACTIVE' },
      include: { items: true },
    });

    const now = new Date();
    const competence = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let generatedCount = 0;

    for (const contract of activeContracts) {
      // Check if a recurring bill for this competence already exists
      const existing = await this.prisma.receivable.findFirst({
        where: {
          contractId: contract.id,
          competence,
          type: 'RECURRING',
        }
      });

      if (!existing) {
        // Due date is usually the 5th of next month (simplified)
        const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        
        await this.prisma.receivable.create({
          data: {
            contractId: contract.id,
            customerId: contract.customerId,
            amount: contract.totalValue,
            dueDate,
            description: `Mensalidade - Competência ${competence}`,
            type: 'RECURRING',
            status: 'PENDING',
            competence,
            createdBy: userId,
          }
        });
        generatedCount++;
      }
    }

    return { message: `Faturamento gerado. ${generatedCount} novos títulos criados para ${competence}.` };
  }

  async registerPayment(receivableId: string, amount: number, method: string, receiptBuffer?: Buffer, receiptName?: string, userId?: string) {
    const receivable = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) throw new NotFoundException('Conta a receber não encontrada.');
    if (receivable.status === 'PAID') throw new BadRequestException('Esta conta já está paga.');

    let receiptUrl = null;
    
    // Save file locally (simulation of S3/MinIO)
    if (receiptBuffer && receiptName) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${receiptName}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, receiptBuffer);
      receiptUrl = `/uploads/receipts/${fileName}`; // In a real app, serve this static route or use S3
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          receivableId,
          amount,
          paymentDate: new Date(),
          method,
          receiptUrl,
          createdBy: userId,
        }
      });

      // Update Receivable status
      // In a real scenario, compare amount with total, check for partial payment, etc.
      // Here we assume it's fully paid if amount >= receivable.amount
      const status = Number(amount) >= Number(receivable.amount) ? 'PAID' : 'PENDING';

      const updatedReceivable = await tx.receivable.update({
        where: { id: receivableId },
        data: {
          status,
          updatedBy: userId,
        }
      });

      // Update Delinquency Score (Gain 10 points for a payment, up to 1000)
      if (status === 'PAID') {
        const customer = await tx.customer.findUnique({ where: { id: receivable.customerId } });
        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              delinquencyScore: Math.min(1000, customer.delinquencyScore + 10)
            }
          });
        }
      }

      return updatedReceivable;
    });
  }

  // Renegotiation logic
  async createRenegotiation(customerId: string, receivableIds: string[], discount: number, userId: string) {
    // 1. Fetch overdue/pending receivables
    const receivables = await this.prisma.receivable.findMany({
      where: {
        id: { in: receivableIds },
        customerId,
        status: { in: ['PENDING', 'OVERDUE'] }
      }
    });

    if (receivables.length === 0) {
      throw new BadRequestException('Nenhum título válido para renegociação.');
    }

    const originalDebt = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
    const interestApplied = originalDebt * 0.05; // Simulate 5% interest
    const penaltyApplied = originalDebt * 0.02; // Simulate 2% penalty
    const finalAmount = originalDebt + interestApplied + penaltyApplied - discount;

    if (finalAmount <= 0) throw new BadRequestException('O valor final da renegociação deve ser maior que zero.');

    return this.prisma.$transaction(async (tx) => {
      // Create renegotiation record
      const renegotiation = await tx.debtRenegotiation.create({
        data: {
          customerId,
          originalDebt,
          interestApplied,
          penaltyApplied,
          discount,
          finalAmount,
          status: 'APPROVED', // Auto-approving for this phase
          consolidatedReceivableIds: receivableIds,
          createdBy: userId,
        }
      });

      // Cancel original receivables
      await tx.receivable.updateMany({
        where: { id: { in: receivableIds } },
        data: {
          status: 'RENEGOTIATED',
          renegotiationId: renegotiation.id,
          updatedBy: userId,
        }
      });

      // Create NEW receivable for the renegotiation
      await tx.receivable.create({
        data: {
          customerId,
          description: `Acordo de Renegociação #${renegotiation.id.split('-')[0]}`,
          type: 'RENEGOTIATION',
          amount: finalAmount,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
          status: 'PENDING',
          renegotiationId: renegotiation.id,
          createdBy: userId,
        }
      });

      return renegotiation;
    });
  }

  async uploadBoleto(receivableId: string, boletoBuffer: Buffer, boletoName: string, userId: string) {
    const receivable = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) throw new NotFoundException('Conta a receber não encontrada.');

    const uploadDir = path.join(process.cwd(), 'uploads', 'boletos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${boletoName}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, boletoBuffer);
    const boletoUrl = `/uploads/boletos/${fileName}`;

    const updatedReceivable = await this.prisma.receivable.update({
      where: { id: receivableId },
      data: {
        boletoUrl,
        updatedBy: userId,
      },
      include: {
        customer: { include: { contacts: true } },
      }
    });

    // Send notification if customer has a contact email
    const firstContact = updatedReceivable.customer?.contacts?.[0];
    if (firstContact?.email) {
      this.notificationService.sendNotification('NEW_BOLETO', firstContact.email, {
        customer: updatedReceivable.customer,
        receivable: updatedReceivable,
      });
    }

    return updatedReceivable;
  }
}
