import { Injectable } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string): Promise<DashboardStats> {
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
    ] = await Promise.all([
      this.prisma.project.count({
        where: { members: { some: { userId } } },
      }),
      this.prisma.project.count({
        where: {
          members: { some: { userId } },
          tasks: { some: { status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } } },
        },
      }),
      this.prisma.task.count({ where: { project: { members: { some: { userId } } } } }),
      this.prisma.task.count({
        where: { project: { members: { some: { userId } } }, status: TaskStatus.DONE },
      }),
      this.prisma.task.count({
        where: {
          project: { members: { some: { userId } } },
          status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        },
      }),
      this.prisma.task.count({
        where: { project: { members: { some: { userId } } }, priority: TaskPriority.HIGH },
      }),
    ]);

    return {
      projects: { total: totalProjects, active: activeProjects },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        highPriority: highPriorityTasks,
      },
    };
  }
}
