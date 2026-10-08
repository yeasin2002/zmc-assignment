# Project & Task Management System

> **Role Level:** Mid-Level Full-Stack Developer  
> **Core Stack:** Next.js, NestJS, PostgreSQL, TypeScript, Prisma
> **Duration:** 5 Working Days

---

## Table of Contents

1. [Assignment Overview & Objective](#1-assignment-overview--objective)
2. [Technology Stack](#2-technology-stack)
3. [Authentication](#3-authentication)
4. [Project Management](#4-project-management)
5. [Project Members & Access Control](#5-project-members--access-control)
6. [Task Management](#6-task-management)
7. [Task List (Search, Filter, Sort, Paginate)](#7-task-list)
8. [Authorization & Security Scenarios](#8-authorization--access-control)
9. [Dashboard](#9-dashboard)
10. [Backend Requirements (NestJS)](#10-backend-requirements)
    - [A. Module, Controller & Service Structure](#a-module--controller--service-structure)
    - [B. DTOs & Request Validation](#b-dtos--validation)
    - [C. Authentication & Authorization](#c-authentication--authorization)
    - [D. Error Handling](#d-error-handling)
    - [E. RESTful API Design](#e-api-design)
    - [F. Separation of Business Logic](#f-separation-of-business-logic)
    - [G. Database Relationships & Query Design](#g-database-relationships--design)
11. [Database Design & Migrations](#11-database-design)
12. [Frontend Requirements (Next.js)](#12-frontend-requirements)
13. [Testing Requirements](#13-basic-testing)
14. [API Documentation](#14-api-documentation)
15. [Seed Data & Test Accounts](#15-seed-data)
16. [Submission Requirements](#16-submission-requirements)
17. [Time Limit & Expectations](#17-time-limit)
18. [Prioritization & Incomplete Features Policy](#18-incomplete-features-are-okay)
19. [Evaluation Criteria & Review Focus](#19-what-we-expect)

---

## 1. Assignment Overview & Objective

Build a full-stack **Project & Task Management System** where users can register, log in, create projects, manage project members, and create and manage tasks within projects.

The purpose of this assignment is to evaluate whether a candidate has the experience and architectural maturity expected of a **mid-level full-stack developer**, specifically using **NestJS**, **Next.js**, **PostgreSQL**, and **TypeScript**.

The primary focus is **not** on complex UI visual effects, but on:

- Clean software architecture and separation of concerns
- Sound database design, normalization, indexing, and relationships
- Robust backend-enforced authentication and authorization
- Defensive programming, data validation, and meaningful error handling
- Maintainable, readable, and well-organized TypeScript code

---

## 2. Technology Stack

| Layer                | Technology                                    | Specification / Requirement                   |
| -------------------- | --------------------------------------------- | --------------------------------------------- |
| **Frontend**         | [Next.js](https://nextjs.org/)                | App Router or Pages Router with TypeScript    |
| **Backend**          | [NestJS](https://nestjs.com/)                 | Modular architecture with TypeScript          |
| **Language**         | [TypeScript](https://www.typescriptlang.org/) | Strict typing across backend and frontend     |
| **Database**         | [PostgreSQL](https://www.postgresql.org/)     | Relational database schema with migrations    |
| **ORM**              | [Prisma](https://www.prisma.io/)              | Schema definitions, relations, and migrations |
| **API Architecture** | REST API                                      | Clean HTTP status codes and predictable paths |
| **Authentication**   | JWT (JSON Web Tokens)                         | Secure token-based authentication             |

> [!NOTE]
> You may use helper libraries (e.g. `class-validator`, `class-transformer`, Tailwind CSS, UI component libraries, etc.), but the core technologies above must be used.

---

## 3. Authentication

The system must allow users to register and securely log in.

### Required Functionality

- **User Registration:** Collect at minimum: Full Name, Email address, and Password.
- **User Login:** Authenticate credentials and return a signed JWT.
- **Protected Routes:** Ensure private application endpoints and frontend pages require a valid JWT.
- **Token Handling:** Securely extract user identity (e.g., via NestJS Passport strategy / guards) on protected requests.

### Security & Validation Rules

- Passwords must **never be stored in plain text** (use a strong hashing algorithm like bcrypt or argon2).
- Email addresses must be validated and enforced as unique.
- Strong password validation rules must be applied (minimum length, character complexity).
- Appropriate HTTP error responses must be returned for invalid credentials or duplicate accounts.

---

## 4. Project Management

Authenticated users must be able to create, view, update, and manage projects.

### Project Fields

- **ID:** Unique identifier (UUID or auto-incrementing ID)
- **Name:** Project title/name
- **Description:** Project summary or detailed information
- **Owner:** Reference to the user who created the project
- **Created Date (`createdAt`):** Timestamp
- **Updated Date (`updatedAt`):** Timestamp

### Ownership & Rules

- The user who creates a project automatically becomes its **Owner**.
- The Project Owner has the authority to add or remove registered users as project members.
- Projects must only be accessible to their owner and designated members.

---

## 5. Project Members & Access Control

Each project can have multiple members.

```text
Project
 ├── Owner (Creator, Full Administrative Permissions)
 ├── Member A (Assigned User)
 ├── Member B (Assigned User)
 └── Member C (Assigned User)
```

### Roles and Permissions

The application must clearly distinguish between:

1. **Project Owner:** Full permissions (manage project details, manage members, delete project, create/update/assign/delete all tasks).
2. **Project Member:** Collaborative permissions (view project, create tasks, view tasks, update status/assignment according to project rules).

> [!IMPORTANT]
> The exact permission matrix can be tailored to your design, but it must be logical, clearly documented, and **strictly enforced on the backend**.

---

## 6. Task Management

Every project contains multiple tasks. Project members interact with tasks based on their permissions.

### Minimum Task Fields

| Field                     | Type               | Description                                                |
| ------------------------- | ------------------ | ---------------------------------------------------------- |
| `id`                      | Identifier         | Unique ID (UUID or number)                                 |
| `title`                   | String             | Short title of the task                                    |
| `description`             | Text               | Detailed task description                                  |
| `status`                  | Enum / String      | `Todo`, `In Progress`, `Done`                              |
| `priority`                | Enum / String      | `Low`, `Medium`, `High`                                    |
| `assignee`                | Relation (User)    | Project member assigned to the task (nullable or required) |
| `dueDate`                 | DateTime           | Optional task deadline                                     |
| `projectId`               | Relation (Project) | The project the task belongs to                            |
| `createdAt` / `updatedAt` | DateTime           | Audit timestamps                                           |

### Task Statuses & Priorities

- **Statuses (Minimum):** `Todo`, `In Progress`, `Done` (extendable if justified).
- **Priorities (Minimum):** `Low`, `Medium`, `High`.
- **Assignment Validation:** A task can only be assigned to a user who is an active member or owner of that specific project.

---

## 7. Task List

The task list must support real-world data querying operations efficiently:

### Required Operations

1. **Search:** Search tasks by title (case-insensitive keyword search).
2. **Filtering:**
   - Filter by `status` (e.g. `Todo`, `In Progress`, `Done`)
   - Filter by `priority` (e.g. `Low`, `Medium`, `High`)
   - Filter by `assignee` (filter tasks assigned to a specific member)
3. **Sorting:** Sort by `dueDate` or `createdAt` in ascending (`asc`) or descending (`desc`) order.
4. **Pagination:** Page-based (`page`, `limit`) or cursor-based pagination.

> [!IMPORTANT]
> Filtering, sorting, and pagination must be handled **in the database and backend queries**, not by fetching all records and filtering in-memory in the browser.

---

## 8. Authorization & Access Control

Authorization is a central pillar of this evaluation. **Authentication alone is not sufficient.**

### Security Scenario Example

Suppose:

- `Project A` belongs to `User A` and `User B`.
- `Project B` belongs to `User C` and `User D`.

If `User A` changes the URL or API request from:

```http
GET /projects/101
```

to:

```http
GET /projects/202
```

The backend must reject the request with `403 Forbidden` (or `404 Not Found`).

### Protected Scenarios

Authorization checks must be implemented and verified for:

- Reading project details and member lists
- Adding or removing project members
- Creating tasks within a project
- Modifying, deleting, or reassigning tasks
- Accessing project-level dashboard analytics

> [!CAUTION]
> Relying solely on client-side conditional rendering (e.g., hiding a button) is unacceptable. Every mutating and read operation must verify ownership or membership in the NestJS service/guard layer.

---

## 9. Dashboard

Provide a clean, focused dashboard giving an overview of the user's projects and workload.

### Key Metrics

- **Project Statistics:**
  - Total projects user belongs to
  - Active projects
- **Task Statistics:**
  - Total tasks
  - Completed tasks (`Done`)
  - Pending tasks (`Todo`, `In Progress`)
  - High-priority tasks

Metrics can be presented using stat cards, tables, or lightweight charts. High visual complexity is not required; accurate backend query aggregation is what counts.

---

## 10. Backend Requirements

The backend must be structured with **NestJS**. Pay special attention to the following aspects:

### A. Module / Controller / Service Structure

Organize features into dedicated, modular domains:

- `AuthModule` (registration, login, JWT strategy, guards)
- `UsersModule` (user lookup, profile)
- `ProjectsModule` (project CRUD, membership management)
- `TasksModule` (task CRUD, filtering, pagination)

Controllers must remain thin, handling only HTTP transport, routing, and status codes. All business logic belongs in services.

### B. DTOs & Validation

- Use Data Transfer Objects (DTOs) with `class-validator` and `class-transformer` for all payloads.
- Explicit validation on:
  - Auth: `RegisterDto`, `LoginDto`
  - Projects: `CreateProjectDto`, `UpdateProjectDto`, `AddMemberDto`
  - Tasks: `CreateTaskDto`, `UpdateTaskDto`
  - Queries: `TaskQueryDto` (pagination, filter, sort parameters)
- Enable global validation pipe (`ValidationPipe`) with `whitelist: true` and `transform: true`.

### C. Authentication & Authorization

- Use `@nestjs/jwt` and `@nestjs/passport` with a JWT Passport Strategy.
- Custom decorators (e.g., `@CurrentUser()`, `@ProjectRole()`).
- Guards for project-level permissions (e.g., `ProjectMemberGuard`, `ProjectOwnerGuard`).

### D. Error Handling

- Use NestJS built-in HTTP exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`).
- Consistent error response structure (status code, message, error details).
- Prevent unhandled exceptions from leaking sensitive stack traces.

### E. API Design

Follow predictable REST conventions:

```http
# Authentication
POST   /api/auth/register
POST   /api/auth/login

# Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

# Project Members
GET    /api/projects/:id/members
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId

# Tasks
GET    /api/projects/:id/tasks          # With ?search=&status=&priority=&assigneeId=&sortBy=&order=&page=&limit=
POST   /api/projects/:id/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

# Dashboard / Analytics
GET    /api/dashboard/stats
```

### F. Separation of Business Logic

- Controllers never query the database directly.
- Multi-step business processes (e.g., verifying if an assignee is an active project member before attaching them to a task) must reside in service methods.

### G. Database Relationships & Design

- Efficient relational queries without N+1 problems.
- Appropriate foreign keys, unique constraints, and indexes.

---

## 11. Database Design

Use **PostgreSQL** with either **Prisma**.

### Entity Relationship Model

```text
User
 │
 ├── (1:N) owns ───────────────► Project
 │                                  │
 ├── (1:N) has memberships ──► ProjectMember
 │                                  │ (belongs to)
 │                                  ▼
 │                               Task
 │                                  │
 └── (1:N) assigned to ◄────────────┘
```

### Schema Considerations

- **Primary Keys:** UUIDs (`gen_random_uuid()` or `cuid`) or auto-incrementing BigInt.
- **Foreign Keys:** Explicit relationships between `users`, `projects`, `project_members`, and `tasks`.
- **Unique Constraints:** Composite unique index on `(project_id, user_id)` in `project_members`.
- **Indexes:** Indexes on frequently queried and filtered fields (`project_id`, `status`, `priority`, `assignee_id`, `created_at`).
- **Cascading Behavior:** Define clear cascade rules (e.g. deleting a project cascades to its tasks and memberships).
- **Migrations:** All schema evolution must be documented in migration files.

---

## 12. Frontend Requirements

The frontend must be built with **Next.js** using TypeScript.

### Application Structure

- Organized folder hierarchy (e.g., `components/`, `lib/`, `hooks/`, `services/` or feature-based folders).
- Clear separation between UI components and API client calls.

### API Integration & Data Fetching

- Centralized API client (e.g., `axios` or native `fetch` wrapper) handling `Authorization: Bearer <token>` headers and base URLs.
- Graceful response handling and token expiration management.

### State Handling

- Clean state strategy for authentication tokens, active project, and task lists.
- URL-driven state for task filters, search, and pagination (enabling bookmarking and shareable links).

### Forms & Validation

- Form validation with clear inline error feedback.
- Submit buttons showing loading spinners and disabled states during requests.

### UI States

Every view must handle the four essential UI states:

1. **Loading State:** Skeleton loaders or subtle spinners.
2. **Error State:** Friendly error alerts with retry options.
3. **Empty State:** Informative empty screens (e.g., "No tasks in this project yet. Create your first task!").
4. **Success State:** Dynamic updates and user feedback notifications.

---

## 13. Basic Testing

Write focused, meaningful tests for core workflows. Full 100% coverage is not required; demonstration of testing proficiency is.

### Recommended Test Areas

- **Unit / Service Tests:**
  - Password hashing and JWT issuance logic.
  - Authorization verification (e.g., rejecting non-member access).
  - Task assignment validation (rejecting assignments to non-members).
- **Integration / E2E Tests:**
  - Auth flow (registration -> login -> access protected endpoint).
  - Project and task CRUD flow.

---

## 14. API Documentation

Provide clear API documentation using **either**:

- **Swagger / OpenAPI:** Integrated into NestJS via `@nestjs/swagger` accessible at `/api/docs`.
- **Postman Collection:** Exported JSON collection with environment variables and sample requests included in the repository.

Documentation must include:

- Endpoints and HTTP methods
- Request headers (Bearer token)
- Request body schemas and validation rules
- Query parameter descriptions
- Sample success and error responses

---

## 15. Seed Data & Test Accounts

Provide an automated seed script (`pnpm run seed` or `npm run seed`) so the reviewer can run the app immediately with realistic data.

### Seed Scenario

```text
Users:
 ├── Owner User     (e.g., owner@example.com / Password123!)
 ├── Member User 1  (e.g., member1@example.com / Password123!)
 └── Member User 2  (e.g., member2@example.com / Password123!)

Projects:
 ├── Project Alpha (Owned by Owner; Members: Member 1, Member 2)
 └── Project Beta  (Owned by Member 1; Members: Member 2)

Tasks (in Project Alpha):
 ├── Task 1: [Todo]        - Priority: Low    - Unassigned
 ├── Task 2: [In Progress] - Priority: High   - Assigned to Member 1
 └── Task 3: [Done]        - Priority: Medium - Assigned to Member 2
```

> [!TIP]
> Include the sample credentials clearly in your repository `README.md`.

---

## 16. Submission Requirements

Your final submission must include:

1. **Git Repository:**
   - Clean, meaningful commit history reflecting incremental development.
2. **README.md:**
   - Project overview and architectural summary.
   - Technologies and libraries used with rationale.
   - Local setup guide (Node version, package manager, environment variables).
   - Database setup, migration commands, and seed execution.
   - How to run frontend, backend, and test suites.
   - Test account credentials.
   - Documented trade-offs, assumptions, and known limitations.
3. **Database Migrations:**
   - Valid Prisma migration files committed in git.
4. **Seed Script:**
   - Functional database seeding script.
5. **API Documentation:**
   - Swagger endpoint `/api/docs` or a committed Postman collection file.

---

## 17. Time Limit

- **Timeline:** You have **5 working days** from receiving this document to submit your repository.
- **Objective:** The goal is not to rush as many features as possible. We want to see how you break down requirements, design clean architecture, enforce security, and write maintainable code.

---

## 18. Incomplete Features & Trade-offs

If you encounter time constraints, **it is completely acceptable to leave non-essential features incomplete**, provided you document your decisions.

### Example in README

```markdown
### Implementation Status

- Completed:
  - User authentication with JWT & bcrypt
  - Project management & member invitation
  - Backend authorization guards (Owner vs Member)
  - Task CRUD with database-level search, filter, and pagination
- Partially Completed:
  - Dashboard stats (aggregated counts implemented, charts omitted)
- Omitted due to time:
  - Drag-and-drop Kanban task board
```

Clear technical prioritization and transparent communication are valued as much as finished code.

---

## 19. Evaluation Criteria & Review Focus

Submissions will be assessed across five core criteria:

| Focus Area                            | What We Look For                                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Application Architecture**       | Clean NestJS module/service/controller separation; structured Next.js components; separation of concerns; no business logic in controllers.          |
| **2. Database & Data Modeling**       | Sound relational schema, proper normalization, foreign keys, composite constraints, migration consistency, efficient query patterns.                 |
| **3. Authorization & Security**       | Robust backend authorization guards; verification of project membership before accessing tasks/members; secure password handling and JWT validation. |
| **4. Code Quality & TypeScript**      | Strict TypeScript usage, meaningful naming, clear DTOs and interfaces, predictable error handling, DRY principles without over-engineering.          |
| **5. Practical Problem Solving & UX** | Realistic handling of loading, error, and empty states; sensible pagination/filtering; solid documentation; clear technical reasoning.               |
