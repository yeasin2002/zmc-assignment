import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Project & Task Management System API')
    .setDescription(
      'RESTful API for the Project & Task Management System, featuring JWT authentication, project collaboration, task lifecycle tracking, and dashboard analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT Bearer token (e.g. Bearer eyJhbGci...)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User registration, login, and profile operations')
    .addTag('Projects', 'Project workspaces and member management')
    .addTag('Tasks', 'Task lifecycle, assignments, and query operations')
    .addTag('Dashboard', 'Summary statistics and workload analytics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Project & Task Management API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
