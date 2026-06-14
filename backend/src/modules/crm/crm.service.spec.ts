import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { CRM_REPOSITORY } from './repositories/crm.repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('CrmService', () => {
  let service: CrmService;
  let mockCrmRepository: any;

  beforeEach(async () => {
    mockCrmRepository = {
      createLead: jest.fn(),
      findAllLeads: jest.fn(),
      findLeadById: jest.fn(),
      updateLead: jest.fn(),
      deleteLead: jest.fn(),
      findActivePipeline: jest.fn(),
      createPipeline: jest.fn(),
      createOpportunity: jest.fn(),
      updateOpportunity: jest.fn(),
      convertOpportunityToCustomer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        {
          provide: CRM_REPOSITORY,
          useValue: mockCrmRepository,
        },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    it('should call repository createLead with createdBy', async () => {
      const dto = { companyName: 'Test Corp', document: '123' };
      mockCrmRepository.createLead.mockResolvedValue({ id: '1', ...dto });

      const result = await service.createLead(dto as any, 'user-1');

      expect(mockCrmRepository.createLead).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'user-1',
      });
      expect(result).toHaveProperty('id', '1');
    });

    it('should correctly pass needsMappingAnswers to repository', async () => {
      const dto = { 
        companyName: 'Test Corp', 
        needsMappingAnswers: { question1: 'answer1', question2: 'answer2' } 
      };
      mockCrmRepository.createLead.mockResolvedValue({ id: '2', ...dto });

      const result = await service.createLead(dto as any, 'user-2');

      expect(mockCrmRepository.createLead).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'user-2',
      });
      expect(result.needsMappingAnswers).toEqual({ question1: 'answer1', question2: 'answer2' });
    });
  });

  describe('findOneLead', () => {
    it('should throw NotFoundException if lead not found', async () => {
      mockCrmRepository.findLeadById.mockResolvedValue(null);

      await expect(service.findOneLead('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOpportunity', () => {
    it('should pass createdBy to repository', async () => {
      const dto = { name: 'Opp 1' };
      await service.createOpportunity(dto, 'user-1');

      expect(mockCrmRepository.createOpportunity).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'user-1',
      });
    });
  });

  describe('moveOpportunity', () => {
    it('should update opportunity stage and updatedBy', async () => {
      await service.moveOpportunity('opp-1', 'stage-2', 'user-1');

      expect(mockCrmRepository.updateOpportunity).toHaveBeenCalledWith('opp-1', {
        pipelineStageId: 'stage-2',
        updatedBy: 'user-1',
      });
    });
  });
});
