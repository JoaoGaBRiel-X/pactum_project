import { IsString, IsUUID, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum RenewalMode {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

class ContractItemDto {
  @IsUUID()
  moduleId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateContractDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  globalDiscount?: number;

  @IsEnum(RenewalMode)
  @IsOptional()
  renewalMode?: RenewalMode;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractItemDto)
  items: ContractItemDto[];
}
