import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupSwagger } from '../src/lib/swagger.js';

describe('Swagger Documentation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    setupSwagger(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/docs/ - serves Swagger UI HTML page', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('id="swagger-ui"');
    expect(response.text).toContain('Project & Task Management API Docs');
  });

  it('GET /api/docs-json - serves valid OpenAPI JSON specification', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs-json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body.info.title).toBe(
      'Project & Task Management System API',
    );
    expect(response.body.paths).toHaveProperty('/api/auth/register');
    expect(response.body.paths).toHaveProperty('/api/auth/login');
    expect(response.body.paths).toHaveProperty('/api/auth/me');
  });
});
