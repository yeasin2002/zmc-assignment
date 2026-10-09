import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueSuffix = Date.now();
  const testUser = {
    name: 'E2E Test User',
    email: `e2e_user_${uniqueSuffix}@example.com`,
    password: 'Password123!',
  };

  it('POST /api/auth/register - rejects invalid password (too short or missing complexity)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Weak Pass',
        email: 'weak@example.com',
        password: 'weak',
      });

    expect(response.status).toBe(400);
  });

  it('POST /api/auth/register - successfully registers user and returns JWT + user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testUser.email.toLowerCase());
    expect(response.body.user.password).toBeUndefined();
  });

  it('POST /api/auth/register - rejects duplicate email with 409 Conflict', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(409);
  });

  it('POST /api/auth/login - authenticates registered user and returns JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('POST /api/auth/login - rejects wrong password with 401 Unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
  });

  it('GET /api/auth/me - rejects unauthenticated requests with 401 Unauthorized', async () => {
    const response = await request(app.getHttpServer()).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('GET /api/auth/me - returns user profile when valid Bearer token is provided', async () => {
    // 1. Log in to get accessToken
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.accessToken;

    // 2. Fetch /api/auth/me
    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(testUser.email.toLowerCase());
    expect(meRes.body.name).toBe(testUser.name);
    expect(meRes.body.password).toBeUndefined();
  });
});
