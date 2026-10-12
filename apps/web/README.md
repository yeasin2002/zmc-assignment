# Frontend Web Application (Next.js 16 + React 19 + TypeScript)

Web client for the **Project & Task Management System**, built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Base UI, and TanStack React Query.

---

## 🛠️ Tech Stack & Highlights

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering)
- **Runtime & UI Library:** React 19, [Base UI](https://base-ui.com/), [Shadcn UI](https://ui.shadcn.com/) patterns
- **Data Fetching & Cache:** [TanStack Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/)
- **Icons:** [Tabler Icons](https://tabler.io/icons) (`@tabler/icons-react`)
- **Forms & Validation:** `react-hook-form` + `zod`
- **Feedback & Notifications:** [Sonner](https://sonner.emilkowal.ski/) toast alerts
- **Theme & Design:** Solid Black and Pure White design (`#ffffff` canvas, `#000000` text & accents, crisp `rounded-lg`/`rounded-md` borders, Google Fonts: Plus Jakarta Sans, Geist, Geist Mono)

---

## 🏗️ Folder Structure

```text
apps/web/
├── api/
│   ├── query-list/            # Layer 1: Pure Axios endpoints & TypeScript interfaces
│   │   ├── auth.query.ts
│   │   ├── projects.query.ts
│   │   ├── tasks.query.ts
│   │   └── dashboard.query.ts
│   └── api-hooks/             # Layer 2: TanStack React Query hooks with cache keys & invalidation
│       ├── auth.api-hook.ts
│       ├── projects.api-hook.ts
│       ├── tasks.api-hook.ts
│       └── dashboard.api-hook.ts
├── app/
│   ├── (auth)/                # Public authentication routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/           # Protected workspace routes
│   │   ├── dashboard/page.tsx # Productivity stats & metric cards
│   │   └── projects/
│   │       ├── page.tsx       # Projects listing & creation modal
│   │       └── [id]/          # Project detail tabs (Tasks, Members, Settings)
│   ├── layout.tsx             # Root layout with QueryProvider, AuthProvider & Toaster
│   └── page.tsx               # Root redirect to /login
├── components/
│   ├── layout/                # Global Header, Navigation drawer & RouteGuard
│   └── ui/                    # Base UI dialogs, dropdowns, buttons, inputs, skeletons
├── context/
│   └── auth-context.tsx       # Authentication state & session synchronization
└── lib/
    ├── axios.ts               # Axios instance with Bearer interceptor & 401 event handler
    └── utils.ts               # Tailwind merge & utility helpers
```

---

## 🔄 Two-Layer API Architecture

The frontend follows a strict separation between API definitions and UI hooks:

### Layer 1: Query List (`api/query-list/`)
- Contains pure Axios HTTP calls and TypeScript DTO/Response types.
- **Zero React dependencies, zero hooks.**
- Uses `URLSearchParams` for safe query parameter construction.
- Example: `projectsApi.getAll()`, `tasksApi.getAll(projectId, query)`.

### Layer 2: API Hooks (`api/api-hooks/`)
- Wraps Layer 1 functions with `@tanstack/react-query` (`useQuery` / `useMutation`).
- Defines query key factories at the top (`PROJECT_KEYS`, `TASK_KEYS`, `DASHBOARD_KEYS`).
- Automatically invalidates related cache keys upon successful mutations.
- Dispatches Sonner toast feedback notifications on mutation success and error.

---

## 🔐 Authentication & Session Lifecycle

1. **Token Persistence:** Stored securely in `localStorage` under `auth_token`.
2. **Request Injection:** [lib/axios.ts](lib/axios.ts) attaches `Authorization: Bearer <token>` to all outgoing requests.
3. **Automated 401 Interception:** When any endpoint returns `401 Unauthorized`, the interceptor clears the token and triggers a reactive synchronization event that causes `RouteGuardWatcher` in [context/auth-context.tsx](context/auth-context.tsx) to redirect cleanly to `/login?redirect=...`.
4. **Route Protection:** Public auth pages (`/login`, `/register`) redirect authenticated users to `/projects`; private pages (`/projects`, `/dashboard`) redirect unauthenticated users to `/login`.

---

## 🔍 URL-Synchronized State

Task listings in [project-tasks-tab.tsx](app/(dashboard)/projects/[id]/components/project-tasks-tab.tsx) synchronize query state directly with URL parameters:
- `search`: Debounced keyword query.
- `status`: Filter by `TODO`, `IN_PROGRESS`, `DONE`.
- `priority`: Filter by `LOW`, `MEDIUM`, `HIGH`.
- `assigneeId`: Filter by assigned team member UUID.
- `sortBy` & `order`: Sorting criteria (`dueDate`, `createdAt`, `asc`, `desc`).
- `page`: Active page number for database-level pagination.

This ensures every filtered view is **bookmarkable and shareable**.

---

## 🎨 UI/UX Design System & Principles

1. **Solid Black & Pure White Design:** High-contrast pure white background (`#ffffff`), solid black typography (`#000000`), crisp `rounded-lg` cards and `rounded-md` controls, with Plus Jakarta Sans and Geist typography.
2. **Tabler Icons:** Standardized icon set (`@tabler/icons-react`) used exclusively across all components.
3. **Four Essential UI States:**
   - **Loading State:** Contextual skeleton placeholders during query fetching.
   - **Error State:** Descriptive error banners with retry triggers.
   - **Empty State:** Informative empty cards with contextual call-to-action buttons.
   - **Success State:** Dynamic cache updates and Sonner toast confirmations.
4. **Form Validation:** Explicit validation using React Hook Form and Zod schemas, with field character limits (`maxLength={255}` titles, `maxLength={2000}` descriptions) and clean inline validation cues.

---

## 🚀 Getting Started

### 1. Environment Configuration
Create `.env.local` inside `apps/web/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 2. Run Development Server
```bash
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Production Build & Lint
```bash
# Type check and build with Turbopack
pnpm run build

# Run ESLint
pnpm run lint
```
