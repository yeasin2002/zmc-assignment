# Backend API Server (NestJS + Prisma + PostgreSQL)

Backend service for the **Project & Task Management System**, built with NestJS, TypeScript, Prisma ORM, and PostgreSQL.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [NestJS 11](https://nestjs.com/) (Modular architecture, Dependency Injection)
- **Language:** TypeScript 5 (Strict Mode, native ESM)
- **ORM:** [Prisma ORM 6](https://www.prisma.io/)
- **Database:** [PostgreSQL 16](https://www.postgresql.org/) (Containerized via Podman / Docker Compose)
- **Authentication:** JWT with Passport Strategy & bcrypt password hashing
- **Validation:** `class-validator` & `class-transformer` via global `ValidationPipe` (`whitelist: true`, `transform: true`)
- **Documentation:** OpenAPI 3.0 via `@nestjs/swagger` at `/api/docs`
- **Testing:** Vitest + Supertest

---

## 🏗️ Module Architecture & Separation of Concerns

The backend follows strict separation of concerns:
- **Controllers** remain thin: handling only HTTP routing, status codes, and DTO extraction.
- **Services** encapsulate all business logic, permission verification, and database interactions.
- **Guards** enforce authentication and project role authorization before controller handlers execute.
- **Global Filter** (`AllExceptionsFilter`) formats uniform error responses across all endpoints.

```text
apps/server/src/
├── auth/                 # Registration, login, JWT issuance, Passport strategy
├── users/                # User lookup & profile queries
├── projects/             # Project CRUD, membership management & access guards
├── tasks/                # Task CRUD, multi-criteria filtering, sorting & pagination
├── dashboard/            # Aggregated user-level project and task statistics
├── prisma/               # Global Prisma client provider
├── common/               # Custom decorators (@CurrentUser, @ProjectRole), filters, guards
└── main.ts               # Application bootstrap, Swagger setup & global pipes
```

---

## 🔐 Authorization Matrix & Guards

| Role | Access Scope |
| :--- | :--- |
| **Owner** | Full administrative rights: update/delete project, invite/remove members, create/update/delete tasks. |
| **Member** | Collaborative rights: view project, view members, create tasks, update status/assignment/due date. No delete or member management rights. |
| **Non-Member** | Completely denied access with `403 Forbidden` / `404 Not Found`. |

### Guard Implementations
- `JwtAuthGuard`: Validates Bearer token in request header `Authorization: Bearer <token>`.
- `ProjectMemberGuard`: Verifies that the authenticated user is an active member or owner of `:id` / `:projectId`.
- `ProjectOwnerGuard`: Verifies that the authenticated user is the designated owner of `:id` / `:projectId`.

---

## 🗄️ Database Design

The schema is defined in [prisma/schema.prisma](prisma/schema.prisma) with explicit relations, indexes, and cascades.

### Entity Relationship Model

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

### Models & Schema Highlights

- **`User` (`users`)**:
  - `id`: UUID Primary Key (`gen_random_uuid()`)
  - `email`: Unique index
  - `password`: Hashed credentials via `bcrypt`
  - Audit timestamps (`created_at`, `updated_at`)
- **`Project` (`projects`)**:
  - `id`: UUID Primary Key
  - `owner_id`: Foreign key to `User` with `ON DELETE CASCADE`
  - Index on `[owner_id]`
- **`ProjectMember` (`project_members`)**:
  - `id`: UUID Primary Key
  - `role`: Enum `ProjectRole` (`OWNER`, `MEMBER`)
  - **Composite Unique Index:** `@@unique([project_id, user_id])`
  - Foreign keys to `Project` and `User` with `ON DELETE CASCADE`
- **`Task` (`tasks`)**:
  - `id`: UUID Primary Key
  - `status`: Enum `TaskStatus` (`TODO`, `IN_PROGRESS`, `DONE`)
  - `priority`: Enum `TaskPriority` (`LOW`, `MEDIUM`, `HIGH`)
  - `assignee_id`: Foreign key to `User` with `ON DELETE SET NULL`
  - `project_id`: Foreign key to `Project` with `ON DELETE CASCADE`
  - **Query Indexes:**
    - `@@index([project_id])`
    - `@@index([project_id, status])`
    - `@@index([project_id, priority])`
    - `@@index([project_id, assignee_id])`
    - `@@index([project_id, created_at])`
    - `@@index([project_id, due_date])`
    - `@@index([assignee_id])`

---

## 📡 RESTful API Reference

Interactive documentation is available at **`http://localhost:3001/api/docs`**.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new account (`email`, `password`, `name`) | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |

### 2. Projects (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/projects` | List all projects where caller is owner/member | Yes (Bearer) |
| `POST` | `/api/projects` | Create a new project (caller assigned as OWNER) | Yes (Bearer) |
| `GET` | `/api/projects/:id` | Get project detail | Yes (Member/Owner) |
| `PATCH` | `/api/projects/:id` | Update project name or description | Yes (Owner only) |
| `DELETE` | `/api/projects/:id` | Delete project and cascade child tasks/members | Yes (Owner only) |

### 3. Project Members (`/api/projects/:id/members`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/projects/:id/members` | List all members of a project | Yes (Member/Owner) |
| `POST` | `/api/projects/:id/members` | Add registered user as member (`email` or `userId`) | Yes (Owner only) |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member from project | Yes (Owner only) |

### 4. Tasks (`/api/projects/:id/tasks` & `/api/tasks/:id`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/projects/:id/tasks` | List tasks with search, filter, sort, and pagination | Yes (Member/Owner) |
| `POST` | `/api/projects/:id/tasks` | Create a new task within project | Yes (Member/Owner) |
| `GET` | `/api/tasks/:id` | Get single task detail | Yes (Member/Owner) |
| `PATCH` | `/api/tasks/:id` | Update task fields (status, priority, assignee, etc.) | Yes (Member/Owner) |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes (Owner only) |

**Query Parameters for Task Listing:**
- `search`: Keyword string (matches title case-insensitively).
- `status`: Filter by `TODO`, `IN_PROGRESS`, `DONE`.
- `priority`: Filter by `LOW`, `MEDIUM`, `HIGH`.
- `assigneeId`: Filter tasks assigned to a specific user UUID.
- `sortBy`: Sort by `dueDate` or `createdAt`.
- `order`: Sort direction (`asc` or `desc`).
- `page`: Page index (default: 1).
- `limit`: Items per page (default: 10).

### 5. Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/dashboard/stats` | Aggregated project & task stats for the user | Yes (Bearer) |

---

## 🚀 Getting Started

### 1. Database Setup
```bash
# Start PostgreSQL via Podman or Docker Compose from repository root
podman compose up -d
```

### 2. Environment Variables
Create `.env` in `apps/server/`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zmc_assignment?schema=public"
JWT_SECRET="super-secret-jwt-key-replace-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

### 3. Run Migrations & Generate Prisma Client
```bash
pnpm run prisma:migrate
pnpm run prisma:generate
```

### 4. Seed Database
```bash
pnpm run seed
```

#### Pre-seeded Test Accounts:
- **`owner@example.com`** / `Password123!` (Owner of Project Alpha)
- **`member1@example.com`** / `Password123!` (Member of Project Alpha, Owner of Project Beta)
- **`member2@example.com`** / `Password123!` (Member of Project Alpha, Member of Project Beta)

### 5. Start Server
```bash
# Development mode with hot-reload
pnpm run start:dev

# Production build and run
pnpm run build
pnpm run start:prod
```

---

## 🧪 Testing

```bash
# Run unit & service tests (Vitest)
pnpm run test

# Run end-to-end integration tests (Vitest + Supertest)
pnpm run test:e2e
```
