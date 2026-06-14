import { PartialType } from '@nestjs/mapped-types';
import { CreateRepresentativeDto } from './create-representative.dto';

export class UpdateRepresentativeDto extends PartialType(CreateRepresentativeDto) {}
