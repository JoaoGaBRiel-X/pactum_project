import { Prisma, Lead, Pipeline, Opportunity } from '@prisma/client';

export const CRM_REPOSITORY = 'CRM_REPOSITORY';

export interface ICrmRepository {
  // Leads
  createLead(data: Prisma.LeadCreateInput | any): Promise<Lead>;
  findAllLeads(): Promise<Lead[]>;
  findLeadById(id: string, include?: Prisma.LeadInclude): Promise<Lead | null | any>;
  updateLead(id: string, data: Prisma.LeadUpdateInput | any): Promise<Lead>;
  deleteLead(id: string): Promise<void>;

  // Pipelines
  findActivePipeline(include?: Prisma.PipelineInclude): Promise<Pipeline | null | any>;
  createPipeline(data: Prisma.PipelineCreateInput | any, include?: Prisma.PipelineInclude): Promise<Pipeline | any>;

  // Opportunities
  createOpportunity(data: Prisma.OpportunityCreateInput | any): Promise<Opportunity>;
  updateOpportunity(id: string, data: Prisma.OpportunityUpdateInput | any): Promise<Opportunity>;
  convertOpportunityToCustomer(opportunityId: string, dto: any, userId: string): Promise<{ customerId: string, contractId: string }>;
}
