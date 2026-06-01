import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  portalAccess?: boolean;
}

class CreatePartnerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiPropertyOptional()
  @IsOptional()
  share?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isLegalRep?: boolean;
}

export class CreateLegalRepresentativeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  corporateName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tradeName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  corporateGroupId?: string;

  @ApiPropertyOptional({ type: [CreateContactDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  @IsOptional()
  contacts?: CreateContactDto[];

  @ApiPropertyOptional({ type: [CreatePartnerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePartnerDto)
  @IsOptional()
  partners?: CreatePartnerDto[];

  @ApiPropertyOptional({ type: [CreateLegalRepresentativeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLegalRepresentativeDto)
  @IsOptional()
  legalRepresentatives?: CreateLegalRepresentativeDto[];
}
