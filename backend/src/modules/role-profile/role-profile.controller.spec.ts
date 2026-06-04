import { Test, TestingModule } from '@nestjs/testing';
import { RoleProfileController } from './role-profile.controller';

describe('RoleProfileController', () => {
  let controller: RoleProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleProfileController],
    }).compile();

    controller = module.get<RoleProfileController>(RoleProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
