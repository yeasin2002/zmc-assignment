import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { where: { userId }, select: { role: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((project) => {
      const currentUserRole = project.members[0]?.role ?? ProjectRole.MEMBER;
      const { members: _m, ...rest } = project;
      return { ...rest, currentUserRole };
    });
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    const membership = project.members.find((m) => m.userId === userId);
    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return { ...project, currentUserRole: membership.role };
  }

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        ownerId: userId,
        members: { create: { userId, role: ProjectRole.OWNER } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { members: true, tasks: true } },
      },
    });
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can update project details');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        description: dto.description !== undefined ? dto.description?.trim() : undefined,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async delete(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can delete this project');
    }

    await this.prisma.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted successfully' };
  }

  async getMembers(projectId: string, userId: string) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership) {
      const exists = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!exists) throw new NotFoundException('Project not found');
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(projectId: string, ownerId: string, dto: AddMemberDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('Only the project owner can add members to this project');
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!userToAdd) {
      throw new NotFoundException(`User with email "${dto.email}" was not found`);
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });
    if (existingMember) {
      throw new ConflictException('This user is already a member of the project');
    }

    return this.prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role: ProjectRole.MEMBER },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(projectId: string, ownerId: string, memberUserId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId !== ownerId) {
      throw new ForbiddenException('Only the project owner can remove members from this project');
    }

    if (memberUserId === ownerId) {
      throw new BadRequestException('The project owner cannot be removed from the project');
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    });
    if (!membership) {
      throw new NotFoundException('Member not found in this project');
    }

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    });

    return { message: 'Member removed from project successfully' };
  }
}
