import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsEmail, IsBoolean } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User {
  @ApiProperty({ description: 'Identificador único do usuário', example: 1 })
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nome de usuário escolhido', example: 'joaosilva' })
  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'Senha do usuário (deve ser criptografada)', example: 'not_hashed_password' })
  @IsString()
  @IsNotEmpty()
  @Column()
  password: string;

  @ApiProperty({ description: 'Endereço de e-mail do usuário', example: 'joao.silva@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Nome completo do usuário', example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  @Column()
  fullName: string;

  @ApiProperty({ description: 'Data de registro do usuário', example: '2024-07-23T00:00:00Z' })
  @CreateDateColumn()
  dateRegistered: Date;

  @ApiProperty({ description: 'Indica se o usuário está ativo', example: true })
  @IsBoolean()
  @Column({ default: true })
  isActive: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
