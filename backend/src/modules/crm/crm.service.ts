import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CRM_REPOSITORY } from './repositories/crm.repository.interface';
import type { ICrmRepository } from './repositories/crm.repository.interface';

@Injectable()
export class CrmService {
  constructor(
    @Inject(CRM_REPOSITORY)
    private readonly crmRepository: ICrmRepository,
  ) {}

  // --- LEADS ---

  async createLead(createLeadDto: CreateLeadDto, userId: string) {
    return this.crmRepository.createLead({
      ...createLeadDto,
      createdBy: userId,
    });
  }

  async findAllLeads() {
    return this.crmRepository.findAllLeads();
  }

  async findOneLead(id: string) {
    const lead = await this.crmRepository.findLeadById(id, {
      opportunities: {
        include: { pipelineStage: true }
      }
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async updateLead(id: string, updateLeadDto: UpdateLeadDto, userId: string) {
    await this.findOneLead(id);
    return this.crmRepository.updateLead(id, {
      ...updateLeadDto,
      updatedBy: userId,
    });
  }

  async removeLead(id: string) {
    await this.findOneLead(id);
    return this.crmRepository.deleteLead(id);
  }

  // --- PIPELINES ---

  async getActivePipeline(userId: string) {
    let pipeline = await this.crmRepository.findActivePipeline({
      stages: {
        orderBy: { orderIndex: 'asc' },
        include: {
          opportunities: {
            include: {
              lead: { select: { companyName: true, contactName: true } },
              representative: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    });

    if (!pipeline) {
      pipeline = await this.crmRepository.createPipeline({
        name: 'Funil de Vendas Padrão',
        createdBy: userId,
        stages: {
          create: [
            { name: 'Qualificação', orderIndex: 0, createdBy: userId },
            { name: 'Apresentação', orderIndex: 1, createdBy: userId },
            { name: 'Proposta', orderIndex: 2, createdBy: userId },
            { name: 'Negociação', orderIndex: 3, createdBy: userId },
          ]
        }
      }, {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            opportunities: {
              include: {
                lead: { select: { companyName: true, contactName: true } },
                representative: { select: { name: true } },
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      });
    }

    return pipeline;
  }

  // --- OPPORTUNITIES ---

  async createOpportunity(createOpportunityDto: any, userId: string) {
    return this.crmRepository.createOpportunity({
      ...createOpportunityDto,
      createdBy: userId,
    });
  }

  async moveOpportunity(id: string, newStageId: string, userId: string) {
    return this.crmRepository.updateOpportunity(id, { 
      pipelineStageId: newStageId,
      updatedBy: userId,
    });
  }

  async convertOpportunity(id: string, dto: any, userId: string) {
    try {
      return await this.crmRepository.convertOpportunityToCustomer(id, dto, userId);
    } catch (error) {
      throw new Error(`Failed to convert opportunity: ${error.message}`);
    }
  }
}
