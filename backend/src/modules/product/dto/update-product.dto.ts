import { PartialType } from '@nestjs/swagger';
import { CreateSoftwareProductDto } from './create-product.dto';

export class UpdateSoftwareProductDto extends PartialType(CreateSoftwareProductDto) {}
