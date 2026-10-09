# OpenAPI / Swagger Documentation Standard

This document outlines the OpenAPI (Swagger) architectural standard adopted across the backend server application. It explains the rationale, core mechanics, folder structure, reusable helpers, and step-by-step instructions for implementing OpenAPI documentation in both current and future modules.

---

## 1. Architectural Overview & Rationale

### The Problem in Traditional NestJS Controllers

In standard NestJS applications, documenting endpoints with `@nestjs/swagger` requires stacking numerous decorators on every controller class and method:

```typescript
// ❌ Cluttered Controller Anti-Pattern
@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  @Get('projects/:id/tasks')
  @ApiOperation({ summary: 'List tasks in project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Tasks list with pagination metadata' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a project member' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async listProjectTasks(...) { ... }
}
```

When applied across dozens of endpoints, controller files quickly become 70% documentation boilerplate and only 30% application logic. This obscures routing, parameter bindings, guards, and status codes.

### The Solution: Dedicated Module OpenAPI Files

We separate documentation concerns into a dedicated `<module-name>.openapi.ts` file adjacent to `<module-name>.controller.ts`.

- **`*.controller.ts`**: Pure HTTP transport layer (routing paths, guards, parameter mapping, calling services).
- **`*.openapi.ts`**: Pure documentation layer (OpenAPI operation summaries, tags, parameters, schemas, response codes).
- **`*.service.ts`**: Pure business logic and database interactions.

```typescript
// ✅ Clean Controller with Composed OpenAPI Decorators
@TasksOpenApi.controller()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  @Get('projects/:id/tasks')
  @TasksOpenApi.listProjectTasks()
  async listProjectTasks(...) { ... }
}
```

---

## 2. Core Mechanics: How It Works Under the Hood

### 1. NestJS `applyDecorators`

NestJS provides `applyDecorators` from `@nestjs/common` to compose multiple decorators into a single method or class decorator:

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const FeatureOpenApi = {
  myEndpoint: () =>
    applyDecorators(
      ApiOperation({ summary: 'Description of endpoint' }),
      ApiResponse({ status: 200, description: 'Success' }),
    ),
};
```

When NestJS and `@nestjs/swagger` inspect metadata via reflection (`Reflect.metadata`) at application startup, `applyDecorators` applies all composed decorators to the target method and descriptor identically to having written them inline.

### 2. Reusable Shared Error Decorator (`ApiStandardErrors`)

Located in [`src/common/decorators/api-errors.decorator.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/common/decorators/api-errors.decorator.ts), this helper standardizes common HTTP error responses across the entire application:

```typescript
export interface ApiErrorOptions {
  badRequest?: string | boolean; // 400
  unauthorized?: string | boolean; // 401
  forbidden?: string | boolean; // 403
  notFound?: string | boolean; // 404
  conflict?: string | boolean; // 409
}
```

#### Usage Modes:

- **Custom description string**:
  ```typescript
  ApiStandardErrors({
    forbidden: 'Forbidden - not a project member',
    notFound: 'Project not found',
  });
  ```
- **Boolean flag (falls back to standard message)**:
  ```typescript
  ApiStandardErrors({
    badRequest: true, // "Bad Request - validation failed"
    forbidden: true, // "Forbidden - insufficient permissions"
  });
  ```

### 3. JWT Security Scheme Association

In [`src/lib/swagger.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/lib/swagger.ts), the Swagger DocumentBuilder configures:

```typescript
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    in: 'header',
  },
  'JWT-auth', // <-- Scheme identifier
)
```

Therefore, all protected controllers and endpoints declare:

```typescript
ApiBearerAuth('JWT-auth');
```

This binds protected endpoints to the Swagger UI "Authorize" modal and locks icon.

---

## 3. Directory & File Organization

Each module follows this uniform structure:

```text
apps/server/src/
├── common/
│   └── decorators/
│       └── api-errors.decorator.ts   <-- Shared response helpers
├── auth/
│   ├── auth.controller.ts            <-- Thin controller
│   ├── auth.openapi.ts               <-- Auth documentation decorators
│   ├── auth.service.ts
│   └── auth.module.ts
├── projects/
│   ├── projects.controller.ts        <-- Thin controller
│   ├── projects.openapi.ts           <-- Projects documentation decorators
│   ├── projects.service.ts
│   └── projects.module.ts
└── tasks/
    ├── tasks.controller.ts           <-- Thin controller
    ├── tasks.openapi.ts              <-- Tasks documentation decorators
    ├── tasks.service.ts
    └── tasks.module.ts
