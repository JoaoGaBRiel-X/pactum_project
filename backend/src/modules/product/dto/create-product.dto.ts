import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSoftwareModuleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBaseOffer?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxQuantity?: number;
}

export class CreateSoftwareProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productGroupId?: string;

  @ApiProperty({ type: [CreateSoftwareModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSoftwareModuleDto)
  modules: CreateSoftwareModuleDto[];
}
