# Project & Task Management System (Monorepo)

A production-ready full-stack **Project & Task Management System** developed with **NestJS**, **Next.js 16 (App Router)**, **PostgreSQL 16**, **Prisma ORM**, and **TypeScript** in a **Turborepo** monorepo workspace.

---

## 📋 Table of Contents

- [Overview & Objectives](#-overview--objectives)
- [Quick Test Credentials](#-quick-test-credentials)
- [Monorepo Architecture](#-monorepo-architecture)
- [Technology Stack & Rationale](#-technology-stack--rationale)
- [Security & Access Control (RBAC)](#-security--access-control-rbac)
- [Database Design & Relationships](#-database-design--relationships)
- [Local Development Setup](#-local-development-setup)
- [Seed Test Accounts & Scenarios](#-seed-test-accounts--scenarios)
- [API Documentation (Swagger)](#-api-documentation-swagger)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Design Decisions & Trade-offs](#-design-decisions--trade-offs)

---

## 🎯 Overview & Objectives

This system provides a collaborative task management workspace where users can:
- Register securely and authenticate using JSON Web Tokens (JWT).
- Create and manage projects as an **Owner** with full administrative authority.
- Collaborate as a **Member** with restricted, collaborative permissions.
- Manage tasks with real-time database-level search, filtering, sorting, and pagination.
- View real-time aggregated productivity metrics on a dedicated dashboard.
- Experience a resilient frontend interface handling loading skeletons, error boundaries, empty states, and responsive viewports.

---

## 🔑 Quick Test Credentials

The database is pre-seeded on **Neon Serverless PostgreSQL** with 3 test accounts. All accounts share the same password:

> **Universal Password:** `Password123!`

| Account | Email Address | Password | Role & Scope |
| :--- | :--- | :--- | :--- |
| **Owner User** | `owner@example.com` | `Password123!` | • **Owner** of **Project Alpha** (Full admin access)<br>• Can create/edit/delete tasks and manage members |
| **Member User 1** | `member1@example.com` | `Password123!` | • **Member** in **Project Alpha** (Collaborator, assigned Task 2)<br>• **Owner** of **Project Beta** |
| **Member User 2** | `member2@example.com` | `Password123!` | • **Member** in **Project Alpha** (Assigned Task 3)<br>• **Member** in **Project Beta** |

---

## 🏗️ Monorepo Architecture

The repository is managed via **Turborepo** and **pnpm workspaces**:

```text
zmc-assignment/
├── apps/
│   ├── server/               # NestJS 11 REST API Backend
│   │   ├── prisma/           # Schema, migrations, and seed script
│   │   ├── src/              # Modular architecture (auth, users, projects, tasks, dashboard)
│   │   └── test/             # Vitest unit & e2e integration suites
│   └── web/                  # Next.js 16 (App Router) Frontend
│       ├── api/              # Layer 1 (Query List) & Layer 2 (TanStack Query Hooks)
│       ├── app/              # App router pages (dashboard, projects, auth)
│       ├── components/       # UI components, layout, dialogs, forms
│       ├── context/          # Auth context & RouteGuard
│       └── lib/              # Centralized Axios client & helpers
├── docker-compose.yml        # PostgreSQL 16 container definition
└── package.json              # Monorepo scripts and Turbo configuration
```

---

## 🛠️ Technology Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | [NestJS](https://nestjs.com/) | Enterprise modular architecture, dependency injection, declarative validation pipes, guards, and interceptors. |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) | Modern React 19 App Router, Turbopack high-speed bundler, Partial Prerendering, and static optimization. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type safety enforced across backend DTOs, Prisma models, API contracts, and frontend hooks. |
| **Database** | [Neon](https://neon.tech/) / [PostgreSQL 16](https://www.postgresql.org/) | Serverless cloud PostgreSQL with connection pooling & autoscaling (with local Docker Compose support). |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | Declarative schema modeling, automatic migration generation, type-safe database queries. |
| **API Client & Cache** | [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/) | 2-layer API pattern (Query List + Custom Hooks), automatic cache invalidation, and 401 interception. |
| **Styling & Components**| [Tailwind CSS v4](https://tailwindcss.com/) + [Base UI](https://base-ui.com/) | Strict light-mode aesthetic (`#fbfbf5` canvas, `#ffffff` cards), clean typography, accessible dialogs. |
| **Icons & Alerts** | [Tabler Icons](https://tabler.io/icons) + [Sonner](https://sonner.emilkowal.ski/) | Consistent vector icon set and non-intrusive toast notification alerts. |
| **Testing** | [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest) | Blazing-fast unit and end-to-end testing with native ESM execution. |

---

## 🔐 Security & Access Control (RBAC)

Authorization is strictly enforced in the **NestJS backend services and guards**, never relying solely on client-side UI visibility.

### Permission Matrix

| Capability | Project Owner | Project Member | Non-Member / Unauthenticated |
| :--- | :---: | :---: | :---: |
| View Project & Task Details | ✅ | ✅ | ❌ (403 / 404 Forbidden) |
| Create Tasks in Project | ✅ | ✅ | ❌ (403 Forbidden) |
| Update Task Status / Assignment | ✅ | ✅ | ❌ (403 Forbidden) |
| Delete Tasks | ✅ | ❌ | ❌ (403 Forbidden) |
| Add / Remove Project Members | ✅ | ❌ | ❌ (403 Forbidden) |
| Update Project Name / Description | ✅ | ❌ | ❌ (403 Forbidden) |
| Delete Project | ✅ | ❌ | ❌ (403 Forbidden) |
| View Dashboard Analytics | ✅ (Own Scope) | ✅ (Own Scope) | ❌ (401 Unauthorized) |

### Defense-in-Depth Mechanisms
1. **Guards:** Custom `@ProjectRole('OWNER' | 'MEMBER')`, `JwtAuthGuard`, `ProjectMemberGuard`, and `ProjectOwnerGuard`.
2. **Assignee Verification:** Tasks can **only** be assigned to active members of that specific project.
3. **URL Tampering Protection:** Attempting to query or manipulate a project or task belonging to another workspace returns a `403 Forbidden` / `404 Not Found` response.
4. **Token Expiration Interceptor:** On `401 Unauthorized`, the client automatically purges credentials and triggers a clean redirect to `/login?redirect=...`.

---

## 🗄️ Database Design & Relationships

```text
User (users)
 │
 ├── (1:N) owns ───────────────► Project (projects)
 │                                  │
 ├── (1:N) memberships ───────► ProjectMember (project_members)
 │                                  │ (belongs to)
 │                                  ▼
 │                                Task (tasks)
 │                                  │
 └── (1:N) assigned to ◄────────────┘
```

- **UUID Primary Keys:** Random UUIDs prevent enumeration attacks.
- **Composite Unique Index:** `@@unique([projectId, userId])` prevents duplicate memberships.
- **Query Indexes:** Indexes placed on `projectId`, `[projectId, status]`, `[projectId, priority]`, `[projectId, assigneeId]`, `[projectId, createdAt]`, and `[projectId, dueDate]` for fast multi-dimensional querying.
- **Cascading Rules:** Deleting a project automatically cascades to all child tasks and memberships. Removing an assigned user sets `task.assigneeId` to `NULL`.

---

## 🚀 Local Development & Database Setup

### 1. Prerequisites
- **Node.js:** `>= 20.x`
- **pnpm:** `>= 9.x` (or `>= 10.x`)
- **Database:** Hosted on **Neon Serverless PostgreSQL** (or locally via Podman / Docker Compose)

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/yeasin2002/zmc-assignment.git
cd zmc-assignment
pnpm install
```

### 3. Database Options

The project is connected to **Neon Serverless PostgreSQL** in the cloud, removing the need to run local database software. However, `docker-compose.yml` is retained if offline container development is preferred.

```bash
# OPTION A (Default): Neon Cloud PostgreSQL
# Pre-configured in .env - No local database container required!

# OPTION B (Local Docker fallback, if desired):
docker compose up -d  # or: podman compose up -d
```

### 4. Configure Environment Variables

**Backend (`apps/server/.env`):**
```env
# Neon Serverless PostgreSQL connection strings
DATABASE_URL="postgresql://default:ZHqV0fuj4vIw@ep-dry-mode-a1f3a48u-pooler.ap-southeast-1.aws.neon.tech/verceldb?sslmode=require"
DIRECT_URL="postgresql://default:ZHqV0fuj4vIw@ep-dry-mode-a1f3a48u.ap-southeast-1.aws.neon.tech/verceldb?sslmode=require"

JWT_SECRET="super-secret-jwt-key-replace-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

**Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 5. Run Migrations & Seed Database
```bash
# Apply Prisma migrations and generate client
pnpm --filter server run prisma:generate
pnpm --filter server exec prisma migrate deploy

# Populate realistic seed test accounts & tasks
pnpm run seed
```

### 6. Run the Applications
```bash
# Start both apps concurrently via Turborepo
pnpm run dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API Server:** [http://localhost:3001](http://localhost:3001)
- **Interactive Swagger Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

## 👥 Seed Test Accounts & Scenarios

The database on **Neon Serverless PostgreSQL** is pre-populated with realistic collaboration and permission scenarios:

| User Name | Email Address | Password | Database User ID (UUID) | Workspace Role & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Owner User** | `owner@example.com` | `Password123!` | `1ce66eb3-1617-439d-a073-c3280722265b` | • **Owner** of **Project Alpha**<br>• Full administrative capabilities |
| **Member User 1** | `member1@example.com` | `Password123!` | `20f5bbff-6019-4f1b-b9c1-2e58ab980a6c` | • **Member** in **Project Alpha** (Assigned Task 2)<br>• **Owner** of **Project Beta** |
| **Member User 2** | `member2@example.com` | `Password123!` | `94d6a1b2-bede-432c-9bc8-2ca7d0c07f15` | • **Member** in **Project Alpha** (Assigned Task 3)<br>• **Member** in **Project Beta** |

### Workspace Scenarios & Test IDs
- **Project Alpha (`c969c08f-2a03-44da-895d-744dbb1be6ad`):**
  - **Owner:** `owner@example.com`
  - **Members:** `member1@example.com`, `member2@example.com`
  - **Tasks:**
    - Task 1: *"Setup Architecture & Infrastructure"* — `TODO`, Priority `LOW`, Unassigned
    - Task 2: *"Implement JWT Authentication & Guards"* — `IN_PROGRESS`, Priority `HIGH`, Assigned to `member1@example.com`
    - Task 3: *"Build Filterable Task Queries"* — `DONE`, Priority `MEDIUM`, Assigned to `member2@example.com`
- **Project Beta (`985693ec-b04d-4a58-b74f-2285319d068d`):**
  - **Owner:** `member1@example.com`
  - **Member:** `member2@example.com`
  - **Isolation Verification:** Logging in as `owner@example.com` and attempting to view/modify Project Beta returns `403 Forbidden` / `404 Not Found`.

---

## 📖 API Documentation (Swagger)

Interactive OpenAPI 3.0 documentation is served at:
**[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

### Key Endpoint Groups

#### Authentication
- `POST /api/auth/register` — Register a new user account.
- `POST /api/auth/login` — Authenticate credentials and receive Bearer JWT.

#### Projects & Members
- `GET /api/projects` — List all projects where user is owner or member.
- `POST /api/projects` — Create a new project (caller becomes owner).
- `GET /api/projects/:id` — Get project details (Owner or Member).
- `PATCH /api/projects/:id` — Update title/description (Owner only).
- `DELETE /api/projects/:id` — Delete project (Owner only).
- `GET /api/projects/:id/members` — List project members.
- `POST /api/projects/:id/members` — Add member by email (Owner only).
- `DELETE /api/projects/:id/members/:userId` — Remove member (Owner only).

#### Tasks
- `GET /api/projects/:id/tasks` — List tasks with query filtering (`search`, `status`, `priority`, `assigneeId`, `sortBy`, `order`, `page`, `limit`).
- `POST /api/projects/:id/tasks` — Create task within project.
- `GET /api/tasks/:id` — Get task detail.
- `PATCH /api/tasks/:id` — Update status, priority, assignee, due date, description.
- `DELETE /api/tasks/:id` — Delete task (Owner only).

#### Dashboard
- `GET /api/dashboard/stats` — User-scoped project and task statistics.

---

## 🧪 Testing & Quality Assurance

### Run Backend Tests
```bash
# Unit & service tests (Vitest)
pnpm --filter server run test

# End-to-end integration tests (Vitest + Supertest)
pnpm --filter server run test:e2e
```
- **Unit Tests:** 39 passed across Auth, Project, Task, Dashboard, and Prisma services.
- **E2E Tests:** 46 passed across complete API lifecycle and authorization rejection scenarios.

### Linting & Production Build
```bash
# Lint entire monorepo
pnpm run lint

# Build all applications for production
pnpm run build
```

---
