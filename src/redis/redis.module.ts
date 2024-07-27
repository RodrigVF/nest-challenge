import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = 'redis://localhost:6379';
        return new Redis(redisUrl);
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
