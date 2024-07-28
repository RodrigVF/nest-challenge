import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto, UserDto } from './user.dto';
import { kafkaProducer, kafkaConsumer } from './kafka.config';
import { UserBadRequestException } from './exceptions/user.exception';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async onModuleInit() {
    await this.initializeKafkaConsumer();
  }

  async findAll(): Promise<User[]> {
		const cachedUsers = await this.redisClient.get('users');
    if (cachedUsers) {
      return JSON.parse(cachedUsers);
    }

    const users = await this.userRepository.find();
    await this.redisClient.set('users', JSON.stringify(users), 'EX', 1800);
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new UserBadRequestException('Usuário não encontrado');
    }
    return user;
  }

  async create(userDto: UserDto): Promise<string> {
    // Verificar se o usuário já existe
    const existingUsername = await this.userRepository.findOneBy({
      username: userDto.username,
    });
		const existingEmail = await this.userRepository.findOneBy({
      email: userDto.email,
    });
    if (existingUsername || existingEmail) {
      throw new UserBadRequestException('Nome de usuário ou e-mail já existe');
    }

    const user = new User();
    user.username = userDto.username;
    user.password = userDto.password; // Senha será criptografada na entidade
    user.email = userDto.email;
    user.fullName = userDto.fullName;
    user.isActive = userDto.isActive ?? true;

    await this.userRepository.save(user);
    await this.redisClient.del('users');

		await this.sendMessageToKafka(`Usuário criado: ${userDto.username}`)
    return `Usuário ${userDto.username} criado com sucesso`;
  }

	async update(id: number, updateUserDto: UpdateUserDto): Promise<string> {
		const user = await this.userRepository.findOneBy({ id });
		if (!user) {
			throw new UserBadRequestException('Usuário não encontrado');
		}
	
		// Atualizar as propriedades do usuário apenas com os valores fornecidos
		if (updateUserDto.username) user.username = updateUserDto.username;
		if (updateUserDto.email) user.email = updateUserDto.email;
		if (updateUserDto.fullName) user.fullName = updateUserDto.fullName;
		if (updateUserDto.dateRegistered) user.dateRegistered = updateUserDto.dateRegistered;
		if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;
    if (updateUserDto.password) {
      const isSamePassword = await bcrypt.compare(updateUserDto.password, user.password);
      if (!isSamePassword) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }
    }

		await this.userRepository.save(user);
		await this.redisClient.del('users');
	
		await this.sendMessageToKafka(`Usuário atualizado: ${updateUserDto.username || user.username}`);
		return `Usuário ${updateUserDto.username || user.username} atualizado com sucesso`;
	}

  async remove(id: number): Promise<string> {
		const user = await this.userRepository.findOneBy({ id });
		if (!user) {
      throw new UserBadRequestException('Usuário não encontrado');
		}
	
		await this.userRepository.delete(id);
    await this.redisClient.del('users');

		return `Usuário de ID: ${id} foi deletado`;
  }

	private async sendMessageToKafka(message: string) {
    try {
      await kafkaProducer.connect();
      await kafkaProducer.send({
        topic: 'users-topic',
        messages: [{ value: message }],
      });
    } catch (error) {
      console.error('Falha ao enviar mensagem para o Kafka:', error);
    } finally {
      await kafkaProducer.disconnect();
    }
  }

  private async initializeKafkaConsumer() {
		await kafkaConsumer.connect();
    await kafkaConsumer.subscribe({ topic: 'users-topic' });
    await kafkaConsumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				console.log(`Mensagem recebida: ${message.value.toString()}`);
      },
    });
  }
}