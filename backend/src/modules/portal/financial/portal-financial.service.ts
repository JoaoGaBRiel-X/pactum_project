import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { getTenantClient } from '../../../tenant/tenant.module';

@Injectable()
export class PortalFinancialService {
  constructor(private readonly globalPrisma: PrismaService) {}

  async findAll(tenantSlug: string, customerId: string) {
    const tenant = await this.globalPrisma.client.tenant.findUnique({
      where: { schema: tenantSlug },
    });

    if (!tenant || !tenant.schema) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const tenantPrisma = await getTenantClient(tenant.schema);

    return tenantPrisma.receivable.findMany({
      where: { customerId },
      orderBy: { dueDate: 'desc' },
      include: {
        contract: {
          select: {
            id: true,
            product: { select: { name: true } },
          }
        }
      }
    });
  }
}
