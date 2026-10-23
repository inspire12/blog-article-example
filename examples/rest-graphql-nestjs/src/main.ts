import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('REST & GraphQL NestJS Example')
    .setDescription('REST API documentation')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  app.use(
    '/graphql-voyager',
    voyagerMiddleware({ endpointUrl: '/graphql' }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
