# 📂 PROJECT CONTEXT: agentBot

> **SYSTEM INSTRUCTION FOR AI:**
> This file is the Single Source of Truth (SSOT) for this project.
> Before generating code, proposing changes, or answering questions, you MUST review the "Current Focus", "Constraints", and "App Map" sections.
> If a user prompt contradicts this file, prioritize this file unless explicitly told to ignore it.

---

## 0. 🤖 AI Instructions (G.R.I.A.L. Protocol)

### Prime Directive

Before answering ANY query, generating code, or analyzing logic, you MUST:

1.  **Read this file** (`CONTEXT.MD`) in the project root immediately.
2.  **Internalize the SSOT:** adopt the Tech Stack, Constraints, and Active Task defined here.
3.  **Resolve Conflicts:** If the user's prompt contradicts this file, prioritize this file or ask for confirmation.

### Vibe & Behavior

- **Concise:** Do not explain basic concepts. Just give the solution.
- **Strict Compliance:** Adhere strictly to the Coding Guidelines in Section 2.
- **Language:** Use **English** for code (variables, functions, types, comments, JSDoc). UI strings shown to users stay in **Spanish** (default locale).
- **Scope (YAGNI):** Implement only what is requested. If you see an important improvement, propose it first — do NOT implement without confirmation.
- **Tests:** Write tests only when explicitly requested.
- **Clarification:** If the request is ambiguous, ask before implementing. Do not assume.
- **Documentation:** When flow or architecture changes, update `CONTEXT.MD`, `README`, and relevant docs accordingly.
- **Security:** Always prioritize secure code. Consider auth, validation, input sanitization, and attack prevention in every module. Security-first mindset.
- **Maintenance:** When a task/feature is completed, remind the user to update the checkboxes in this file.
- **Dependencies:** Do NOT introduce new libraries, packages, or tools without explicit permission. If one is needed, propose it with a justification first.
- **Refactoring:** Do not refactor code that is not related to the active task unless explicitly asked.
- **File Awareness:** Before creating a new file, verify it doesn't already exist. Before modifying a file, read its current content first.

### Reset Command

If the user says **"PHOENIX"** or **"RESET"**:

- Ignore all previous chat history.
- Re-read `CONTEXT.MD`.
- Confirm by stating the **Current Active Task** found in Section 5.

---

## 1. 🎯 Project Overview & Boundaries

### Core Vision

- **Elevator Pitch:** agentBot is a production-ready Next.js 16 boilerplate that gives developers a fully configured starting point with auth, payments, email, storage, i18n, and a clean architecture — so they can skip setup and start building features immediately.
- **Target Audience:** Solo developers, freelancers, and small teams who want to ship SaaS, e-commerce, or web apps fast with modern tooling.
- **Key Success Metrics (KPIs):**
  - Time from clone to first feature < 30 minutes.
  - Zero configuration errors on fresh clone (env validation catches everything).
  - Build passes with zero warnings out of the box.

### 🚧 Operational Constraints (Grounding)

_Rules that the business logic MUST follow strictly. These are non-negotiable._

- **Server Components First:** Default to React Server Components. Only use `"use client"` when hooks or interactivity are required.
- **DAL Pattern:** All database queries MUST go through `src/data/` (Data Access Layer). Never import `db` directly in UI components or page files.
- **Typed Responses:** All Server Actions MUST return `ActionResponse<T>` (discriminated union from `src/types/index.ts`).
- **Env Safety:** All environment variables MUST be validated via `src/lib/env.ts`. Never use `process.env` directly except in edge cases (webhooks, build-time skipping).
- **User Permissions/Roles:**
  - **user:** Default role. Can access protected routes (`/dashboard`, `/settings`).
  - **admin:** Can access admin routes (`/admin`). Role stored in Clerk `publicMetadata.role`.
- **Platform/Device:** Mobile-first responsive web app.

### 🚫 Negative Scope (What we are NOT building in the boilerplate)

- No specific business logic — this is a **generic starter**, not a product.
- No database migrations committed — each project generates its own.
- No E2E/unit testing framework pre-configured — add when the project requires it.

### 🏁 Boilerplate Readiness Criteria (Definition of Done)

