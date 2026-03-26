import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AnalyticsAppModule } from './analytics-app.module';

async function bootstrap() {
  const host = process.env.TCP_HOST ?? '0.0.0.0';
  const port = parseInt(process.env.TCP_PORT ?? '3004', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AnalyticsAppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  await app.listen();
  console.log(`[analytics-service] Listening on ${host}:${port}`);
}

bootstrap();
