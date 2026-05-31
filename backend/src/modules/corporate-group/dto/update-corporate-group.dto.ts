import { PartialType } from '@nestjs/swagger';
import { CreateCorporateGroupDto } from './create-corporate-group.dto';

export class UpdateCorporateGroupDto extends PartialType(CreateCorporateGroupDto) {}
