import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DoctorsAppModule } from './doctors-app.module';

async function bootstrap() {
  const host = process.env.TCP_HOST ?? '0.0.0.0';
  const port = parseInt(process.env.TCP_PORT ?? '3002', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DoctorsAppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  await app.listen();
  console.log(`[doctors-service] Listening on ${host}:${port}`);
}

bootstrap();