- [x] Project builds with zero errors (`npm run build`).
- [x] Project lints with zero errors (`npm run lint`).
- [x] All SDK clients initialized (`stripe`, `resend`, `r2`, `db`, `sentry`).
- [x] Auth proxy functional (Clerk + next-intl).
- [x] Webhook routes scaffolded (Clerk + Stripe).
- [x] Example Server Action with full DAL pattern.
- [x] Example Zustand store, custom hook, Zod schema.
- [x] Email system with send function + template.
- [x] i18n configured with `es` (default) and `en`.
- [x] Environment variable validation with clear error messages.
- [x] Error monitoring (Sentry) fully configured with logger integration.
- [x] Code quality gates (Husky + lint-staged + pre-push build).
- [x] CI/CD pipeline (GitHub Actions) with typecheck, lint, build.
- [x] SEO scaffold (robots.ts, sitemap.ts, OG metadata, metadataBase).
- [x] PWA scaffold (manifest.ts).
- [x] React Compiler enabled.
- [x] `CONTEXT.MD` fully populated (no placeholders).

---

## 2. 🛠️ Tech Stack & Coding Guidelines

_Use only the tools listed below. Do not introduce new libraries without permission._

### Core Stack

| Category                 | Technology                    | Package(s)                                                                                   |
| ------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------- |
| **Framework**            | Next.js 16 (App Router)       | `next@16.1.6`                                                                                |
| **UI Library**           | React 19 + Compiler           | `react@19.2.3`, `react-dom@19.2.3`                                                           |
| **Styling**              | Tailwind CSS v4, Mobile-First | `tailwindcss@^4`, `@tailwindcss/postcss@^4`                                                  |
| **Component Library**    | Shadcn/UI + Radix UI          | `shadcn`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` |
| **Icons**                | Lucide React                  | `lucide-react`                                                                               |
| **Database**             | PostgreSQL via NeonDB         | `@neondatabase/serverless`                                                                   |
| **ORM**                  | Drizzle ORM                   | `drizzle-orm`, `drizzle-kit` (dev)                                                           |
| **Auth**                 | Clerk                         | `@clerk/nextjs`                                                                              |
| **Client State**         | Zustand                       | `zustand`                                                                                    |
| **Server State**         | SWR                           | `swr`                                                                                        |
| **Forms**                | React Hook Form + Zod         | `react-hook-form`, `@hookform/resolvers`, `zod`                                              |
| **Payments**             | Stripe                        | `stripe`, `@stripe/stripe-js`                                                                |
| **Email**                | Resend                        | `resend`                                                                                     |
| **Storage**              | Cloudflare R2 (S3-compatible) | `@aws-sdk/client-s3`                                                                         |
| **Image upload (R2)**    | FilePond (default)            | `react-filepond`, `filepond` — see Section 13 (Image upload pattern)                         |
| **i18n**                 | next-intl (Spanish default)   | `next-intl`                                                                                  |
| **Theming**              | next-themes                   | `next-themes`                                                                                |
| **Toasts**               | Sonner                        | `sonner`                                                                                     |
| **Webhook Verification** | Svix                          | `svix`                                                                                       |
| **Error Monitoring**     | Sentry                        | `@sentry/nextjs`                                                                             |
| **Server Guards**        | server-only                   | `server-only`                                                                                |
| **Formatting**           | Prettier + Tailwind plugin    | `prettier`, `prettier-plugin-tailwindcss` (dev)                                              |
| **Linting**              | ESLint + Prettier compat      | `eslint`, `eslint-config-next`, `eslint-config-prettier` (dev)                               |
| **Code Quality**         | Husky + lint-staged           | `husky`, `lint-staged` (dev)                                                                 |

### Coding Guidelines

1.  **Strict Typing:** TypeScript strict mode is mandatory. No `any`.
2.  **File Naming:** Use `kebab-case` for all file names.
3.  **Component Strategy:** Functional components only. Prefer Server Components by default; use `"use client"` only when necessary (hooks, interactivity).
4.  **Error Handling:** All Server Actions must return `ActionResponse<T>` (see `src/types/index.ts`). API routes use `withErrorHandler()` from `src/lib/api.ts`.
5.  **Database Abstraction (DAL):** Isolate ALL database queries into `src/data/`. **Never** import `db` directly in UI components. This ensures the DB layer can be swapped without touching the UI.
6.  **Imports:** Use absolute imports with `@/` prefix (configured in `tsconfig.json`).
7.  **Naming Conventions:**
    - Components: `PascalCase` (e.g., `ProductCard.tsx`)
    - Utilities/hooks: `camelCase` (e.g., `useProducts.ts`)
    - Constants: `UPPER_SNAKE_CASE`
    - DB schemas/types: `snake_case` (matching SQL conventions)
8.  **Logging:** Use `logger` from `@/lib/logger` instead of `console.log` in production code. `logger.error()` auto-forwards to Sentry when DSN is configured.
9.  **Auth in Actions:** Always use `requireAuth()` or `requireRole()` from `@/lib/auth` — never call Clerk APIs directly in actions.
10. **No native browser UI:** Do NOT use `window.alert`, `window.confirm`, `window.prompt`, or any native browser dialogs. Use only the defined UI stack: **Shadcn/UI** (e.g. `AlertDialog` for confirmations, `Dialog` for modals) and **Sonner** for toasts and ephemeral feedback. All user feedback must go through these components.
11. **Server-Only Guards:** Server-side library files (`src/lib/api.ts`, `src/lib/auth.ts`) MUST use `import "server-only"` to prevent accidental client-side imports.
12. **React Compiler:** The project uses the React Compiler (`reactCompiler: true`). Manual `useMemo`, `useCallback`, and `React.memo` are generally unnecessary.
13. **Component Size Limits:** Files SHOULD stay under **300 lines**. If approaching 200+ lines, evaluate splitting into sub-components or hooks.
14. **JSDoc Headers:** Every `.ts` / `.tsx` file SHOULD have a `@fileoverview` JSDoc block explaining: (a) what the file does, (b) where it fits, (c) key dependencies.

---

## 3. 🗺️ App Architecture & Route Inventory

### 📂 Directory Structure

```
src/
├── actions/          # Server Actions (use DAL + auth + typed responses)
│   └── example.ts    # Reference implementation of the full pattern
├── app/              # App Router pages & layouts
│   ├── [locale]/     # i18n locale wrapper
│   │   ├── layout.tsx    # Root layout: ClerkProvider + NextIntlClientProvider + Toaster + SEO metadata
│   │   └── page.tsx      # Homepage (translated card)
│   ├── api/
│   │   └── webhooks/
│   │       ├── clerk/route.ts   # Clerk webhook (svix verified)
│   │       └── stripe/route.ts  # Stripe webhook (signature verified)
│   ├── global-error.tsx  # Error boundary (Sentry + user-friendly UI)
│   ├── not-found.tsx     # 404 page (premium UI)
│   ├── robots.ts         # SEO crawl rules
│   ├── sitemap.ts        # Dynamic SEO sitemap
│   ├── manifest.ts       # PWA manifest
│   ├── favicon.ico
│   └── globals.css
├── components/
│   └── ui/           # Shadcn/UI primitives (Button, Card, Input, Label, Sonner)
├── data/             # Data Access Layer — pure DB queries, no auth/validation
│   ├── index.ts      # Barrel export
│   └── users.ts      # CRUD: findById, findByClerkId, findByEmail, create, update, delete
├── hooks/
│   └── use-action.ts # useAction<TInput, TOutput> — loading/error state for Server Actions
├── i18n/             # Internationalization config
│   ├── config.ts     # Locales: ["es", "en"], default: "es"
│   ├── navigation.ts # Typed navigation helpers
│   ├── request.ts    # Server-side locale resolution
│   └── routing.ts    # next-intl routing definition
├── lib/              # Config, utils, SDK clients
│   ├── api.ts        # successResponse, errorResponse, withErrorHandler (server-only)
│   ├── auth.ts       # getCurrentUser, requireAuth, requireRole (server-only)
│   ├── constants.ts  # APP_CONFIG, PAGINATION, UPLOAD, CACHE, ROLES
│   ├── env.ts        # Zod-validated serverEnv + clientEnv (fail-fast)
│   ├── errors.ts     # AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, RateLimitError
│   ├── error-messages.ts # Friendly UX error messages (pattern-based matching)
│   ├── fetcher.ts    # SWR fetcher<T> + FetchError
│   ├── logger.ts     # Structured logger with Sentry auto-forwarding
│   ├── r2.ts         # Cloudflare R2 S3Client
│   ├── rate-limit.ts # In-memory rate limiter (MVP, upgrade to Redis for prod)
│   ├── resend.ts     # Resend email client
│   ├── stripe.ts     # Stripe server client
│   ├── utils.ts      # cn() — Tailwind class merger
│   ├── db/
│   │   ├── index.ts  # Drizzle + NeonDB connection
│   │   ├── schema.ts # Example users table
│   │   └── seed.ts   # Database seed script
│   └── email/
│       ├── index.ts      # Barrel export
│       ├── send.ts       # sendEmail() — centralized dispatch via Resend
│       └── templates/
│           └── welcome.ts # Welcome email HTML template
├── messages/         # Translation JSON files
│   ├── es.json       # Spanish translations (default)
│   └── en.json       # English translations
├── instrumentation.ts    # Sentry server + edge init (Next.js instrumentation hook)
├── sentry.server.config.ts # Sentry server runtime config
├── sentry.edge.config.ts   # Sentry edge runtime config
├── proxy.ts          # Clerk auth + next-intl locale proxy (Next.js 16)
├── schemas/
│   └── auth.ts       # Zod schemas: loginSchema, contactSchema
├── store/
│   └── app-store.ts  # Zustand store (sidebar state example)
└── types/
    └── index.ts      # ActionResponse<T>, PaginatedResponse<T>, ListParams

