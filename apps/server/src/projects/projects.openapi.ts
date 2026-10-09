import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/decorators/api-errors.decorator.js';

export const ProjectsOpenApi = {
  controller: () => applyDecorators(ApiTags('Projects'), ApiBearerAuth('JWT-auth')),

  listProjects: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all projects the authenticated user belongs to or owns',
      }),
      ApiResponse({ status: 200, description: 'List of projects retrieved' }),
    ),

  createProject: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new project (caller becomes owner)' }),
      ApiResponse({ status: 201, description: 'Project created successfully' }),
      ApiStandardErrors({ badRequest: 'Validation failed' }),
    ),

  getProject: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get details of a specific project (members only)' }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 200, description: 'Project details retrieved' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - user is not a member of this project',
        notFound: 'Project not found',
      }),
    ),

  updateProject: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update project details (owner only)' }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 200, description: 'Project updated successfully' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - only the project owner can update details',
        notFound: 'Project not found',
      }),
    ),

  deleteProject: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a project and its tasks (owner only)' }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 200, description: 'Project deleted successfully' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - only the project owner can delete',
        notFound: 'Project not found',
      }),
    ),

  getMembers: () =>
    applyDecorators(
      ApiOperation({ summary: 'List all members of a project (members only)' }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 200, description: 'Project members retrieved' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - not a project member',
        notFound: 'Project not found',
      }),
    ),

  addMember: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Add an existing registered user as a project member (owner only)',
      }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 201, description: 'Member added successfully' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - only owner can add members',
        notFound: 'User or project not found',
        conflict: 'User is already a member of this project',
      }),
    ),

  removeMember: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Remove a member from the project (owner only)',
      }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiParam({ name: 'userId', description: 'User UUID to remove' }),
      ApiResponse({ status: 200, description: 'Member removed successfully' }),
      ApiStandardErrors({
        badRequest: 'Bad Request - cannot remove project owner',
        forbidden: 'Forbidden - only owner can remove members',
        notFound: 'Member or project not found',
      }),
    ),
};