```

---

## 4. Implementation Guide for New Modules

When building a new module (e.g. `dashboard`), follow these steps:

### Step 1: Create `<module>.openapi.ts`

```typescript
// src/dashboard/dashboard.openapi.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/decorators/api-errors.decorator.js';

export const DashboardOpenApi = {
  // 1. Controller-level tags and security
  controller: () => applyDecorators(ApiTags('Dashboard'), ApiBearerAuth('JWT-auth')),

  // 2. Endpoint-level decorators
  getStats: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get workspace and task aggregation statistics' }),
      ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' }),
      ApiStandardErrors({
        unauthorized: 'Authentication token missing or invalid',
      }),
    ),
};
```

### Step 2: Use in `<module>.controller.ts`

```typescript
// src/dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { DashboardOpenApi } from './dashboard.openapi.js';
import { DashboardService } from './dashboard.service.js';

@DashboardOpenApi.controller()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @DashboardOpenApi.getStats()
  async getStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStats(userId);
  }
}
```

---

## 5. Current Module Reference Examples

### A. Auth Module ([`src/auth/auth.openapi.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/auth/auth.openapi.ts))

- **`controller`**: Adds `ApiTags('Authentication')`.
- **`register`**: Documents `201 Created` with signed JWT, plus `400` validation error and `409` duplicate email conflict.
- **`login`**: Documents `200 OK` with signed JWT, plus `401` invalid credentials.
- **`me`**: Documents `200 OK` current user profile with `ApiBearerAuth('JWT-auth')` and `401` unauthorized.

### B. Projects Module ([`src/projects/projects.openapi.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/projects/projects.openapi.ts))

- **`controller`**: Adds `ApiTags('Projects')` and `ApiBearerAuth('JWT-auth')`.
- **`listProjects`**, **`createProject`**, **`getProject`**, **`updateProject`**, **`deleteProject`**: Complete CRUD documentation with `400`, `403`, `404` error scenarios.
- **`getMembers`**, **`addMember`**, **`removeMember`**: Project membership lifecycle with `403` owner-only checks and `409` duplicate membership errors.

### C. Tasks Module ([`src/tasks/tasks.openapi.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/tasks/tasks.openapi.ts))

- **`controller`**: Adds `ApiTags('Tasks')` and `ApiBearerAuth('JWT-auth')`.
- **`listProjectTasks`**: Documents search, filter, sort, and pagination query params with `200`, `403`, `404`.
- **`createTask`**, **`getTask`**, **`updateTask`**, **`deleteTask`**: Validation and assignment permission rules.

---

## 6. Best Practices & Conventions

1. **Keep Object Method Names Aligned with Controller Methods**:
   Name methods in `<Module>OpenApi` identical to the controller methods (`listProjectTasks`, `createTask`, etc.) to make navigation and maintenance seamless.
2. **ES Module Imports (`.js`)**:
   Because `"type": "module"` is configured in `package.json`, always include the `.js` extension on relative imports:
   ```typescript
   import { ApiStandardErrors } from '../common/decorators/api-errors.decorator.js';
   import { TasksOpenApi } from './tasks.openapi.js';
   ```
3. **Never Put Swagger Decorators in Services**:
   Services must remain transport-agnostic and contain only business logic. Keep all OpenAPI metadata exclusively inside `*.openapi.ts`.
4. **Use Explicit Security Names**:
   Always pass `'JWT-auth'` to `ApiBearerAuth('JWT-auth')` so it maps to the registered security definition.
5. **Validation Testing**:
   Whenever new endpoints or documentation decorators are added, run:
   ```bash
   pnpm test:e2e
   ```
   The `test/swagger.e2e-spec.ts` test automatically validates that the generated OpenAPI JSON schema is valid, healthy, and accessible at `/api/docs`.