# Project root (additional files)
instrumentation-client.ts  # Sentry client-side init (session replay)
.editorconfig              # Editor formatting consistency
.prettierignore            # Prettier exclusions
.husky/
├── pre-commit             # lint-staged + typecheck
└── pre-push               # build verification
.github/
├── workflows/ci.yml       # CI pipeline (typecheck + lint + build)
├── dependabot.yml         # Auto dependency updates
└── PULL_REQUEST_TEMPLATE.md
CONTRIBUTING.md            # Developer guide
CHANGELOG.md               # Version history
docs/
└── DEPLOY.md              # Deployment guide
```

### 📍 Route Inventory (Sitemap)

**Public Routes:**

| Route              | Description                         |
| ------------------ | ----------------------------------- |
| `/:locale`         | Homepage — translated card with CTA |
| `/:locale/login`   | Auth screen (Clerk-managed)         |
| `/:locale/sign-up` | Sign-up screen (Clerk-managed)      |

**Protected Routes (requires auth):**

| Route                | Description                           |
| -------------------- | ------------------------------------- |
| `/:locale/dashboard` | User dashboard (scaffold when needed) |
| `/:locale/settings`  | User settings (scaffold when needed)  |

**Admin Routes (requires auth + admin role):**

| Route            | Description                        |
| ---------------- | ---------------------------------- |
| `/:locale/admin` | Admin panel (scaffold when needed) |

**API Routes:**

| Route                  | Method | Description                                                                                                  |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `/api/webhooks/clerk`  | POST   | Clerk user events (user.created, user.updated, user.deleted)                                                 |
| `/api/webhooks/stripe` | POST   | Stripe payment events (checkout.session.completed, invoice.payment_succeeded, customer.subscription.deleted) |

---

## 4. 🗄️ Domain Model (High-Level Schema)

_Core entities and relationships. See `src/lib/db/schema.ts` for full definitions._

### Entities (Example — replace with your own)

- **users:** `id` (uuid, PK), `clerk_id` (text, unique), `email` (text, unique), `name` (text?), `created_at`, `updated_at`

### Key Relationships

```
(No relationships yet — this is a single-table example.
Add your entities and relationships here as you build.)
```

### Database Notes

- **ORM:** Drizzle ORM with NeonDB serverless driver.
- **Config:** `drizzle.config.ts` at project root.
- **Migrations output:** `./drizzle/` directory.
- **Schema location:** `src/lib/db/schema.ts`.

---

## 5. 📍 Current Project Status

_Update this section at the start of every coding session._

- **Phase:** Boilerplate Ready ✅
- **Current Sprint Focus:** No active sprint — boilerplate is complete. Start your project here.
- **Active Task:** None — update this field when beginning a new feature.
- **Blockers:** None.

### Recent Completions (Boilerplate Setup)

- ✅ Full dependency installation (16+ packages)
- ✅ All SDK clients configured (Stripe, Resend, R2, NeonDB/Drizzle)
- ✅ Architecture modules: env validation, auth helpers, error hierarchy, logger, API wrappers, SWR fetcher
- ✅ DAL pattern with example (src/data/users.ts + src/actions/example.ts)
- ✅ Webhook routes scaffolded (Clerk + Stripe with signature verification)
- ✅ i18n configured (es/en) with Clerk + next-intl proxy
- ✅ Email system (sendEmail + welcome template)
- ✅ `CONTEXT.MD` fully populated

---

## 6. 📝 Roadmap & Detailed Scope

### 🟢 Phase 1: Boilerplate Foundation (status: ✅ Completed)

- [x] Next.js 16 + React 19 initialized
- [x] Tailwind CSS v4 + Shadcn/UI + Lucide Icons configured
- [x] NeonDB + Drizzle ORM configured with example schema
- [x] Clerk auth with proxy and auth helpers
- [x] Stripe client + webhook route
- [x] Resend client + email send function + template
- [x] Cloudflare R2 client configured
- [x] next-intl with es/en locales
- [x] Zustand store + SWR fetcher + useAction hook
- [x] React Hook Form + Zod schemas
- [x] Environment variable validation (Zod)
- [x] Structured logger
- [x] Error class hierarchy
- [x] API route helpers (withErrorHandler)
- [x] DAL pattern with example CRUD
- [x] Typed ActionResponse + PaginatedResponse
- [x] Database seed script
- [x] Prettier + ESLint configured
- [x] CONTEXT.MD as SSOT

### 🟡 Phase 2: [Your First Feature] (status: ⬜ Planned)

_Update this when you start building your product._

- [ ] Define your domain entities in `src/lib/db/schema.ts`
- [ ] Run `npm run db:push` to sync schema to NeonDB
- [ ] Create DAL functions in `src/data/`
- [ ] Build Server Actions in `src/actions/`
- [ ] Build UI pages and components

### ⬜ Phase 3: [Your Second Feature] (status: ⬜ Planned)

- [ ] (Define when ready)

---

## 7. 🧊 Icebox / Backlog

_Features planned for later versions. Do NOT implement unless explicitly moved to an active Phase._

- [ ] Dark mode (ThemeProvider with next-themes — package already installed)
- [ ] Add `CLERK_WEBHOOK_SECRET` to `src/lib/env.ts` Zod validation
- [ ] Add `NEXT_PUBLIC_APP_URL` to `src/lib/env.ts` Zod validation
- [ ] React Email integration for richer email templates
- [ ] Upgrade rate limiting to Redis (Upstash) for multi-instance production
- [ ] Analytics (PostHog / Vercel Analytics)
- [ ] E2E testing (Playwright)
- [ ] Unit testing (Vitest)
- [ ] OG Image generation (dynamic `opengraph-image.tsx`)
- [ ] LLMs.txt for AI discoverability (`/llms.txt`, `/llms-full.txt`)

---

## 8. 🔀 App Flow (Mermaid Diagram)

_Visual representation of the main user journey. AI: Use this to understand navigation and redirect logic._

```mermaid
flowchart TD
    Root["/:locale"]
    Root -->|logged in| Dashboard["/:locale/dashboard"]
    Root -->|no session| Login["/:locale/login"]

    Login -->|OK| Root
    SignUp["/:locale/sign-up"] -->|OK| Root

    Dashboard --> Settings["/:locale/settings"]

    subgraph PublicArea [Public Routes]
        Root
        Login
        SignUp
    end

    subgraph ProtectedArea [Requires Auth — Clerk Middleware]
        Dashboard
        Settings
    end

    subgraph AdminArea [Requires Auth + Admin Role]
        Admin["/:locale/admin"]
    end

    subgraph Webhooks [API Webhooks — No Auth Required]
        ClerkWH["/api/webhooks/clerk"]
        StripeWH["/api/webhooks/stripe"]
    end
