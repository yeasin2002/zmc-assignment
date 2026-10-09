import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Projects & Access Control (e2e)', () => {
  let app: INestApplication;
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;

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

    // Register User A
    const regARes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'User A',
        email: `usera_${timestamp}@example.com`,
        password: 'Password123!',
      });
    userAToken = regARes.body.accessToken;
    userAId = regARes.body.user.id;

    // Register User B
    const regBRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'User B',
        email: `userb_${timestamp}@example.com`,
        password: 'Password123!',
      });
    userBToken = regBRes.body.accessToken;
    userBId = regBRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  let projectAId: string;
  let projectBId: string;

  it('POST /api/projects - User A creates Project A', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Project Alpha',
        description: 'Owned by User A',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Project Alpha');
    expect(res.body.ownerId).toBe(userAId);
    projectAId = res.body.id;
  });

  it('POST /api/projects - User B creates Project B', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Project Beta',
        description: 'Owned by User B',
      });

    expect(res.status).toBe(201);
    expect(res.body.ownerId).toBe(userBId);
    projectBId = res.body.id;
  });

  describe('Multi-Tenant Access Isolation (URL Tampering Prevention)', () => {
    it('GET /api/projects/:id - User A cannot access Project B (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectBId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(403);
    });

    it('PATCH /api/projects/:id - User A cannot modify Project B (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/projects/${projectBId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Hacked Title' });

      expect(res.status).toBe(403);
    });

    it('DELETE /api/projects/:id - User A cannot delete Project B (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/projects/${projectBId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Project Collaboration & Role-Based Permissions', () => {
    it('POST /api/projects/:id/members - Owner A adds User B to Project A', async () => {
      const meB = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userBToken}`);

      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectAId}/members`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ email: meB.body.email });

      expect(res.status).toBe(201);
      expect(res.body.role).toBe('MEMBER');
      expect(res.body.userId).toBe(userBId);
    });

    it('GET /api/projects/:id - Now User B can view Project A as a Member', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(projectAId);
      expect(res.body.currentUserRole).toBe('MEMBER');
    });

    it('PATCH /api/projects/:id - Member B cannot update Project A details (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Unauthorized Name Change' });

      expect(res.status).toBe(403);
    });

    it('DELETE /api/projects/:id - Member B cannot delete Project A (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('POST /api/projects/:id/members - Member B cannot invite users to Project A (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectAId}/members`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ email: 'random@example.com' });

      expect(res.status).toBe(403);
    });

    it('DELETE /api/projects/:id/members/:userId - Owner cannot remove themselves (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/projects/${projectAId}/members/${userAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
    });

    it('DELETE /api/projects/:id/members/:userId - Owner removes Member B from Project A', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/projects/${projectAId}/members/${userBId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removed');
    });

    it('GET /api/projects/:id - User B is now blocked from Project A (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('DELETE /api/projects/:id - Owner A deletes Project A', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);

      // Verify it is gone
      const checkRes = await request(app.getHttpServer())
        .get(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
