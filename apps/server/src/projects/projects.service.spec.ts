import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: Partial<Record<keyof PrismaService, any>>;

  beforeEach(async () => {
    prisma = {
      project: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      projectMember: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('listForUser', () => {
    it('should return projects the user belongs to and attach currentUserRole', async () => {
      const mockProjects = [
        {
          id: 'proj-1',
          name: 'Project 1',
          ownerId: 'user-1',
          owner: { id: 'user-1', name: 'Owner', email: 'owner@example.com' },
          members: [{ role: ProjectRole.OWNER }],
          _count: { members: 2, tasks: 5 },
        },
      ];
      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.listForUser('user-1');
      expect(result).toHaveLength(1);
      expect(result[0]?.currentUserRole).toBe(ProjectRole.OWNER);
      expect(result[0]?.id).toBe('proj-1');
    });
  });

  describe('getProjectById', () => {
    it('should throw NotFoundException if project does not exist', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.getProjectById('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a member or owner of the project', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        name: 'Project 1',
        members: [{ userId: 'user-other', role: ProjectRole.OWNER }],
        _count: { tasks: 0, members: 1 },
      });

      await expect(service.getProjectById('proj-1', 'user-attacker')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return project details when user is an authorized member', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        name: 'Project 1',
        members: [{ userId: 'user-member', role: ProjectRole.MEMBER }],
        _count: { tasks: 3, members: 2 },
      });

      const result = await service.getProjectById('proj-1', 'user-member');
      expect(result.id).toBe('proj-1');
      expect(result.currentUserRole).toBe(ProjectRole.MEMBER);
    });
  });

  describe('create', () => {
    it('should create project and add creator as owner member', async () => {
      prisma.project.create.mockImplementation(async ({ data }: any) => ({
        id: 'proj-created',
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        owner: { id: data.ownerId, name: 'Creator', email: 'c@example.com' },
      }));

      const result = await service.create('creator-id', {
        name: 'New Project',
        description: 'Description',
      });

      expect(prisma.project.create).toHaveBeenCalled();
      expect(result.name).toBe('New Project');
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if non-owner attempts to update', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });

      await expect(
        service.update('proj-1', 'different-user', { name: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully update when caller is project owner', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });
      prisma.project.update.mockResolvedValue({
        id: 'proj-1',
        name: 'Updated Name',
      });

      const result = await service.update('proj-1', 'owner-id', {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should throw ForbiddenException if non-owner attempts to delete', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });

      await expect(service.delete('proj-1', 'non-owner')).rejects.toThrow(ForbiddenException);
    });

    it('should delete project when caller is owner', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });
      prisma.project.delete.mockResolvedValue({ id: 'proj-1' });

      const result = await service.delete('proj-1', 'owner-id');
      expect(result.message).toContain('deleted');
    });
  });

  describe('addMember', () => {
    it('should throw ForbiddenException if non-owner attempts to add members', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });

      await expect(
        service.addMember('proj-1', 'not-owner', {
          email: 'invitee@example.com',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if invited user email does not exist', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addMember('proj-1', 'owner-id', {
          email: 'missing@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user is already a member', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'target-user',
        email: 'exists@example.com',
      });
      prisma.projectMember.findUnique.mockResolvedValue({
        id: 'membership-1',
      });

      await expect(
        service.addMember('proj-1', 'owner-id', {
          email: 'exists@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully add new member when valid', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'target-user',
        email: 'new@example.com',
      });
      prisma.projectMember.findUnique.mockResolvedValue(null);
      prisma.projectMember.create.mockResolvedValue({
        id: 'mem-1',
        projectId: 'proj-1',
        userId: 'target-user',
        role: ProjectRole.MEMBER,
      });

      const result = await service.addMember('proj-1', 'owner-id', {
        email: 'new@example.com',
      });
      expect(result.role).toBe(ProjectRole.MEMBER);
    });
  });

  describe('removeMember', () => {
    it('should throw BadRequestException if owner attempts to remove themselves', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });

      await expect(service.removeMember('proj-1', 'owner-id', 'owner-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if non-owner attempts to remove member', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });

      await expect(service.removeMember('proj-1', 'not-owner', 'target-member')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should remove member when owner issues removal of regular member', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'owner-id',
      });
      prisma.projectMember.findUnique.mockResolvedValue({
        id: 'membership-target',
      });
      prisma.projectMember.delete.mockResolvedValue({});

      const result = await service.removeMember('proj-1', 'owner-id', 'regular-member');
      expect(result.message).toContain('removed');
    });
  });
});
