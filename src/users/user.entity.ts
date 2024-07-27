import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

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
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = randomBytes(16).toString('hex');
      const key = await scryptAsync(this.password, salt, 64) as Buffer;
      this.password = `${salt}:${key.toString('hex')}`;
    }
  }
}
