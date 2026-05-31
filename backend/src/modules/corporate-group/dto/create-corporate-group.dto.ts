import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCorporateGroupDto {
  @ApiProperty({ example: 'Grupo Lefer' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