```

_Update this diagram whenever routes or navigation logic change._

---

## 9. ⚙️ Environment & Secrets

_List of required environment variables. AI: NEVER hardcode secrets. NEVER commit `.env` files._

### Server-Side Variables (validated in `src/lib/env.ts`)

| Variable                | Description                         | Example                                          |
| ----------------------- | ----------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`          | NeonDB PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `CLERK_SECRET_KEY`      | Clerk private API key               | `sk_test_...`                                    |
| `R2_ACCOUNT_ID`         | Cloudflare account ID               | `xxxxxxxxxxxxxxxx`                               |
| `R2_ACCESS_KEY_ID`      | R2 access key                       | `xxxxxxxxxxxxxxxx`                               |
| `R2_SECRET_ACCESS_KEY`  | R2 secret key                       | `xxxxxxxxxxxxxxxxxxxx`                           |
| `R2_BUCKET_NAME`        | R2 bucket name                      | `your-bucket-name`                               |
| `STRIPE_SECRET_KEY`     | Stripe private API key              | `sk_test_...`                                    |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret       | `whsec_...`                                      |
| `RESEND_API_KEY`        | Resend API key                      | `re_...`                                         |
| `RESEND_FROM_EMAIL`     | Default sender email                | `onboarding@resend.dev`                          |

