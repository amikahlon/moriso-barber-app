import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Moriso Barber API')
    .setDescription('מערכת תורים לספר')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Moriso Barber API',
    customCss: `
      .swagger-ui .topbar { background-color: #111111; }
      .swagger-ui .topbar-wrapper img { display: none; }
      .swagger-ui .topbar-wrapper::after {
        content: 'Moriso Barber API';
        color: white;
        font-size: 20px;
        font-weight: bold;
      }
      .swagger-ui .info .title { color: #111111; }
      .swagger-ui .btn.execute { background-color: #111111; border-color: #111111; }
    `,
  });

  await app.listen(process.env['PORT'] ?? 3000);
}

void bootstrap();
