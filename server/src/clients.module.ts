import { Module } from '@nestjs/common';
import {
  ClientsModule as NestClientsModule,
  Transport,
} from '@nestjs/microservices';

@Module({
  imports: [
    NestClientsModule.register([
      {
        name: 'DATA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.TCP_HOST ?? '127.0.0.1',
          port: parseInt(process.env.TCP_PORT ?? '3001'),
        },
      },
    ]),
  ],
  controllers: [],
})
export class AppClientModule {}