### Client-Side Variables (validated in `src/lib/env.ts`)

| Variable                                       | Description           | Example                  |
| ---------------------------------------------- | --------------------- | ------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`            | Clerk public key      | `pk_test_...`            |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                | Sign-in route         | `/login`                 |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                | Sign-up route         | `/sign-up`               |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Post sign-in redirect | `/`                      |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Post sign-up redirect | `/`                      |
| `NEXT_PUBLIC_R2_PUBLIC_URL`                    | R2 public bucket URL  | `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`           | Stripe public key     | `pk_test_...`            |

### Not Yet Validated (used via `process.env` directly)

| Variable                 | Description                                      | Used In                                                                    |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (safe to expose publicly)             | `instrumentation-client.ts`, `src/instrumentation.ts`, `src/lib/logger.ts` |
| `SENTRY_ORG`             | Sentry organization slug                         | `next.config.ts` (source map upload)                                       |
| `SENTRY_PROJECT`         | Sentry project slug                              | `next.config.ts` (source map upload)                                       |
| `SENTRY_AUTH_TOKEN`      | Sentry auth token for source map uploads         | `next.config.ts` (CI/CD only)                                              |
| `CLERK_WEBHOOK_SECRET`   | Clerk webhook signing secret                     | `src/app/api/webhooks/clerk/route.ts`                                      |
| `NEXT_PUBLIC_APP_URL`    | App base URL (fallback: `http://localhost:3000`) | `src/lib/constants.ts`, email templates                                    |
| `SKIP_ENV_VALIDATION`    | Skip env validation during build                 | `src/lib/env.ts`                                                           |

