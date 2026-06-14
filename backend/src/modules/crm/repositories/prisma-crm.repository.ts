import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient, Prisma, Lead, Pipeline, Opportunity } from '@prisma/client';
import { ICrmRepository } from './crm.repository.interface';
import { TENANT_PRISMA_SERVICE } from '../../../tenant/tenant.module';

@Injectable()
export class PrismaCrmRepository implements ICrmRepository {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async createLead(data: Prisma.LeadCreateInput | any): Promise<Lead> {
    return this.prisma.lead.create({ data });
  }

  async findAllLeads(): Promise<Lead[]> {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLeadById(id: string, include?: Prisma.LeadInclude): Promise<Lead | null | any> {
    return this.prisma.lead.findUnique({
      where: { id },
      include,
    });
  }

  async updateLead(id: string, data: Prisma.LeadUpdateInput | any): Promise<Lead> {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async deleteLead(id: string): Promise<void> {
    await this.prisma.lead.delete({
      where: { id },
    });
  }

  async findActivePipeline(include?: Prisma.PipelineInclude): Promise<Pipeline | null | any> {
    return this.prisma.pipeline.findFirst({
      where: { isActive: true },
      include,
    });
  }

  async createPipeline(data: Prisma.PipelineCreateInput | any, include?: Prisma.PipelineInclude): Promise<Pipeline | any> {
    return this.prisma.pipeline.create({
      data,
      include,
    });
  }

  async createOpportunity(data: Prisma.OpportunityCreateInput | any): Promise<Opportunity> {
    return this.prisma.opportunity.create({ data });
  }

  async updateOpportunity(id: string, data: Prisma.OpportunityUpdateInput | any): Promise<Opportunity> {
    return this.prisma.opportunity.update({
      where: { id },
      data,
    });
  }

  async convertOpportunityToCustomer(opportunityId: string, dto: any, userId: string): Promise<{ customerId: string, contractId: string }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Opportunity with Lead
      const opportunity = await tx.opportunity.findUnique({
        where: { id: opportunityId },
        include: { lead: true }
      });

      if (!opportunity) {
        throw new Error('Opportunity not found');
      }
      if (opportunity.status === 'WON') {
        throw new Error('Opportunity is already converted');
      }

      // 2. Fetch Proposal
      const proposal = await tx.proposal.findUnique({
        where: { id: dto.proposalId },
        include: { 
          items: true
        }
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }
      if (proposal.opportunityId !== opportunityId) {
        throw new Error('Proposal does not belong to this opportunity');
      }

      // 3. Multi-Product Validation
      const tenantSetting = await tx.tenantSetting.findFirst();
      let mainProductId: string | undefined = undefined;

      if (proposal.items && proposal.items.length > 0) {
        const moduleIds = proposal.items.map(item => item.moduleId);
        const modules = await tx.softwareModule.findMany({
          where: { id: { in: moduleIds } }
        });

        const productIds = [...new Set(modules.map(m => m.productId))];
        
        if (tenantSetting?.restrictProposalToSingleProduct && productIds.length > 1) {
          throw new Error('Esta proposta possui itens de múltiplos produtos, o que não é permitido pela configuração atual.');
        }

        if (productIds.length === 1) {
          mainProductId = productIds[0];
        }
      }

      // 4. Create Customer
      const companyName = opportunity.lead?.companyName || 'Empresa Desconhecida';
      const customer = await tx.customer.create({
        data: {
          corporateName: companyName,
          document: dto.document,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
          street: dto.street,
          number: dto.number,
          createdBy: userId,
        }
      });

      // 5. Create Contact
      await tx.contact.create({
        data: {
          customerId: customer.id,
          name: dto.contactName,
          email: dto.contactEmail,
          phone: dto.contactPhone,
          createdBy: userId,
        }
      });

      // 6. Create Contract
      const contract = await tx.contract.create({
        data: {
          customerId: customer.id,
          productId: mainProductId,
          status: 'DRAFT',
          totalValue: proposal.totalValue || 0,
          createdBy: userId,
          items: {
            create: proposal.items.map(item => ({
              moduleId: item.moduleId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
            }))
          }
        }
      });

      // 7. Update Opportunity and Proposal
      await tx.opportunity.update({
        where: { id: opportunityId },
        data: {
          status: 'WON',
          customerId: customer.id,
          updatedBy: userId,
        }
      });

      await tx.proposal.update({
        where: { id: proposal.id },
        data: {
          status: 'APPROVED',
          updatedBy: userId,
        }
      });

      return { customerId: customer.id, contractId: contract.id };
    });
  }
}
