import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Olá! Tente acessar /api para ver os endpoints';
  }
}
