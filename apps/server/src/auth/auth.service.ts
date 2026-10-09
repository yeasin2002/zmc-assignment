import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { SafeUser, UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const createdUser = await this.usersService.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const accessToken = this.jwtService.sign({ sub: createdUser.id, email: createdUser.email });
    const { password: _password, ...user } = createdUser;
    return { accessToken, user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password: _password, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
