import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: { ...data, email: data.email.toLowerCase().trim() },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({ orderBy: { name: 'asc' } });
    return users.map(({ password: _password, ...safeUser }) => safeUser);
  }
}
