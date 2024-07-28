import { Body, Controller, Get, Post, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserBadRequestException } from './exceptions/user.exception';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um usuário por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário' })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  async create(@Body() userDto: UserDto): Promise<string> {
    try {
      return await this.usersService.create(userDto);
    } catch (error) {
      if (error instanceof UserBadRequestException) {
        throw new UserBadRequestException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  async update(@Param('id') id: number, @Body() userDto: UserDto): Promise<string> {
    try{
    return this.usersService.update(id, userDto);
    } catch (error) {
        if (error instanceof UserBadRequestException) {
        throw new UserBadRequestException(error.message);
        }
        throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  async remove(@Param('id') id: number): Promise<string> {
    return this.usersService.remove(id);
  }
}
