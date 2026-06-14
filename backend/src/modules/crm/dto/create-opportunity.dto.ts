import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ description: 'Nome da oportunidade' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID do Lead vinculado' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ description: 'ID do estágio inicial no funil' })
  @IsString()
  @IsNotEmpty()
  pipelineStageId: string;

  @ApiProperty({ description: 'Receita esperada (valor)', required: false })
  @IsNumber()
  @IsOptional()
  expectedRevenue?: number;

  @ApiProperty({ description: 'Probabilidade de fechamento (0 a 100)', required: false })
  @IsNumber()
  @IsOptional()
  probability?: number;

  @ApiProperty({ description: 'Data esperada de fechamento', required: false })
  @IsDateString()
  @IsOptional()
  closeDate?: string;
}
