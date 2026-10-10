import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/decorators/api-errors.decorator.js';

export const DashboardOpenApi = {
  controller: () => applyDecorators(ApiTags('Dashboard'), ApiBearerAuth('JWT-auth')),

  getStats: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get workspace and task aggregation statistics' }),
      ApiResponse({
        status: 200,
        description: 'Dashboard metrics retrieved successfully',
        schema: {
          example: {
            projects: { total: 3, active: 2 },
            tasks: { total: 10, completed: 4, pending: 6, highPriority: 2 },
          },
        },
      }),
      ApiStandardErrors({
        unauthorized: 'Authentication token missing or invalid',
      }),
    ),
};
