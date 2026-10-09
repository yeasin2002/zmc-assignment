import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { SafeUser } from '../users/users.service.js';
import { AuthResponse, AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully with signed JWT',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g. invalid email or weak password)',
  })
  @ApiConflictResponse({
    description: 'An account with this email already exists',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and receive a JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated successfully with signed JWT',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password credentials',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile of the currently authenticated user',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired Bearer token',
  })
  getProfile(@CurrentUser() user: SafeUser): SafeUser {
    return user;
  }
}
