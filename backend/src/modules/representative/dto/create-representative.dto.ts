import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateRepresentativeDto {
  @IsString()
  name: string;

  @IsString()
  document: string; // CPF or CNPJ

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  setupFeeCommissionPercentage?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  recurringCommissionPercentage?: number;

  @IsString()
  @IsOptional()
  pixKey?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
