import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskPriority, TaskStatus } from '@prisma/client';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Dashboard Analytics & Global Exception Filter (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let otherToken: string;

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

    const timestamp = Date.now();

    // Register User 1
    const regUser = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Dashboard User',
        email: `dash_user_${timestamp}@example.com`,
        password: 'Password123!',
      });
    userToken = regUser.body.accessToken;

    // Register User 2 (other user)
    const regOther = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: `dash_other_${timestamp}@example.com`,
        password: 'Password123!',
      });
    otherToken = regOther.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Global Exception Filter Verification', () => {
    it('GET /api/dashboard/stats - rejects unauthenticated request with standardized error format', async () => {
      const res = await request(app.getHttpServer()).get('/api/dashboard/stats');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', '/api/dashboard/stats');
    });

    it('GET /api/projects/invalid-id - returns standardized 400 Bad Request error format', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/projects/not-a-uuid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', '/api/projects/not-a-uuid');
    });
  });

  describe('Dashboard Metrics Aggregation', () => {
    it('GET /api/dashboard/stats - returns zero counts for new user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        projects: { total: 0, active: 0 },
        tasks: { total: 0, completed: 0, pending: 0, highPriority: 0 },
      });
    });

    it('GET /api/dashboard/stats - computes accurate project and task counts isolating other users', async () => {
      // 1. User creates Project 1
      const proj1Res = await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Active Project with Tasks' });
      const proj1Id = proj1Res.body.id;

      // Project 1 Tasks:
      // Task 1: TODO, HIGH
      await request(app.getHttpServer())
        .post(`/api/projects/${proj1Id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        });

      // Task 2: IN_PROGRESS, LOW
      await request(app.getHttpServer())
        .post(`/api/projects/${proj1Id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 2',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.LOW,
        });

      // Task 3: DONE, MEDIUM
      await request(app.getHttpServer())
        .post(`/api/projects/${proj1Id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 3',
          status: TaskStatus.DONE,
          priority: TaskPriority.MEDIUM,
        });

      // 2. User creates Project 2 (Completed project with only DONE task)
      const proj2Res = await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Completed Project' });
      const proj2Id = proj2Res.body.id;

      // Task 4: DONE, LOW
      await request(app.getHttpServer())
        .post(`/api/projects/${proj2Id}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 4',
          status: TaskStatus.DONE,
          priority: TaskPriority.LOW,
        });

      // 3. Other user creates Project 3 with a task (should not contaminate user stats)
      const proj3Res = await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Other User Project' });
      const proj3Id = proj3Res.body.id;

      await request(app.getHttpServer())
        .post(`/api/projects/${proj3Id}/tasks`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Other Task',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        });

      // 4. Query stats for User 1
      const statsRes = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.projects.total).toBe(2);
      expect(statsRes.body.projects.active).toBe(1); // Only proj1 has non-done tasks
      expect(statsRes.body.tasks.total).toBe(4);
      expect(statsRes.body.tasks.completed).toBe(2);
      expect(statsRes.body.tasks.pending).toBe(2);
      expect(statsRes.body.tasks.highPriority).toBe(1);
    });
  });
});
