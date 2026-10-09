# Project & Task Management System — Implementation Roadmap

A streamlined, phased task list tracking completed milestones and remaining deliverables.

---

## Phase 1: Database & Infrastructure

- [x] Configure Podman / Docker Compose for PostgreSQL 16 (`docker-compose.yml`)
- [x] Design relational Prisma schema (`User`, `Project`, `ProjectMember`, `Task`)
- [x] Configure composite unique constraints, cascading deletes, and query indexes
- [x] Generate and apply initial database migration (`init`)
- [x] Implement NestJS `PrismaService` and `PrismaModule`
- [x] Create automated database seed script with sample users, projects, and tasks (`pnpm run seed`)
- [x] Verify database connection and relational queries with integration tests
- [x] Setup Swagger / OpenAPI documentation (`@nestjs/swagger`) at `/api/docs`

---

## Phase 2: Backend Authentication (`AuthModule` & `UsersModule`)

- [x] Install auth dependencies (`@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `class-validator`, `class-transformer`)
- [x] Configure global `ValidationPipe` (`whitelist: true`, `transform: true`)
- [x] Create `RegisterDto` and `LoginDto` with strict validation rules
- [x] Implement user registration with password hashing (`bcryptjs`)
- [x] Implement user login with JWT issuance
- [x] Implement JWT Passport strategy and `JwtAuthGuard`
- [x] Create `@CurrentUser()` decorator to extract authenticated user
- [x] Add auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

---

## Phase 3: Project Management & Access Control (`ProjectsModule`)

- [x] Create project DTOs (`CreateProjectDto`, `UpdateProjectDto`, `AddMemberDto`)
- [x] Implement project CRUD endpoints:
  - `GET /api/projects` (projects user belongs to or owns)
  - `POST /api/projects` (creates project and sets user as owner)
  - `GET /api/projects/:id` (project details)
  - `PATCH /api/projects/:id` (update project - owner only)
  - `DELETE /api/projects/:id` (delete project - owner only)
- [x] Implement member management endpoints:
  - `GET /api/projects/:id/members`
  - `POST /api/projects/:id/members` (add registered user - owner only)
  - `DELETE /api/projects/:id/members/:userId` (remove member - owner only)
- [x] Implement backend authorization guards:
  - `ProjectMemberGuard` (verify user is member/owner of requested project)
  - `ProjectOwnerGuard` (verify user is owner for administrative actions)
  - Prevent unauthorized cross-project access (URL tampering prevention)

---

## Phase 4: Task Management & Query Operations (`TasksModule`)

- [ ] Create task DTOs (`CreateTaskDto`, `UpdateTaskDto`, `TaskQueryDto`)
- [ ] Implement task CRUD endpoints:
  - `GET /api/projects/:id/tasks` (search, filter, sort, paginate)
  - `POST /api/projects/:id/tasks` (create task inside project)
  - `GET /api/tasks/:id` (task details)
  - `PATCH /api/tasks/:id` (update task status, priority, assignee, details)
  - `DELETE /api/tasks/:id` (delete task)
- [ ] Enforce assignment validation in service layer (assignee must be an active project member)
- [ ] Implement database-level task querying:
  - Case-insensitive search by title
  - Filter by `status` (`TODO`, `IN_PROGRESS`, `DONE`)
  - Filter by `priority` (`LOW`, `MEDIUM`, `HIGH`)
  - Filter by `assigneeId`
  - Sort by `dueDate` or `createdAt` (`asc` / `desc`)
  - Pagination (`page`, `limit`)

---

## Phase 5: Dashboard & API Documentation

- [ ] Implement dashboard aggregation endpoint: `GET /api/dashboard/stats`
  - Project counts: Total projects, active projects
  - Task counts: Total tasks, completed tasks, pending tasks, high-priority tasks
- [ ] Implement global HTTP exception filter for consistent error responses

---

## Phase 6: Frontend Application (`apps/web` - Next.js)

- [ ] Setup API client with base URL and JWT Bearer token interceptor
- [ ] Implement authentication state management and route protection
- [ ] Build Auth pages:
  - Register page with validation and error alerts
  - Login page with redirect to dashboard
- [ ] Build Dashboard view:
  - Stat cards for project and task metrics
  - Quick access to active projects and pending tasks
- [ ] Build Projects view:
  - Project list and project creation modal/page
  - Project detail view with member list and member invitation (owner only)
- [ ] Build Task Management view:
  - Task list with URL-driven search, filtering, sorting, and pagination
  - Task creation and edit modal/form
  - Assignee selection limited to project members
- [ ] Implement core UI states across all pages:
  - Loading skeletons / spinners
  - Friendly error alerts with retry
  - Informative empty states
  - Success notifications (toasts / banners)

---

## Phase 7: Testing & Final Polish

- [ ] Write backend unit & service tests (Auth, Authorization guards, Task assignment validation)
- [ ] Write integration / e2e tests for core workflows
- [ ] Update root `README.md` with:
  - Architectural summary & design decisions
  - Local setup guide (Podman / Node / pnpm)
  - Migration & seed commands
  - Seed test accounts (`owner@example.com`, etc.)
  - Test run instructions
