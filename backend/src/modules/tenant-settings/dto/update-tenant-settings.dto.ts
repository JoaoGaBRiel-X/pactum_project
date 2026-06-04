import { IsString, IsOptional, Matches, IsBoolean } from 'class-validator';

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { message: 'Primary color must be a valid HEX color' })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { message: 'Secondary color must be a valid HEX color' })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsString()
  companyDocument?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  legalRepName?: string;

  @IsOptional()
  @IsString()
  legalRepCpf?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Domínio deve conter apenas letras minúsculas, números e hifens' })
  slug?: string;

  @IsOptional()
  @IsBoolean()
  allowActivationWithoutDocument?: boolean;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
