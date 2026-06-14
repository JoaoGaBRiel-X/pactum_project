import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  companyName: string;

  @IsString()
  @IsOptional()
  tradeName?: string;

  @IsString()
  @IsOptional()
  document?: string; // CNPJ

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  segment?: string;

  @IsOptional()
  needsMappingAnswers?: Record<string, any>;

  @IsString()
  @IsOptional()
  sourceChannel?: string;
}
