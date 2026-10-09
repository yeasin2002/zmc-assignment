import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/decorators/api-errors.decorator.js';

export const TasksOpenApi = {
  controller: () => applyDecorators(ApiTags('Tasks'), ApiBearerAuth()),

  listProjectTasks: () =>
    applyDecorators(
      ApiOperation({ summary: 'List tasks in project with search, filter, sort, and pagination' }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 200, description: 'Tasks list with pagination metadata' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - not a project member',
        notFound: 'Project not found',
      }),
    ),

  createTask: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a task inside a project' }),
      ApiParam({ name: 'id', description: 'Project UUID' }),
      ApiResponse({ status: 201, description: 'Task created successfully' }),
      ApiStandardErrors({
        badRequest: 'Validation failed or assignee is not a project member',
        forbidden: 'Forbidden - not a project member',
        notFound: 'Project not found',
      }),
    ),

  getTask: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get task details by ID' }),
      ApiParam({ name: 'id', description: 'Task UUID' }),
      ApiResponse({ status: 200, description: 'Task details retrieved successfully' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - not a project member',
        notFound: 'Task not found',
      }),
    ),

  updateTask: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a task' }),
      ApiParam({ name: 'id', description: 'Task UUID' }),
      ApiResponse({ status: 200, description: 'Task updated successfully' }),
      ApiStandardErrors({
        badRequest: 'Validation failed or assignee is not a project member',
        forbidden: 'Forbidden - not a project member',
        notFound: 'Task not found',
      }),
    ),

  deleteTask: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a task (project owner only)' }),
      ApiParam({ name: 'id', description: 'Task UUID' }),
      ApiResponse({ status: 200, description: 'Task deleted successfully' }),
      ApiStandardErrors({
        forbidden: 'Forbidden - only project owner can delete tasks',
        notFound: 'Task not found',
      }),
    ),
};
