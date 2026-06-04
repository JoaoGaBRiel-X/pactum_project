import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateRoleProfileDto {
  @ApiProperty({ description: 'O nome do perfil de acesso (ex: Vendedor, Financeiro)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada do perfil' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Lista de permissões (ex: [\"customers:read\", \"contracts:create\"])', type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
