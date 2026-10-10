import { Test, TestingModule } from '@nestjs/testing';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    project: { count: ReturnType<typeof vi.fn> };
    task: { count: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      project: { count: vi.fn() },
      task: { count: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('should aggregate project and task counts scoped to the authenticated user', async () => {
      // Mock counts
      prisma.project.count
        .mockResolvedValueOnce(3) // total projects
        .mockResolvedValueOnce(2); // active projects

      prisma.task.count
        .mockResolvedValueOnce(10) // total tasks
        .mockResolvedValueOnce(4) // completed tasks
        .mockResolvedValueOnce(6) // pending tasks
        .mockResolvedValueOnce(2); // high priority tasks

      const stats = await service.getStats('user-123');

      expect(stats).toEqual({
        projects: {
          total: 3,
          active: 2,
        },
        tasks: {
          total: 10,
          completed: 4,
          pending: 6,
          highPriority: 2,
        },
      });

      // Verify queries were scoped to user-123
      expect(prisma.project.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            members: { some: { userId: 'user-123' } },
          }),
        }),
      );

      expect(prisma.task.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: { members: { some: { userId: 'user-123' } } },
          }),
        }),
      );
    });

    it('should return zeroed statistics for a user with no projects or tasks', async () => {
      prisma.project.count.mockResolvedValue(0);
      prisma.task.count.mockResolvedValue(0);

      const stats = await service.getStats('empty-user');

      expect(stats).toEqual({
        projects: { total: 0, active: 0 },
        tasks: { total: 0, completed: 0, pending: 0, highPriority: 0 },
      });
    });
  });
});