**Notes:**

- File: `.env.local` (local dev), `.env.production` (production — managed in hosting provider).
- Template: `.env.example` is committed to the repo with placeholder values.
- Validation: `src/lib/env.ts` validates at import-time and fails fast with clear error messages.

---

## 10. 🧰 Key Commands

_Common commands for development. AI: Use these instead of guessing._

| Command                             | Description                                       |
| ----------------------------------- | ------------------------------------------------- |
| `npm run dev`                       | Start dev server (Next.js)                        |
| `npm run build`                     | Production build (for validation)                 |
| `npm run start`                     | Start production server                           |
| `npm run lint`                      | Run ESLint                                        |
| `npm run lint:fix`                  | Run ESLint with auto-fix                          |
| `npm run format`                    | Format all files with Prettier                    |
| `npm run format:check`              | Check formatting without writing                  |
| `npm run typecheck`                 | TypeScript strict check (`tsc --noEmit`)          |
| `npm run validate`                  | Full CI check (typecheck + lint + format + build) |
| `npm run clean`                     | Delete `.next` cache (fixes stale type errors)    |
| `npm run db:push`                   | Push Drizzle schema changes to NeonDB             |
| `npm run db:generate`               | Generate Drizzle migrations                       |
| `npm run db:migrate`                | Run Drizzle migrations                            |
| `npm run db:studio`                 | Open Drizzle Studio (visual DB browser)           |
| `npm run db:seed`                   | Seed database (`npx tsx src/lib/db/seed.ts`)      |
| `npx shadcn@latest add [component]` | Add a Shadcn/UI component                         |

---

## 11. 🔌 Third-Party Integrations

_External services and their configuration. AI: Check this before integrating with any service._

### Clerk (Authentication)

