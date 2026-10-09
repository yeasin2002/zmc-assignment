import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskPriority, TaskStatus } from '@prisma/client';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Tasks & Access Control (e2e)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let memberToken: string;
  let outsiderToken: string;
  let memberId: string;
  let outsiderId: string;
  let projectId: string;

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

    // 1. Register Owner
    const ownerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Task Owner',
        email: `task_owner_${timestamp}@example.com`,
        password: 'Password123!',
      });
    ownerToken = ownerRes.body.accessToken;

    // 2. Register Member
    const memberRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Task Member',
        email: `task_member_${timestamp}@example.com`,
        password: 'Password123!',
      });
    memberToken = memberRes.body.accessToken;
    memberId = memberRes.body.user.id;

    // 3. Register Outsider
    const outsiderRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Task Outsider',
        email: `task_outsider_${timestamp}@example.com`,
        password: 'Password123!',
      });
    outsiderToken = outsiderRes.body.accessToken;
    outsiderId = outsiderRes.body.user.id;

    // 4. Create Project by Owner
    const projRes = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Task Management Project',
        description: 'For testing task queries and permissions',
      });
    projectId = projRes.body.id;

    // 5. Add Member to Project
    await request(app.getHttpServer())
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: `task_member_${timestamp}@example.com` });
  });

  afterAll(async () => {
    await app.close();
  });

  let task1Id: string;
  let task2Id: string;

  describe('Task Creation & Assignment Validation', () => {
    it('POST /api/projects/:id/tasks - should fail when assignee is not a project member', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Invalid Assignment Task',
          assigneeId: outsiderId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Task assignee must be a member');
    });

    it('POST /api/projects/:id/tasks - should fail when outsider attempts to create task', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({
          title: 'Unauthorized Task',
        });

      expect(res.status).toBe(403);
    });

    it('POST /api/projects/:id/tasks - owner creates task assigned to member', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Alpha Design Phase',
          description: 'Design database and schema',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeId: memberId,
          dueDate: '2026-11-01T00:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Alpha Design Phase');
      expect(res.body.status).toBe(TaskStatus.TODO);
      expect(res.body.priority).toBe(TaskPriority.HIGH);
      expect(res.body.assigneeId).toBe(memberId);
      expect(res.body.assignee.email).toContain('task_member');
      task1Id = res.body.id;
    });

    it('POST /api/projects/:id/tasks - member creates unassigned task', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Beta Testing Setup',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.LOW,
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Beta Testing Setup');
      expect(res.body.assigneeId).toBeNull();
      task2Id = res.body.id;
    });
  });

  describe('Task List Querying (Search, Filter, Sort, Pagination)', () => {
    it('GET /api/projects/:id/tasks - should reject outsider access with 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/projects/:id/tasks - member can list all project tasks with metadata', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.meta.page).toBe(1);
    });

    it('GET /api/projects/:id/tasks?search=alpha - searches by title case-insensitively', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks?search=ALPHA`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Alpha Design Phase');
    });

    it('GET /api/projects/:id/tasks?status=IN_PROGRESS - filters by status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks?status=IN_PROGRESS`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Beta Testing Setup');
    });

    it('GET /api/projects/:id/tasks?priority=HIGH - filters by priority', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks?priority=HIGH`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].priority).toBe(TaskPriority.HIGH);
    });

    it('GET /api/projects/:id/tasks?assigneeId=... - filters by assignee', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks?assigneeId=${memberId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].assigneeId).toBe(memberId);
    });

    it('GET /api/projects/:id/tasks?page=1&limit=1 - pagination limits output', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks?page=1&limit=1`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.meta.limit).toBe(1);
      expect(res.body.meta.totalPages).toBe(2);
    });
  });

  describe('Task Details & Updates', () => {
    it('GET /api/tasks/:id - returns task details to project member', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(task1Id);
      expect(res.body.title).toBe('Alpha Design Phase');
    });

    it('GET /api/tasks/:id - rejects outsider access with 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it('PATCH /api/tasks/:id - rejects reassigning task to outsider', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ assigneeId: outsiderId });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Task assignee must be a member');
    });

    it('PATCH /api/tasks/:id - updates task status to DONE', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: TaskStatus.DONE });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TaskStatus.DONE);
    });
  });

  describe('Task Deletion & Permissions', () => {
    it('DELETE /api/tasks/:id - regular member cannot delete task (403)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Only the project owner can delete tasks');
    });

    it('DELETE /api/tasks/:id - outsider cannot delete task (403)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it('DELETE /api/tasks/:id - project owner successfully deletes task', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      // Verify task is now deleted
      const checkRes = await request(app.getHttpServer())
        .get(`/api/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
