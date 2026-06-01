import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenRequestDto {
  @ApiProperty({ description: 'Client ID gerado para a integração', example: 'client_12345' })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ description: 'Client Secret gerado para a integração', example: 'secret_abc123' })
  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @ApiProperty({ description: 'Grant Type, deve ser client_credentials', example: 'client_credentials' })
  @IsString()
  @IsNotEmpty()
  grant_type: string;
}
