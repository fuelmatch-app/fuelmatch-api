import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  const port    = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Segurança ────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: nodeEnv === 'production'
      ? ['https://app.fuelmatch.app', 'https://fuelmatch.app']
      : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── Prefixo global e versionamento ──────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ── Pipes globais ────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Filtros e interceptors globais ───────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger (apenas fora de produção) ────────────────────────
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FuelMatch API')
      .setDescription('API de nutrição esportiva com periodização dinâmica de macros')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    console.log(`📚 Swagger: http://localhost:${port}/docs`);
  }

  // ── Health check com verificação real do banco ───────────────
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', async (_req: any, res: any) => {
    const dbOk = await prismaService.healthCheck();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: nodeEnv,
      database: dbOk ? 'connected' : 'disconnected',
    });
  });

  await app.listen(port);
  console.log(`🔥 FuelMatch API rodando em http://localhost:${port}`);
  console.log(`🌍 Ambiente: ${nodeEnv}`);
}

bootstrap();
