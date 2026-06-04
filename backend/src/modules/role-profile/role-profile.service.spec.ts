import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileService } from './role-profile.service';

describe('RoleProfileService', () => {
  let service: RoleProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleProfileService],
    }).compile();

    service = module.get<RoleProfileService>(RoleProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
