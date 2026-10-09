import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export interface ApiErrorOptions {
  badRequest?: string | boolean;
  unauthorized?: string | boolean;
  forbidden?: string | boolean;
  notFound?: string | boolean;
  conflict?: string | boolean;
}

export function ApiStandardErrors(options: ApiErrorOptions = {}) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [];

  if (options.badRequest) {
    decorators.push(
      ApiResponse({
        status: 400,
        description:
          typeof options.badRequest === 'string'
            ? options.badRequest
            : 'Bad Request - validation failed',
      }),
    );
  }

  if (options.unauthorized) {
    decorators.push(
      ApiResponse({
        status: 401,
        description:
          typeof options.unauthorized === 'string'
            ? options.unauthorized
            : 'Unauthorized - invalid or missing credentials',
      }),
    );
  }

  if (options.forbidden) {
    decorators.push(
      ApiResponse({
        status: 403,
        description:
          typeof options.forbidden === 'string'
            ? options.forbidden
            : 'Forbidden - insufficient permissions',
      }),
    );
  }

  if (options.notFound) {
    decorators.push(
      ApiResponse({
        status: 404,
        description: typeof options.notFound === 'string' ? options.notFound : 'Resource not found',
      }),
    );
  }

  if (options.conflict) {
    decorators.push(
      ApiResponse({
        status: 409,
        description:
          typeof options.conflict === 'string'
            ? options.conflict
            : 'Conflict - resource already exists',
      }),
    );
  }

  return applyDecorators(...decorators);
}
