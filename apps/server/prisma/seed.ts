import {
  PrismaClient,
  ProjectRole,
  TaskPriority,
  TaskStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing records in cascade-safe order
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const owner = await prisma.user.create({
    data: {
      name: 'Owner User',
      email: 'owner@example.com',
      password: hashedPassword,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Member User 1',
      email: 'member1@example.com',
      password: hashedPassword,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Member User 2',
      email: 'member2@example.com',
      password: hashedPassword,
    },
  });

  console.log(
    `✓ Created 3 users: ${owner.email}, ${member1.email}, ${member2.email}`,
  );

  // 2. Create Projects
  const projectAlpha = await prisma.project.create({
    data: {
      name: 'Project Alpha',
      description:
        'Primary showcase project for task management and member collaboration.',
      ownerId: owner.id,
      members: {
        create: [
          { userId: owner.id, role: ProjectRole.OWNER },
          { userId: member1.id, role: ProjectRole.MEMBER },
          { userId: member2.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  const projectBeta = await prisma.project.create({
    data: {
      name: 'Project Beta',
      description:
        'Secondary project owned by Member 1 with Member 2 as collaborator.',
      ownerId: member1.id,
      members: {
        create: [
          { userId: member1.id, role: ProjectRole.OWNER },
          { userId: member2.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  console.log(
    `✓ Created 2 projects: ${projectAlpha.name}, ${projectBeta.name}`,
  );

  // 3. Create Tasks in Project Alpha
  const task1 = await prisma.task.create({
    data: {
      title: 'Task 1: Setup Architecture & Infrastructure',
      description:
        'Define database schema, initial configurations and deployment manifests.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      projectId: projectAlpha.id,
      assigneeId: null,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Task 2: Implement JWT Authentication & Guards',
      description:
        'Implement Passport strategy, project ownership and member authorization checks.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: projectAlpha.id,
      assigneeId: member1.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Task 3: Build Filterable Task Queries',
      description:
        'Implement pagination, search, status and priority filters in backend services.',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      projectId: projectAlpha.id,
      assigneeId: member2.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
    },
  });

  console.log(
    `✓ Created 3 tasks in Project Alpha: "${task1.title}", "${task2.title}", "${task3.title}"`,
  );
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
