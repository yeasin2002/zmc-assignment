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

- [x] Create task DTOs (`CreateTaskDto`, `UpdateTaskDto`,  `TaskQueryDto`)
- [x] Implement task CRUD endpoints:
  - `GET /api/projects/:id/tasks` (search, filter, sort, paginate)
  - `POST /api/projects/:id/tasks` (create task inside project)
  - `GET /api/tasks/:id` (task details)
  - `PATCH /api/tasks/:id` (update task status, priority, assignee, details)
  - `DELETE /api/tasks/:id` (delete task)
- [x] Enforce assignment validation in service layer (assignee must be an active project member)
- [x] Implement database-level task querying:
  - Case-insensitive search by title
  - Filter by `status` (`TODO`, `IN_PROGRESS`, `DONE`)
  - Filter by `priority` (`LOW`, `MEDIUM`, `HIGH`)
  - Filter by `assigneeId`
  - Sort by `dueDate` or `createdAt` (`asc` / `desc`)
  - Pagination (`page`, `limit`)

---

## Phase 5: Dashboard 

- [x] Implement dashboard aggregation endpoint: `GET /api/dashboard/stats`
  - Project counts: Total projects, active projects
  - Task counts: Total tasks, completed tasks, pending tasks, high-priority tasks
- [x] Implement global HTTP exception filter for consistent error responses

---

## Phase 6: Frontend Application (`apps/web` - Next.js App Router)

> **Context Alignment:** As specified in `CONTEXT.MD`, the UI does not need to be overly complex. Primary focus is on clean architecture, functionality, proper API integration, robust state handling, form validation, loading/error/empty states, and access control.

### Phase 6.1: Pure UI/UX Design & Static Mockups (No API Integration)
- [x] Setup clean design foundation (Tailwind CSS, clean fonts, curated palette, tokens)
- [x] Build reusable UI primitives focused on usability and clarity:
  - Button (with loading spinner state), Input, Textarea, Select
  - Badges (Status: Todo / In Progress / Done; Priority: Low / Medium / High; Role: Owner / Member)
  - Modal / Dialog, Metric Stat Card, Skeleton Loaders, Alert Banner, Toast Notifications
- [x] Build responsive layout shell:
  - Header (app logo, navigation links, current user profile & logout trigger)
  - Navigation between Dashboard & Projects
  - Content container with responsive padding and clean layout hierarchy
- [x] Build pure static Auth pages (mocked UI with input validation states):
  - `/register` (Full Name, Email, Password, confirm password, submit button, link to login)
  - `/login` (Email, Password, submit button, link to register)
- [x] Build pure static Dashboard view (`/dashboard` mocked UI):
  - Project stats card (Total projects, active projects)
  - Task stats cards (Total tasks, completed tasks, pending tasks, high-priority tasks)
  - Quick-access sections for active projects and pending tasks
- [x] Build pure static Projects views:
  - Projects list page (`/projects` cards with Owner/Member badge, task & member counts)
  - Create project modal dialog UI
  - Project detail page (`/projects/[id]` overview, edit project modal UI)
  - Project members panel UI (member list, role badges, add member modal UI, remove member button)
- [x] Build pure static Tasks view (`/projects/[id]`):
  - Task query toolbar (search input, status filter dropdown, priority filter dropdown, assignee filter, sort selector)
  - Task list / table with status badges, priority badges, assignee chips, due dates
  - Task creation & edit modal dialog UI with all task fields
  - Pagination bar UI (previous, next, page indicator, limit selector)
- [x] Build all 4 essential UI states across pages:
  - Loading skeleton states (table skeleton, card skeleton)
  - Error state alert with retry action
  - Informative empty states ("No projects yet", "No tasks found")
  - Success feedback indicators (toast / banner alerts)

### Phase 6.2: API Infrastructure, TanStack Query & Auth State
- [x] Install & configure dependencies (`@tanstack/react-query`, icons, utility libraries)
- [x] Setup `QueryClientProvider` and cache configuration in root layout
- [x] Build centralized API client (`lib/api-client.ts`):
  - Base URL configuration (`http://localhost:3001/api`)
  - Automatic JWT Bearer token injection from storage
  - Standardized error parsing matching backend `HttpExceptionFilter` structure (`statusCode`, `message`, `error`)
- [x] Implement Auth State Management (`context/auth-context.tsx` or hook):
  - Secure token persistence (localStorage / cookie)
  - Current user state (`user`, `isAuthenticated`, `isLoading`)
  - Session verification on mount via `GET /api/auth/me`
  - Login, register, and logout handlers
- [x] Implement Client-Side Route Protection:
  - Private routes (`/dashboard`, `/projects`, `/tasks`) -> redirect to `/login`
  - Public auth routes (`/login`, `/register`) -> redirect to `/dashboard` if authenticated

