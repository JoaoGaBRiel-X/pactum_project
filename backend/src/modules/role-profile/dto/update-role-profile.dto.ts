import { PartialType } from '@nestjs/swagger';
import { CreateRoleProfileDto } from './create-role-profile.dto';

export class UpdateRoleProfileDto extends PartialType(CreateRoleProfileDto) {}
