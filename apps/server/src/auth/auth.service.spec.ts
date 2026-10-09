import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { SafeUser, UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, any>>;
  let jwtService: Partial<Record<keyof JwtService, any>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user, hash password, and issue JWT', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation(async (data: any) => ({
        id: 'user-uuid-1',
        name: data.name,
        email: data.email,
        password: data.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await authService.register({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(usersService.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.name).toBe('New User');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@example.com',
      });

      await expect(
        authService.register({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully authenticate user with valid credentials and return JWT', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return safe user profile when user exists', async () => {
      const mockSafeUser: SafeUser = {
        id: 'user-id-123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      usersService.findById.mockResolvedValue(mockSafeUser);

      const profile = await authService.getProfile('user-id-123');
      expect(profile).toEqual(mockSafeUser);
    });
  });
});
