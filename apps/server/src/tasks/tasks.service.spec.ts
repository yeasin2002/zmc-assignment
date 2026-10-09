import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRole, TaskPriority, TaskStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    project: { findUnique: ReturnType<typeof vi.fn> };
    projectMember: { findUnique: ReturnType<typeof vi.fn> };
    task: {
      count: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      project: { findUnique: vi.fn() },
      projectMember: { findUnique: vi.fn() },
      task: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('listProjectTasks', () => {
    it('should throw NotFoundException if project does not exist', async () => {
      prisma.projectMember.findUnique.mockResolvedValue(null);
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.listProjectTasks('proj-1', 'user-1', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a member of project', async () => {
      prisma.projectMember.findUnique.mockResolvedValue(null);
      prisma.project.findUnique.mockResolvedValue({ id: 'proj-1' });

      await expect(service.listProjectTasks('proj-1', 'user-attacker', {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should query and return paginated tasks with search and filters', async () => {
      prisma.projectMember.findUnique.mockResolvedValue({ id: 'm-1', role: ProjectRole.MEMBER });
      prisma.task.count.mockResolvedValue(1);
      prisma.task.findMany.mockResolvedValue([
        { id: 't-1', title: 'Test Task', status: TaskStatus.TODO, priority: TaskPriority.HIGH },
      ]);

      const result = await service.listProjectTasks('proj-1', 'user-1', {
        search: 'test',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        page: 1,
        limit: 10,
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId: 'proj-1',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            title: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createTask', () => {
    it('should throw BadRequestException if assignee is not a member of project', async () => {
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ id: 'm-1' }) // caller is member
        .mockResolvedValueOnce(null); // assignee is not member

      await expect(
        service.createTask('proj-1', 'caller-id', {
          title: 'New Task',
          assigneeId: 'non-member-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create task when assignee is a valid project member', async () => {
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ id: 'm-1' }) // caller check
        .mockResolvedValueOnce({ id: 'm-2' }); // assignee check

      prisma.task.create.mockResolvedValue({
        id: 't-created',
        title: 'New Task',
        projectId: 'proj-1',
        assigneeId: 'member-id',
      });

      const result = await service.createTask('proj-1', 'caller-id', {
        title: 'New Task',
        assigneeId: 'member-id',
      });

      expect(result.id).toBe('t-created');
      expect(prisma.task.create).toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should throw NotFoundException if task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.getTaskById('t-99', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access to task project', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 't-1', projectId: 'proj-1' });
      prisma.projectMember.findUnique.mockResolvedValue(null);

      await expect(service.getTaskById('t-1', 'user-unauth')).rejects.toThrow(ForbiddenException);
    });

    it('should return task when user belongs to project', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 't-1', projectId: 'proj-1' });
      prisma.projectMember.findUnique.mockResolvedValue({ id: 'm-1' });

      const result = await service.getTaskById('t-1', 'user-1');
      expect(result.id).toBe('t-1');
    });
  });

  describe('updateTask', () => {
    it('should throw BadRequestException if updated assignee is not a project member', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 't-1', projectId: 'proj-1' });
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ id: 'm-1' }) // caller check
        .mockResolvedValueOnce(null); // new assignee check

      await expect(
        service.updateTask('t-1', 'caller-id', { assigneeId: 'outsider-id' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update task details successfully', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 't-1', projectId: 'proj-1' });
      prisma.projectMember.findUnique.mockResolvedValue({ id: 'm-1' });
      prisma.task.update.mockResolvedValue({ id: 't-1', status: TaskStatus.DONE });

      const result = await service.updateTask('t-1', 'caller-id', { status: TaskStatus.DONE });
      expect(result.status).toBe(TaskStatus.DONE);
    });
  });

  describe('deleteTask', () => {
    it('should throw ForbiddenException if caller is not the project owner', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 't-1',
        projectId: 'proj-1',
        project: { ownerId: 'actual-owner' },
      });
      prisma.projectMember.findUnique.mockResolvedValue({ id: 'm-1', role: ProjectRole.MEMBER });

      await expect(service.deleteTask('t-1', 'regular-member')).rejects.toThrow(ForbiddenException);
    });

    it('should delete task when caller is the project owner', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 't-1',
        projectId: 'proj-1',
        project: { ownerId: 'owner-id' },
      });
      prisma.projectMember.findUnique.mockResolvedValue({ id: 'm-1', role: ProjectRole.OWNER });
      prisma.task.delete.mockResolvedValue({});

      const result = await service.deleteTask('t-1', 'owner-id');
      expect(result.message).toContain('deleted');
    });
  });
});
