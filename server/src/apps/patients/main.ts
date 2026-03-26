import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PatientsAppModule } from './patients-app.module';

async function bootstrap() {
  const host = process.env.TCP_HOST ?? '0.0.0.0';
  const port = parseInt(process.env.TCP_PORT ?? '3001', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PatientsAppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  await app.listen();
  console.log(`[patients-service] Listening on ${host}:${port}`);
}

bootstrap();
