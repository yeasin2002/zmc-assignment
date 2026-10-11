# Project & Task Management System — Code Quality Audit & Senior Engineering Review

**Role / Perspective:** Senior System Analytics Software Engineer & Engineering Manager  
**Primary Ground Truth:** [`CONTEXT.MD`](file:///d:/programming/collabration/zmc-assignment/CONTEXT.MD) *(Single Source of Truth)*  
**Secondary References:** [`AGENTS.md`](file:///d:/programming/collabration/zmc-assignment/AGENTS.md) | [`TASK.md`](file:///d:/programming/collabration/zmc-assignment/TASK.md)  
**Review Target:** Full Monorepo Workspace (`apps/server`, `apps/web`, Database, Infrastructure, Configurations)

---

## 1. Executive Summary & Assessment Overview

The codebase represents a **high-caliber implementation** of the Project & Task Management System. The architecture strictly fulfills the core technical objectives outlined in [`CONTEXT.MD`](file:///d:/programming/collabration/zmc-assignment/CONTEXT.MD):
- **NestJS backend** with modular architecture, strict DTO validation pipes, global exception filtering, and relational Prisma modeling.
- **Next.js 16 (App Router)** frontend utilizing clean typography, accessible primitives, a 2-layer API structure (Axios + TanStack Query v5), URL-synchronized task filter state, and all 4 essential UI states (loading skeleton, error alert with retry, empty states, success feedback).
- **Relational PostgreSQL database** with UUID primary keys, composite unique index constraints, indexed search/filter columns, and cascade rules.
- **High test coverage:** 39 backend unit tests and 46 end-to-end integration tests passing with 0 failures.

However, from a Senior Systems Analytics and Code Quality standpoint, several **actionable discrepancies, configuration gaps, data-integrity edge cases, and architectural redundancies** must be resolved before final submission.

---

## 2. Evaluation Against Single Source of Truth (`CONTEXT.MD`)

| Requirement from `CONTEXT.MD` | Implementation Status | Quality & Engineering Verdict |
| :--- | :---: | :--- |
| **User registration & login (JWT)** | ✅ Complete | bcrypt password hashing (10 rounds), strict character complexity regex, JWT token issuance. Normalized email handling. |
| **Projects: Create, manage, and add registered users** | ✅ Complete | Project CRUD implemented; users added by email; owner vs member roles enforced. |
| **Tasks: Multiple tasks per project with assignee, status, priority, due date** | ✅ Complete | Fields: `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `priority` (`LOW`, `MEDIUM`, `HIGH`), `dueDate`, `assigneeId`, `projectId`. |
| **Assignee validation: Active project member only** | ⚠️ Partial Bug | **Edge case discovered:** While initial assignment verifies membership, removing a member does not unassign their tasks, creating orphaned assignees (see High Priority Task #2). |
| **Task list: Database search, filter, sort, paginate** | ✅ Complete | Handled 100% in PostgreSQL via Prisma (`where`, `orderBy`, `skip`, `take`), with URL synchronization on frontend. |
| **Authorization: Owner vs Member separation** | ✅ Complete | Owner has exclusive permissions for project update/delete, member add/remove, and task deletion. Cross-project URL tampering strictly returns `403 Forbidden` / `404 Not Found`. |
| **Dashboard: Overview of projects and tasks** | ✅ Complete | Aggregated metrics: Total projects, active projects, total tasks, completed tasks, pending tasks, high-priority tasks. |
| **Tech Stack: Next.js, NestJS, PostgreSQL, TypeScript, Prisma, REST API, JWT** | ✅ Complete | Monorepo structured with Turborepo and pnpm workspaces. Zero non-conforming technologies. |
| **UI: Focused on usability and architecture, not over-complex visuals** | ✅ Complete | Clean, high-legibility layout (`#fbfbf5` canvas, `#ffffff` cards), Tabler icons, responsive tables and modals. No unnecessary visual bloat. |
| **API Documentation: Swagger / OpenAPI** | ✅ Complete | Interactive Swagger UI served at `/api/docs` with bearer token auth and status codes. |
| **Database Migrations & Seed Script** | ⚠️ Script Discrepancy | Valid Prisma migration exists; seed populates exact scenario. **However, root scripts documented in `README.md` are missing from `package.json`** (see High Priority Task #1). |

---

## 3. Prioritized Task List for Engineering Remediation

Below is the complete priority-ranked list of all issues, bugs, redundancies, and missing elements identified during the audit.

```mermaid
graph TD
    A[Code Quality & System Audit] --> H[High Priority: 4 Critical Fixes]
    A --> M[Medium Priority: 6 Architectural & Quality Fixes]
    A --> L[Low Priority: 4 Cleanups & Refinements]

    H --> H1[Missing Root Scripts in package.json]
    H --> H2[Orphaned Tasks on Member Removal]
    H --> H3[Missing Environment Variables in .env]
    H --> H4[Turborepo server#build Cache Warning]

    M --> M1[Dual DB Queries: Guard vs Service]
    M --> M2[Inconsistent Guard Usage Across Controllers]
    M --> M3[Oxlint Warnings in Test File]
    M --> M4[Hardcoded JWT Expiration & Fallback Secret]
    M --> M5[Permissive CORS in Backend]
    M --> M6[Dashboard 6-Query Optimization]

    L --> L1[Unused lucide-react Dependency]
    L --> L2[Vitest tsconfig-paths Plugin Deprecation]
    L --> L3[Client-Side Projects Filter Clarification]
    L --> L4[Development Mock Preview Scaffolding]
```

---

### 🔴 HIGH PRIORITY — Critical Bugs, Broken Commands & Data Integrity

#### Task H-1: Fix Missing Root Scripts in [`package.json`](file:///d:/programming/collabration/zmc-assignment/package.json)
- **Problem:**
  The root [`README.md`](file:///d:/programming/collabration/zmc-assignment/README.md#L164-L168) and [`AGENTS.md`](file:///d:/programming/collabration/zmc-assignment/AGENTS.md) explicitly direct the reviewer to execute:
  ```bash
  pnpm run db:migrate
  pnpm run db:generate
  pnpm run db:seed
  ```
  However, in root [`package.json`](file:///d:/programming/collabration/zmc-assignment/package.json), these scripts **do not exist** (only `"seed"` exists, without `"db:seed"`, `"db:migrate"`, or `"db:generate"`). Additionally, there is no root `"test"` script.
  A reviewer running these documented setup commands will immediately face `ERR_PNPM_NO_SCRIPT Missing script: db:migrate`.
- **Impact:** Reviewer setup failure, poor first impression.
- **Action Required:**
  Add the following scripts to root [`package.json`](file:///d:/programming/collabration/zmc-assignment/package.json):
  ```json
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types",
    "seed": "pnpm --filter server run seed",
    "db:up": "podman compose up -d",
    "db:down": "podman compose down",
    "db:migrate": "pnpm --filter server run prisma:migrate",
    "db:generate": "pnpm --filter server run prisma:generate",
    "db:seed": "pnpm --filter server run seed"
  }
  ```

---

#### Task H-2: Prevent Orphaned Task Assignees When a Member is Removed
- **Location:** [`apps/server/src/projects/projects.service.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/projects/projects.service.ts#L150-L174)
- **Problem:**
  In `ProjectsService.removeMember()`, the service executes:
  ```ts
  await this.prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  });
  ```
  In [`schema.prisma`](file:///d:/programming/collabration/zmc-assignment/apps/server/prisma/schema.prisma#L99), `Task.assigneeId` is a foreign key to `User(id)` (`onDelete: SetNull`), **not** to `ProjectMember(id)`.
  When a member is removed from the project, their `ProjectMember` row is deleted, but their user ID remains attached to any tasks assigned to them in that project!
  This creates a severe business logic violation:
  1. The task list returns an assignee who is no longer a member of the project.
  2. Filtering by `assigneeId` still returns the removed user's tasks.
  3. Violates the core rule: *"A task can only be assigned to a user who is an active member or owner of that specific project."*
- **Action Required:**
  Before deleting the `ProjectMember`, nullify the `assigneeId` of all tasks in that project that were assigned to the removed member:
  ```ts
  await this.prisma.$transaction([
    this.prisma.task.updateMany({
      where: { projectId, assigneeId: memberUserId },
      data: { assigneeId: null },
    }),
    this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    }),
  ]);
  ```

---

#### Task H-3: Complete Environment Variable Definitions & Examples
- **Location:** [`apps/server/.env`](file:///d:/programming/collabration/zmc-assignment/apps/server/.env), [`apps/server/.env.example`](file:///d:/programming/collabration/zmc-assignment/apps/server/.env.example), and `apps/web`
- **Problem:**
  1. Both `apps/server/.env` and `apps/server/.env.example` omit `JWT_SECRET`, `JWT_EXPIRES_IN`, and `PORT`.
  2. `apps/server/src/auth/auth.module.ts` and `jwt.strategy.ts` fall back to a hardcoded string (`'default-jwt-secret-key-for-zmc'`).
  3. `apps/web` has no `.env.example` file committed at all, despite [`README.md`](file:///d:/programming/collabration/zmc-assignment/README.md#L156-L159) stating it requires `NEXT_PUBLIC_API_URL`.
- **Action Required:**
  1. Update [`apps/server/.env.example`](file:///d:/programming/collabration/zmc-assignment/apps/server/.env.example) and [`apps/server/.env`](file:///d:/programming/collabration/zmc-assignment/apps/server/.env):
     ```env
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zmc_assignment?schema=public"
     JWT_SECRET="super-secret-jwt-key-replace-in-production"
     JWT_EXPIRES_IN="7d"
     PORT=3001
     ```
  2. Create `apps/web/.env.example`:
     ```env
     NEXT_PUBLIC_API_URL="http://localhost:3001/api"
     ```

---

#### Task H-4: Fix Turborepo Cache Output Warning for `server#build`
- **Location:** [`turbo.json`](file:///d:/programming/collabration/zmc-assignment/turbo.json#L5-L9)
- **Problem:**
  When executing `pnpm run build`, Turborepo emits a build warning:
  `WARNING no output files found for task server#build. Please check your outputs key in turbo.json`
  This happens because `turbo.json` defines outputs only as:
  ```json
  "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**"]
  ```
  The NestJS backend compiles to `dist/**`. Because `dist/**` is missing, Turborepo cannot cache or track the server build artifact.
- **Action Required:**
  Update [`turbo.json`](file:///d:/programming/collabration/zmc-assignment/turbo.json#L8):
  ```json
  "outputs": ["dist/**", ".next/**", "!.next/cache/**", "!.next/dev/**"]
  ```

---

### 🟡 MEDIUM PRIORITY — Architecture, Redundancy & Conventions

#### Task M-1: Eliminate Dual Database Roundtrips in `ProjectsController`
- **Location:** [`apps/server/src/projects/projects.controller.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/projects/projects.controller.ts#L41-L63) & [`projects.service.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/projects/projects.service.ts#L35-L56)
- **Problem:**
  When a user requests `GET /api/projects/:id`:
  1. [`ProjectMemberGuard`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/projects/guards/project-member.guard.ts#L29-L34) executes 2 database queries:
     - `prisma.project.findUnique({ where: { id: projectId } })`
     - `prisma.projectMember.findUnique({ where: { projectId_userId } })`
  2. The guard attaches `request.project = project; request.projectRole = membership.role;`.
  3. The controller then calls `projectsService.getProjectById(id, userId)`.
  4. `ProjectsService.getProjectById` runs a **third** database query:
     - `prisma.project.findUnique(...)` with nested joins, and re-verifies `membership`.
  - Result: 3 separate database calls for a single read request.
- **Action Required:**
  Either:
  - Consolidate verification in the service (matching the clean single-query approach used in [`TasksService`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/tasks/tasks.service.ts#L17-L25)), OR
  - Inject the already verified project from `request.project` to avoid repeating redundant `findUnique` calls.

---

#### Task M-2: Resolve Inconsistent Guard Usage Between Projects & Tasks
- **Location:** [`apps/server/src/projects/projects.controller.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/projects/projects.controller.ts) vs [`apps/server/src/tasks/tasks.controller.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/tasks/tasks.controller.ts)
- **Problem:**
  - `ProjectsController` delegates authorization to `@UseGuards(ProjectMemberGuard)` and `@UseGuards(ProjectOwnerGuard)`.
  - `TasksController` has **zero** guards on route handlers (`projects/:id/tasks`, `tasks/:id`). All checks are done manually inside `TasksService`.
  - Furthermore, [`AGENTS.md`](file:///d:/programming/collabration/zmc-assignment/AGENTS.md) documents a `@ProjectRole('OWNER' | 'MEMBER')` custom decorator, but this decorator does not exist in the codebase.
- **Action Required:**
  Standardize the architectural convention across both controllers. If services are the source of truth for business checks, document that clearly in the README. Remove the nonexistent `@ProjectRole` decorator reference from `AGENTS.md` to prevent reviewer confusion.

---

#### Task M-3: Fix Oxlint Unused Import Warnings
- **Location:** [`apps/server/src/dashboard/dashboard.service.spec.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/dashboard/dashboard.service.spec.ts#L2)
- **Problem:**
  Running `pnpm run lint` flags 2 warnings:
  ```text
  ! eslint(no-unused-vars): Identifier 'TaskPriority' is imported but never used.
  ! eslint(no-unused-vars): Identifier 'TaskStatus' is imported but never used.
  ```
- **Action Required:**
  Remove unused `TaskPriority` and `TaskStatus` imports from `src/dashboard/dashboard.service.spec.ts:2`.

---

#### Task M-4: Centralize JWT Configuration & Config Service
- **Location:** [`apps/server/src/auth/auth.module.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/auth/auth.module.ts#L14-L17) & [`apps/server/src/auth/strategies/jwt.strategy.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/auth/strategies/jwt.strategy.ts#L17)
- **Problem:**
  - `signOptions: { expiresIn: '7d' }` is hardcoded in `AuthModule` rather than reading from `process.env.JWT_EXPIRES_IN`.
  - Secret fallback `'default-jwt-secret-key-for-zmc'` is copy-pasted in two separate files.
- **Action Required:**
  Use a single config helper or read `process.env.JWT_EXPIRES_IN ?? '7d'`. In production mode, throw an explicit error during bootstrap if `JWT_SECRET` is unset.

---

#### Task M-5: Restrict Permissive CORS in Backend
- **Location:** [`apps/server/src/main.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/main.ts#L11)
- **Problem:**
  `app.enableCors();` allows unrestricted cross-origin requests from any website.
- **Action Required:**
  Restrict CORS to configured client origin:
  ```ts
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  ```

---

#### Task M-6: Optimize Dashboard Query Aggregation (Performance Opportunity)
- **Location:** [`apps/server/src/dashboard/dashboard.service.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/src/dashboard/dashboard.service.ts#L30-L53)
- **Problem:**
  `getStats(userId)` triggers 6 separate database count queries in parallel.
- **Observation:**
  While completely acceptable for a mid-level project assignment, senior-level code would group the task queries using `this.prisma.task.groupBy` by `status` and `priority` to reduce 4 roundtrips down to 1. Document this in `README.md` under architectural trade-offs.

---

### 🟢 LOW PRIORITY — Scaffolding Cleanup & Code Polish

#### Task L-1: Remove Dead Dependency `lucide-react`
- **Location:** [`apps/web/package.json`](file:///d:/programming/collabration/zmc-assignment/apps/web/package.json#L19)
- **Problem:**
  `"lucide-react": "^1.53.0"` is installed, but 0 files import it (the frontend exclusively uses `@tabler/icons-react`).
- **Action Required:**
  Run `pnpm --filter web remove lucide-react`.

---

#### Task L-2: Remove Deprecated `vite-tsconfig-paths` in Vitest Config
- **Location:** [`apps/server/vitest.config.ts`](file:///d:/programming/collabration/zmc-assignment/apps/server/vitest.config.ts#L7)
- **Problem:**
  Vitest logs:
  `The plugin "vite-tsconfig-paths" is detected. Vite now supports tsconfig paths resolution natively via the resolve.tsconfigPaths option.`
- **Action Required:**
  Update `vitest.config.ts` to use `resolve: { tsconfigPaths: true }` and remove the plugin call to keep test output clean.

---

#### Task L-3: Remove Mock Preview Scaffolding from RouteGuard
- **Location:** [`apps/web/components/auth/route-guard.tsx`](file:///d:/programming/collabration/zmc-assignment/apps/web/components/auth/route-guard.tsx#L19-L24)
- **Problem:**
  Lines 19-24 contain:
  ```ts
  const isPreview =
    typeof window !== 'undefined' &&
    (window.location.search.includes('preview=true') ||
      localStorage.getItem('zmc_preview_mode') === 'true');
  ```
  This was developer scaffolding for previewing mock pages during Phase 6.1. Now that real auth is functional, this bypass is obsolete and should be removed.

---

#### Task L-4: Clean Up NPM Dependencies in `apps/web/package.json`
- **Location:** [`apps/web/package.json`](file:///d:/programming/collabration/zmc-assignment/apps/web/package.json)
- **Observation:**
  - `"cn": "^0.4.0"` is used via [`apps/web/lib/utils.ts`](file:///d:/programming/collabration/zmc-assignment/apps/web/lib/utils.ts) (`export { cn } from "cn"`).
  - `"shadcn"` CLI is placed in `dependencies` rather than `devDependencies`.
- **Action Required:**
  Move `"shadcn"` to `devDependencies`.

---

## 4. Over-Engineering Analysis (Keeping it Simple)

[`CONTEXT.MD`](file:///d:/programming/collabration/zmc-assignment/CONTEXT.MD) explicitly instructs:
> *"The UI does not need to be very complex. Our main focus should be on functionality, architecture, and code quality."*
> *"We are not doing over-engineering so strictly follow the context."*

### What Was Done Right (Avoided Over-Engineering):
1. **No complex state libraries:** Avoided pulling in Redux, Zustand, or Jotai. React Context for Auth and TanStack Query for server state is the cleanest, simplest pattern.
2. **No WebSockets / Realtime Overkill:** Polling / query invalidation handles updates on mutations cleanly without requiring socket servers or Redis pub/sub.
3. **No Overcomplicated UI Animations:** No Framer Motion or heavy CSS physics libraries; clean Tailwind transitions and subtle pulse skeletons keep bundle size small and rendering fast.
4. **URL-driven State Over Ad-hoc State:** Filters and sorting are stored directly in query params, avoiding synchronized reducer trees.

### Areas of Slight Over-Abstraction to Note:
1. **Swagger Decorator Splitting (`auth.openapi.ts`, `projects.openapi.ts`):**
   Splitting OpenAPI decorators into separate helper objects is a clean architectural pattern, but for a 5-day assignment, standard NestJS inline Swagger decorators (`@ApiOperation`, `@ApiResponse`) are simpler and more conventional. However, this is working flawlessly and does not need to be refactored.
2. **Two-Layer API (`query-list/` + `api-hooks/`):**
   Separating pure Axios calls and React Query hooks creates extra boilerplate (two files per entity), but provides strict type safety. It is an acceptable trade-off.

---

## 5. Review Summary & Readiness Verdict

| Category | Score | Summary |
| :--- | :---: | :--- |
| **Architecture & Separation of Concerns** | **9.5 / 10** | Thin controllers, thick services, isolated query/hook layers. |
| **Database Design & Modeling** | **9.5 / 10** | UUID PKs, composite unique indexes, comprehensive query indexes. |
| **Authentication & Authorization (RBAC)** | **9.0 / 10** | Strict JWT validation, ownership enforcement, URL tampering proofing. |
| **Code Quality & TypeScript** | **9.0 / 10** | Strict TypeScript across backend and frontend, clean DTOs. |
| **Test Quality & Coverage** | **9.8 / 10** | 39 unit tests + 46 e2e integration tests passing cleanly. |
| **Developer Experience & Local Setup** | **7.5 / 10** | Deducted due to missing root scripts (`db:migrate`, `db:seed`) and missing `.env` fields. |

### Overall Verdict:
**Ready for Submission after resolving High Priority Tasks H-1, H-2, H-3, and H-4.**
Once those 4 items are addressed, this repository will represent an exemplary mid-level full-stack submission that fully honors [`CONTEXT.MD`](file:///d:/programming/collabration/zmc-assignment/CONTEXT.MD).