### Phase 6.3: Authentication Integration & Form Validation
- [x] Wire Register page to `POST /api/auth/register`:
  - Form validation with inline error messaging
  - Submit button loading spinner & disabled state
  - Handle 400 validation error & 409 conflict error (duplicate email)
  - Auto-login and redirect to `/dashboard` on success
- [x] Wire Login page to `POST /api/auth/login`:
  - Validation, submit spinner & disabled state
  - Handle 401 invalid credentials error alert
  - Store token, load user profile, redirect to `/dashboard`
- [x] Wire Header user profile menu to display current user details and perform Logout

### Phase 6.4: Dashboard Data Integration
- [ ] Wire `/dashboard` to `GET /api/dashboard/stats` via TanStack Query
- [ ] Bind real metrics to stat cards:
  - Total projects & active projects
  - Total tasks, completed tasks, pending tasks, high-priority tasks
- [ ] Wire quick-access lists (active projects and pending tasks)
- [ ] Implement query states (loading skeletons, error alert with retry button, empty state)

### Phase 6.5: Projects & Member Management Integration
- [ ] Projects List (`/projects`):
  - Query `GET /api/projects` via TanStack Query
  - Display project cards with role indicator (`Owner` vs `Member`)
  - Project creation mutation (`POST /api/projects`) with modal form, cache invalidation & toast
- [ ] Project Details (`/projects/[id]`):
  - Query `GET /api/projects/:id` (handle 403 Forbidden / 404 Not Found gracefully)
  - Update project mutation (`PATCH /api/projects/:id`, restricted to Owner in UI)
  - Delete project mutation (`DELETE /api/projects/:id` with confirmation modal, Owner only)
- [ ] Member Management (`/projects/[id]/members`):
  - Query `GET /api/projects/:id/members`
  - Add member mutation (`POST /api/projects/:id/members` by email, Owner only, handle 404 user not found & 409 already member)
  - Remove member mutation (`DELETE /api/projects/:id/members/:userId`, Owner only, prevent owner removal)

### Phase 6.6: Task Management & Query Operations Integration
- [ ] Tasks List Query (`GET /api/projects/:id/tasks`):
  - Implement URL query parameter synchronization (`useSearchParams` / `useRouter`):
    - `search` (debounced title keyword)
    - `status` (`TODO`, `IN_PROGRESS`, `DONE`)
    - `priority` (`LOW`, `MEDIUM`, `HIGH`)
    - `assigneeId` (filtered member)
    - `sortBy` (`createdAt` / `dueDate`) & `order` (`asc` / `desc`)
    - `page` & `limit`
  - Ensure shareable, bookmarkable filter URLs
- [ ] Task Creation (`POST /api/projects/:id/tasks`):
  - Modal form with Title, Description, Status, Priority, Due Date
  - Dynamic Assignee dropdown populated strictly from active project members
  - Cache invalidation and success feedback
- [ ] Task Updates (`PATCH /api/tasks/:id`):
  - Inline status toggle or edit modal (Status, Priority, Assignee, Details)
  - Assignee update validated against project members
- [ ] Task Deletion (`DELETE /api/tasks/:id`):
  - Owner-only delete action with confirmation modal
  - Hidden / disabled for non-owners (backend strictly enforces 403)
- [ ] Complete 4 UI states across task views:
  - Table / Card skeletons during query loading
  - Error alert with retry on query failure
  - Meaningful empty state when no tasks match current search/filters
  - Instant optimistic or query-invalidated updates

### Phase 6.7: Frontend Quality Assurance & Verification
- [ ] Role-Based Access Control Verification:
  - Owner capabilities test (update project, delete project, manage members, delete tasks)
  - Regular Member restrictions test (view project, create tasks, update status/assignment, no delete/member buttons)
- [ ] Security & Error Boundary Verification:
  - URL tampering test: navigate to unauthorized project ID -> clear 403/404 forbidden screen
  - Token expiration / invalid token test -> clean redirect to login
- [ ] Form validation edge cases (empty titles, invalid emails, weak passwords, invalid dates)
- [ ] Responsive design testing (mobile drawer/sidebar, responsive task tables and cards)
- [ ] Build & Lint verification: Run `pnpm run build` and `pnpm run lint` across entire monorepo


---

## Phase 7: Testing & Final Polish

- [x] Write backend unit & service tests (Auth, Authorization guards, Task assignment validation)
- [x] Write integration / e2e tests for core workflows
- [ ] Update root `README.md` with:
  - Architectural summary & design decisions
  - Local setup guide (Podman / Node / pnpm)
  - Migration & seed commands
  - Seed test accounts (`owner@example.com`, etc.)
  - Test run instructions

