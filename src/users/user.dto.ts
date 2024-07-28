import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsBoolean, IsInt } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'Identificador único do usuário', example: 1 })
  @IsInt()
  @IsOptional()
  readonly id?: number;

  @ApiProperty({ description: 'Nome de usuário escolhido', example: 'joaosilva' })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ description: 'Senha do usuário (deve ser criptografada)', example: 'not_hashed_password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ description: 'Endereço de e-mail do usuário', example: 'joao.silva@example.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'Nome completo do usuário', example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @ApiProperty({ description: 'Data de registro do usuário', example: '2024-07-23T00:00:00Z' })
  @IsOptional()
  readonly dateRegistered?: Date;

  @ApiProperty({ description: 'Indica se o usuário está ativo', example: true })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;
}
