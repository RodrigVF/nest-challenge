import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './user.dto';
import { kafkaProducer, kafkaConsumer } from './kafka.config';
import { UserBadRequestException } from './exceptions/user.exception';
import { Redis } from 'ioredis';


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

    // Caso não esteja no cache, buscar no banco de dados e armazenar no cache
    const users = await this.userRepository.find();
    await this.redisClient.set('users', JSON.stringify(users));
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
		console.log(user)
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

    // Enviar mensagem para o Kafka
    try {
      await kafkaProducer.connect();
      await kafkaProducer.send({
        topic: 'users-topic',
        messages: [{ value: `Usuário criado: ${userDto.username}` }],
      });
      await kafkaProducer.disconnect();
    } catch (error) {
      console.error('Falha ao enviar mensagem para o Kafka:', error);
      throw new UserBadRequestException('Falha ao enviar mensagem para o Kafka');
    }

    return `Usuário ${userDto.username} criado com sucesso`;
  }

	async update(id: number, userDto: UserDto): Promise<string> {
		// Encontrar o usuário pelo ID
		const user = await this.userRepository.findOneBy({ id });
	
		if (!user) {
      throw new UserBadRequestException('Usuário não encontrado');
		}
	
		// Atualizar as propriedades do usuário apenas com os valores fornecidos
		if (userDto.username) user.username = userDto.username;
		if (userDto.password) user.password = userDto.password; // A senha será criptografada na entidade
		if (userDto.email) user.email = userDto.email;
		if (userDto.fullName) user.fullName = userDto.fullName;
	
		// Salvar o usuário atualizado
		await this.userRepository.save(user);

		// Enviar mensagem para o Kafka
		await kafkaProducer.connect();
		await kafkaProducer.send({
			topic: 'users-topic',
			messages: [{ value: `Usuário atualizado: ${userDto.username}` }],
		});
		await kafkaProducer.disconnect();

		return `Usuário ${userDto.username} atualizado com sucesso`;
	}

  async remove(id: number): Promise<string> {
    await this.userRepository.delete(id);

		// Enviar mensagem para o Kafka
		await kafkaProducer.connect();
		await kafkaProducer.send({
			topic: 'users-topic',
			messages: [{ value: `Usuário deletado, ID: ${id}` }],
		});
		await kafkaProducer.disconnect();

		return `Usuário de ID: ${id} foi deletado`;
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