- **Purpose:** User authentication, session management, user metadata.
- **SDK/Package:** `@clerk/nextjs`
- **Dashboard:** [https://dashboard.clerk.com](https://dashboard.clerk.com)
- **Webhook URL:** `/api/webhooks/clerk`
- **Webhook Verification:** `svix` package
- **Key files:**
  - `src/lib/auth.ts` — `getCurrentUser()`, `requireAuth()`, `requireRole()`
  - `src/proxy.ts` — Auth + locale proxy (Next.js 16)
  - `src/app/api/webhooks/clerk/route.ts` — Webhook handler
- **Key env vars:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`

### Stripe (Payments)

- **Purpose:** Payment processing, subscriptions, checkout.
- **SDK/Package:** `stripe` (server), `@stripe/stripe-js` (client)
- **Dashboard:** [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Webhook URL:** `/api/webhooks/stripe`
- **Local dev:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **Key files:**
  - `src/lib/stripe.ts` — Server client initialization
  - `src/app/api/webhooks/stripe/route.ts` — Webhook handler
- **Key env vars:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Resend (Email)

- **Purpose:** Transactional email delivery.
- **SDK/Package:** `resend`
- **Dashboard:** [https://resend.com/overview](https://resend.com/overview)
- **Key files:**
  - `src/lib/resend.ts` — Client initialization
  - `src/lib/email/send.ts` — `sendEmail()` function
  - `src/lib/email/templates/welcome.ts` — Welcome email template
- **Key env vars:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

### Cloudflare R2 (Object Storage)

- **Purpose:** File/image storage (S3-compatible).
- **SDK/Package:** `@aws-sdk/client-s3`
- **Dashboard:** [https://dash.cloudflare.com](https://dash.cloudflare.com) → R2
- **Key files:**
  - `src/lib/r2.ts` — S3Client configured for R2 endpoint
- **Key env vars:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`
- **Image upload UI:** Use **FilePond** (`react-filepond` + `filepond`) as the default library for image uploads to R2. Alternative: **Uppy** (`@uppy/react`) if you need multi-source pickers (e.g. Google Drive, URL) or a dashboard-style UI. Do not build custom upload UX from scratch; use one of these and wire it to a Server Action or API route that calls the R2 client. Upload limits and allowed types are in `src/lib/constants.ts` (`UPLOAD`).

### NeonDB (Database)

- **Purpose:** Serverless PostgreSQL database.
- **SDK/Package:** `@neondatabase/serverless`, `drizzle-orm`
- **Dashboard:** [https://console.neon.tech](https://console.neon.tech)
- **Key files:**
  - `src/lib/db/index.ts` — Drizzle + Neon connection
  - `src/lib/db/schema.ts` — Table definitions
  - `src/lib/db/seed.ts` — Seed script
  - `drizzle.config.ts` — Drizzle Kit configuration
- **Key env vars:** `DATABASE_URL`

### Sentry (Error Monitoring)

- **Purpose:** Error tracking, performance monitoring, and session replay in production.
- **SDK/Package:** `@sentry/nextjs`
- **Dashboard:** [https://sentry.io](https://sentry.io)
- **Key files:**
  - `instrumentation-client.ts` — Client-side Sentry init (session replay, error tracking)
  - `src/instrumentation.ts` — Server-side + Edge Sentry init (Next.js instrumentation hook)
  - `src/sentry.server.config.ts` — Server runtime Sentry config
  - `src/sentry.edge.config.ts` — Edge runtime Sentry config
  - `next.config.ts` — Wrapped with `withSentryConfig` for source map uploads
  - `src/app/global-error.tsx` — Global error boundary with `Sentry.captureException`
  - `src/lib/logger.ts` — `logger.error()` automatically forwards to Sentry
- **Key env vars:** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- **Setup:** Create a project in Sentry, set the DSN in `.env.local`, and errors are automatically captured.

---

## 12. 🚀 Deployment

_Hosting, CI/CD, and branch strategy._

- **Hosting:** Vercel (recommended for Next.js)
- **Production URL:** (Configure after first deploy)
- **Staging URL:** (Configure if needed)
- **Branch Strategy:**
  - `main` → Production (auto-deploy).
  - `develop` → Staging (if applicable).
  - Feature branches → Preview deployments.
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) runs typecheck + lint + format + build on every push/PR. Vercel auto-deploys on merge.
- **Dependency Updates:** Dependabot (`.github/dependabot.yml`) creates weekly PRs for npm and GitHub Actions updates.
- **Domain/DNS:** Configure in Vercel dashboard.
- **Build env:** Set `SKIP_ENV_VALIDATION=true` if env vars are not available during build.

---

## 13. 🐛 Known Gotchas & Patterns

_Document recurring issues, non-obvious patterns, and solutions that the AI should know about. This prevents re-discovering the same problems across sessions._

### Gotchas

| Issue                                         | Solution                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hydration mismatch with dates                 | Use `suppressHydrationWarning` on elements with dates, or format only on the client.                                                                                 |
| Next.js Image requires explicit domains       | Add domains to `next.config.ts` → `images.remotePatterns`. Currently configured: `img.clerk.com`.                                                                    |
| Env vars not available during `npm run build` | Set `SKIP_ENV_VALIDATION=true` in your build environment.                                                                                                            |
| Stripe webhook needs raw body                 | The Stripe webhook route uses `req.text()` (not `req.json()`) to get the raw body for signature verification.                                                        |
| Clerk webhook needs svix headers              | The Clerk webhook route verifies `svix-id`, `svix-timestamp`, `svix-signature` headers.                                                                              |
| next-intl requires `params` to be awaited     | In Next.js 16, `params` is a `Promise`. Always `await params` in layouts/pages.                                                                                      |
| Drizzle env vars at config level              | `drizzle.config.ts` uses `process.env.DATABASE_URL!` directly (not `serverEnv`) because it runs outside Next.js.                                                     |
| Neon HTTP no transactions                     | The `@neondatabase/serverless` HTTP driver does NOT support `db.transaction()`. Execute multi-table writes sequentially.                                             |
| Typecheck fails for deleted routes            | If `.next/types/validator.ts` references deleted files, run `npm run clean` then `npm run typecheck`.                                                                |
| Zod date coercion for DB                      | When accepting dates from forms, use `z.coerce.date()` in Zod schemas. Raw strings sent to Drizzle timestamp fields fail with `value.toISOString is not a function`. |
| Sentry optional                               | If `NEXT_PUBLIC_SENTRY_DSN` is not set, the logger and instrumentation gracefully degrade to console-only — no errors.                                               |

### Patterns & Conventions

- **Server Action Pattern:** All actions follow: `requireAuth()` → validate input → call DAL function → log → return `ActionResponse<T>`. See `src/actions/example.ts` as the reference implementation.
- **DAL Pattern:** All direct DB access is in `src/data/*.ts`. Functions are pure query functions (no auth, no validation, no logging). Import via `@/data`.
- **API Route Pattern:** API routes use `withErrorHandler()` from `src/lib/api.ts` for automatic error catching and logging. Use `successResponse()` and `errorResponse()` for consistent JSON responses.
- **Client Hook Pattern:** Use `useAction(serverAction)` from `src/hooks/use-action.ts` to call Server Actions with automatic loading/error state management.
- **Email Pattern:** Use `sendEmail()` from `src/lib/email` with HTML template functions from `src/lib/email/templates/`.
- **Auth Guard Pattern:**
  - Pages/Layouts: Protected by Clerk proxy in `src/proxy.ts`.
  - Server Actions: Use `requireAuth()` or `requireRole()` from `@/lib/auth`.
  - Admin routes matched by `/:locale/admin(.*)` in proxy.
- **Zustand Pattern:** Store files in `src/store/`. Access via hook: `const { value } = useAppStore()`.
- **SWR Pattern:** Use `fetcher` from `@/lib/fetcher` as the default SWR fetcher: `useSWR<T>(url, fetcher)`.
- **Image upload pattern:** For uploading images to R2, use the FilePond component (or Uppy if preferred). Server side: create a Server Action or API route that accepts `FormData`, validates file type/size with `UPLOAD` from `@/lib/constants`, and uses `PutObjectCommand` from `@aws-sdk/client-s3` with the R2 client from `@/lib/r2`. Return the public URL using `NEXT_PUBLIC_R2_PUBLIC_URL` + object key. Do not use native `<input type="file">` without wrapping it in FilePond/Uppy for progress, preview, and validation.
- **Rate Limiting Pattern:** Use `checkRateLimit(identifier)` from `@/lib/rate-limit` in Server Actions or API routes that accept public input (RSVP, password verification, uploads). Combine with `getClientIdentifier(headers)` for IP-based limiting.
- **Friendly Error Pattern:** Use `getFriendlyErrorMessage(error)` from `@/lib/error-messages` to convert technical errors into user-facing messages. Use in toast notifications and error displays.
- **Lazy Loading Pattern:** Heavy client libraries should be loaded via `next/dynamic` with `ssr: false`. `optimizePackageImports` in `next.config.ts` handles tree-shaking for heavy packages.
- **SEO Pattern:** Root layout sets `metadataBase` for canonical URL resolution. Pages use `generateMetadata` with OG + Twitter Card fields. `robots.ts` controls crawl rules. `sitemap.ts` dynamically lists public content.
- **Code Quality Pattern:** Husky pre-commit runs lint-staged (prettier + eslint) + typecheck. Pre-push runs full build. CI (GitHub Actions) runs validate on push/PR. Run `npm run validate` locally to simulate CI.

---

## 14. 📚 Key References

_Links to documentation, design files, and other resources that the AI or developer may need._

- **Next.js 16 Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **React 19 Docs:** [https://react.dev](https://react.dev)
- **Tailwind CSS v4 Docs:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Shadcn/UI Docs:** [https://ui.shadcn.com](https://ui.shadcn.com)
- **Drizzle ORM Docs:** [https://orm.drizzle.team](https://orm.drizzle.team)
- **Clerk Docs:** [https://clerk.com/docs](https://clerk.com/docs)
- **Stripe Docs:** [https://docs.stripe.com](https://docs.stripe.com)
- **Resend Docs:** [https://resend.com/docs](https://resend.com/docs)
- **next-intl Docs:** [https://next-intl.dev](https://next-intl.dev)
- **Zustand Docs:** [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)
- **SWR Docs:** [https://swr.vercel.app](https://swr.vercel.app)
- **Zod Docs:** [https://zod.dev](https://zod.dev)
- **Sentry Docs:** [https://docs.sentry.io/platforms/javascript/guides/nextjs/](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- **Husky Docs:** [https://typicode.github.io/husky/](https://typicode.github.io/husky/)
- **Design (Figma/Mockups):** N/A
- **Brand Guide / Style Guide:** N/A
