# Backend API Server (NestJS + Prisma + PostgreSQL)

Backend service for the **Project & Task Management System**, built with NestJS, TypeScript, Prisma ORM, and PostgreSQL.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Database:** [PostgreSQL 16](https://www.postgresql.org/) (running via Podman / Docker Compose)
- **Language:** TypeScript (strict mode, native ESM)
- **Testing:** Vitest + Supertest

---

## 🗄️ Database Design

The PostgreSQL database is managed through Prisma ORM with explicit relationships, cascading rules, UUID primary keys, and query indexes.

### Entity Relationship Model

```text
User
 │
 ├── (1:N) owns ───────────────► Project
 │                                  │
 ├── (1:N) memberships ───────► ProjectMember
 │                                  │ (belongs to)
 │                                  ▼
 │                                Task
 │                                  │
 └── (1:N) assigned to ◄────────────┘
```

### Models & Schema Highlights

- **`User` (`users`)**:
  - `id`: UUID (Primary Key)
  - `email`: Unique index
  - `password`: Hashed credentials
  - Audit timestamps (`created_at`, `updated_at`)
- **`Project` (`projects`)**:
  - `id`: UUID (Primary Key)
  - `owner_id`: Foreign key to `User` with `ON DELETE CASCADE`
  - Index on `[owner_id]`
- **`ProjectMember` (`project_members`)**:
  - `id`: UUID (Primary Key)
  - `role`: Enum `ProjectRole` (`OWNER`, `MEMBER`)
  - **Composite Unique Index:** `@@unique([project_id, user_id])`
  - Foreign keys to `Project` and `User` with `ON DELETE CASCADE`
- **`Task` (`tasks`)**:
  - `id`: UUID (Primary Key)
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

## 🚀 Getting Started

### 1. Start PostgreSQL with Podman / Docker

From the root directory:

```bash
# Using Podman Compose
podman compose up -d

# Or via the root helper script
pnpm run db:up
```

### 2. Environment Variables

Create `.env` inside `apps/server/` (copied from `.env.example`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zmc_assignment?schema=public"
```

### 3. Run Migrations & Generate Client

```bash
# Apply pending migrations
pnpm run prisma:migrate

# Generate Prisma Client
pnpm run prisma:generate
```

### 4. Seed the Database

Populate realistic test data for evaluation:

```bash
pnpm run seed
```

#### Test Accounts Seeded

| Role                 | Email                 | Password       |
| -------------------- | --------------------- | -------------- |
| **Project Owner**    | `owner@example.com`   | `Password123!` |
| **Project Member 1** | `member1@example.com` | `Password123!` |
| **Project Member 2** | `member2@example.com` | `Password123!` |

---

## 🧪 Testing

```bash
# Run unit & database integration tests
pnpm run test

# Run e2e tests
pnpm run test:e2e
```
