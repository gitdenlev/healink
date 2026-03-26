import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.TCP_HOST ?? '127.0.0.1',
        port: parseInt(process.env.TCP_PORT ?? '3001'),
      },
    },
  );
  await app.listen();
  console.log(
    `Microservice is listening on ${process.env.TCP_HOST ?? '127.0.0.1'}:${process.env.TCP_PORT ?? 3001}`,
  );
}
bootstrap();
