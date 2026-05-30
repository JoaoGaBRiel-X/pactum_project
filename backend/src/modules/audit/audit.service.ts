import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class AuditService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaService,
  ) {}

  async registerConsent(customerId: string, documentRef: string, ipAddress: string, userAgent: string, userId: string) {
    return this.prisma.consentRecord.create({
      data: {
        customerId,
        documentRef,
        ipAddress,
        userAgent,
        createdBy: userId,
      }
    });
  }

  async getConsents(customerId: string) {
    return this.prisma.consentRecord.findMany({
      where: { customerId }
    });
  }
}
