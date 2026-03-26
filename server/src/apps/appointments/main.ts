import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppointmentsAppModule } from './appointments-app.module';

async function bootstrap() {
  const host = process.env.TCP_HOST ?? '0.0.0.0';
  const port = parseInt(process.env.TCP_PORT ?? '3003', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppointmentsAppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  await app.listen();
  console.log(`[appointments-service] Listening on ${host}:${port}`);
}

bootstrap();
