import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { DocumentService } from '../document/document.service';

describe('ContractController', () => {
  let controller: ContractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        {
          provide: ContractService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DocumentService,
          useValue: {},
        }
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
