import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.onModuleDestroy();
    }
  });

  it('should connect to the PostgreSQL database', async () => {
    const result = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
    expect(result[0]?.result).toBe(1);
  });

  it('should query seeded users, projects and tasks with relations', async () => {
    const users = await prisma.user.findMany({
      include: {
        ownedProjects: true,
        projectMemberships: {
          include: {
            project: true,
          },
        },
        assignedTasks: true,
      },
    });

    expect(users.length).toBeGreaterThanOrEqual(3);

    const owner = users.find((u) => u.email === 'owner@example.com');
    expect(owner).toBeDefined();
    expect(owner?.name).toBe('Owner User');
    expect(owner?.ownedProjects.length).toBeGreaterThanOrEqual(1);

    const projectAlpha = await prisma.project.findFirst({
      where: { name: 'Project Alpha' },
      include: {
        owner: true,
        members: {
          include: { user: true },
        },
        tasks: {
          include: { assignee: true },
        },
      },
    });

    expect(projectAlpha).toBeDefined();
    expect(projectAlpha?.owner.email).toBe('owner@example.com');
    expect(projectAlpha?.members.length).toBe(3);
    expect(projectAlpha?.tasks.length).toBe(3);
  });
});
