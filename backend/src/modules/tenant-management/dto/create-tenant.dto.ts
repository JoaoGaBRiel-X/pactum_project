import { IsNotEmpty, IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'O CNPJ é obrigatório.' })
  document: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do administrador é obrigatório.' })
  adminName: string;

  @IsEmail({}, { message: 'O e-mail do administrador deve ser válido.' })
  @IsNotEmpty({ message: 'O e-mail do administrador é obrigatório.' })
  adminEmail: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'A senha deve conter letras maiúsculas, minúsculas e números/caracteres especiais.',
  })
  @IsNotEmpty()
  adminPassword: string;
}
