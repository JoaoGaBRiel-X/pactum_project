import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  keepConnected?: boolean;
}

export class MfaVerifyDto {
  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  keepConnected?: boolean;
}
