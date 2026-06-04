import { Module } from '@nestjs/common';
import { RoleProfileService } from './role-profile.service';
import { RoleProfileController } from './role-profile.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoleProfileController],
  providers: [RoleProfileService],
  exports: [RoleProfileService],
})
export class RoleProfileModule {}
