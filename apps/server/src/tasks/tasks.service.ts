import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async listProjectTasks(projectId: string, userId: string, query: TaskQueryDto) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!membership) {
      const exists = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!exists) throw new NotFoundException('Project not found');
      throw new ForbiddenException('You do not have access to this project');
    }

    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.assigneeId && { assigneeId: query.assigneeId }),
      ...(query.search && { title: { contains: query.search, mode: 'insensitive' } }),
    };

    const sortBy = query.sortBy ?? 'createdAt';
    const order = query.order ?? 'desc';
    const orderBy: Prisma.TaskOrderByWithRelationInput = { [sortBy]: order };

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [total, tasks] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { assignee: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data: tasks,
      meta: { total, page, limit, totalPages },
    };
  }

  async createTask(projectId: string, userId: string, dto: CreateTaskDto) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!membership) {
      const exists = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!exists) throw new NotFoundException('Project not found');
      throw new ForbiddenException('You do not have access to this project');
    }

    if (dto.assigneeId) {
      const assigneeMember = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: dto.assigneeId } },
      });
      if (!assigneeMember) {
        throw new BadRequestException('Task assignee must be a member of this project');
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? TaskPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        projectId,
        assigneeId: dto.assigneeId ?? null,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, ownerId: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async updateTask(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('You do not have access to this task');
    }

    if (dto.assigneeId) {
      const assigneeMember = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: dto.assigneeId } },
      });
      if (!assigneeMember) {
        throw new BadRequestException('Task assignee must be a member of this project');
      }
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        description: dto.description !== undefined ? dto.description?.trim() : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
        priority: dto.priority !== undefined ? dto.priority : undefined,
        dueDate:
          dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
        assigneeId: dto.assigneeId !== undefined ? dto.assigneeId : undefined,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (task.project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can delete tasks');
    }

    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: 'Task deleted successfully' };
  }
}
