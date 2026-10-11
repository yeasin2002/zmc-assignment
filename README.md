# Project & Task Management System (Monorepo)

A production-ready full-stack **Project & Task Management System** developed with **NestJS**, **Next.js 16 (App Router)**, **PostgreSQL 16**, **Prisma ORM**, and **TypeScript** in a **Turborepo** monorepo workspace.

---

## 📋 Table of Contents

- [Overview & Objectives](#-overview--objectives)
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
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) | Robust relational ACID database with indexing and cascading referential integrity. |
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

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js:** `>= 20.x`
- **pnpm:** `>= 9.x` (or `>= 10.x`)
- **Podman** or **Docker Compose**

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/yeasin2002/zmc-assignment.git
cd zmc-assignment
pnpm install
```

### 3. Start Database Container
```bash
# Using Podman Compose
podman compose up -d

# Or using Docker Compose
docker compose up -d

# Or via npm script helper
pnpm run db:up
```

### 4. Configure Environment Variables

**Backend (`apps/server/.env`):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zmc_assignment?schema=public"
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
pnpm run db:migrate
pnpm run db:generate

# Populate realistic seed test accounts & tasks
pnpm run db:seed
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

The automated seed script populates the database with realistic collaboration scenarios:

| User Name | Email Address | Password | Workspace Role & Scope |
| :--- | :--- | :--- | :--- |
| **Owner User** | `owner@example.com` | `Password123!` | • **Owner** of **Project Alpha**<br>• Full administrative capabilities |
| **Member User 1** | `member1@example.com` | `Password123!` | • **Member** in **Project Alpha** (Assigned Task 2)<br>• **Owner** of **Project Beta** |
| **Member User 2** | `member2@example.com` | `Password123!` | • **Member** in **Project Alpha** (Assigned Task 3)<br>• **Member** in **Project Beta** |

### Workspace Scenarios
- **Project Alpha:** Owned by `owner@example.com`. Members include `member1@example.com` and `member2@example.com`. Contains 3 tasks in `Todo`, `In Progress`, and `Done` states.
- **Project Beta:** Owned by `member1@example.com`. Member includes `member2@example.com`. Used to verify project isolation (e.g., logging in as `owner@example.com` and attempting to access Project Beta yields a `403 Forbidden`).

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

## 💡 Design Decisions & Trade-offs

1. **Lightweight & Focused Aesthetic:** Strict Light Mode palette (`#fbfbf5` canvas, `#ffffff` cards) with Tabler icons and Sonner notifications.
2. **Two-Layer API Architecture:** Separation between Layer 1 Axios query calls (`api/query-list/`) and Layer 2 React Query hooks (`api/api-hooks/`) ensures maintainability and modularity.
3. **URL-Synchronized Filter State:** Search keywords, filters, sorting, and pagination parameters are synced with URL search params, allowing views to be bookmarked and shared.
4. **Thin Controllers & Thick Services:** Controllers only handle HTTP transport, routing, and DTO extraction. All business rules (e.g. member validation before task assignment) reside exclusively in service methods.
5. **Component Sizing & Reusability:** Complex screens are decomposed into focused subcomponents (tasks table, task modal, member list, settings, delete dialog) staying well under 350 lines per file.
