import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/decorators/api-errors.decorator.js';

export const AuthOpenApi = {
  controller: () => applyDecorators(ApiTags('Authentication')),

  register: () =>
    applyDecorators(
      ApiOperation({ summary: 'Register a new user account' }),
      ApiResponse({
        status: 201,
        description: 'User registered successfully with signed JWT',
      }),
      ApiStandardErrors({
        badRequest: 'Validation failed (e.g. invalid email or weak password)',
        conflict: 'An account with this email already exists',
      }),
    ),

  login: () =>
    applyDecorators(
      ApiOperation({ summary: 'Authenticate user and receive a JWT token' }),
      ApiResponse({
        status: 200,
        description: 'Authenticated successfully with signed JWT',
      }),
      ApiStandardErrors({
        unauthorized: 'Invalid email or password credentials',
      }),
    ),

  me: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Get current authenticated user profile' }),
      ApiResponse({
        status: 200,
        description: 'Profile of the currently authenticated user',
      }),
      ApiStandardErrors({
        unauthorized: 'Missing, invalid, or expired Bearer token',
      }),
    ),
};
