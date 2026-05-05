# 🚀 agentBot

Production-ready Next.js 16 boilerplate with auth, payments, email, storage, i18n, error monitoring, CI/CD, and a clean architecture — skip setup and start building features immediately.

## ✨ What's Included

| Category       | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router, React Compiler) + React 19                        |
| **Styling**    | Tailwind CSS v4 + Shadcn/UI + Lucide Icons                                |
| **Database**   | PostgreSQL via NeonDB + Drizzle ORM                                       |
| **Auth**       | Clerk (proxy + auth helpers + webhook)                                    |
| **Payments**   | Stripe (client + webhook)                                                 |
| **Email**      | Resend (send function + HTML templates)                                   |
| **Storage**    | Cloudflare R2 (S3-compatible)                                             |
| **Monitoring** | Sentry (error tracking + session replay + performance)                    |
| **i18n**       | next-intl (Spanish default + English)                                     |
| **State**      | Zustand (client) + SWR (server)                                           |
| **Forms**      | React Hook Form + Zod validation                                          |
| **Theming**    | next-themes (dark mode ready)                                             |
| **Toasts**     | Sonner                                                                    |
| **CI/CD**      | GitHub Actions + Dependabot + Husky + lint-staged                         |
| **AI Skills**  | 68 pre-installed skills for Clerk, Stripe, Sentry, Next.js, Shadcn & more |

## 🏗️ Architecture Highlights

- **Environment Validation** — Zod schemas validate all env vars at startup. Fail fast with clear errors.
- **Auth Helpers** — `requireAuth()`, `requireRole()`, `getCurrentUser()` — no raw Clerk calls in business logic.
- **Error Hierarchy** — Typed error classes (`NotFoundError`, `ValidationError`, `ForbiddenError`, etc.) with automatic API error handling.
- **Friendly Error Messages** — `getFriendlyErrorMessage()` maps technical errors to user-friendly UX strings.
- **Structured Logger** — `logger.info/warn/error/debug` with timestamps, metadata, and auto-forwarding to Sentry.
- **Data Access Layer (DAL)** — All DB queries isolated in `src/data/`. UI never imports the DB client directly.
- **Server-Only Guards** — Critical modules (`api.ts`, `auth.ts`) use `import "server-only"` to prevent accidental client leaks.
- **Typed Server Actions** — All actions return `ActionResponse<T>` (discriminated union). The `useAction()` hook handles loading/error state automatically.
- **API Route Helpers** — `withErrorHandler()` HOC catches errors and returns consistent JSON responses.
- **SWR Fetcher** — Typed `fetcher<T>` with `FetchError` class for data fetching.
- **Email System** — `sendEmail()` + HTML template functions. Easy to extend with new templates.
- **Webhook Routes** — Clerk (svix verified) + Stripe (signature verified), fully scaffolded.
- **SEO Scaffold** — `robots.ts`, `sitemap.ts`, `manifest.ts` with dynamic configuration.
- **Rate Limiting** — In-memory rate limiter scaffold for API protection.
- **React Compiler** — Automatic memoization without `useMemo`/`useCallback`.

## 🚀 Quick Start

### 1. Create Your Project from Template

Click **"Use this template"** on GitHub, or via CLI:

```bash
gh repo create my-project --template hwong/agentbot --clone
cd my-project
```

### 2. Run Setup Script

This renames all `agentBot` references to your project name:

```bash
chmod +x setup.sh
./setup.sh MyProjectName
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your API keys:

| Service                 | Where to get keys                                                    |
| ----------------------- | -------------------------------------------------------------------- |
| **NeonDB**              | [console.neon.tech](https://console.neon.tech)                       |
| **Clerk**               | [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys        |
| **Stripe**              | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| **Resend**              | [resend.com/api-keys](https://resend.com/api-keys)                   |
| **Cloudflare R2**       | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Manage API |
| **Sentry** _(optional)_ | [sentry.io](https://sentry.io) → Project Settings → Client Keys      |

### 5. Push Database Schema

```bash
npm run db:push
```

### 6. (Optional) Seed Database

```bash
npm run db:seed
```

### 7. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```
├── .agents/skills/       # AI agent skills (Clerk, Stripe, Sentry, Next.js, etc.)
├── .github/              # CI/CD workflows, Dependabot, PR template
├── .husky/               # Git hooks (pre-commit, pre-push)
├── docs/                 # Deployment guide
├── instrumentation-client.ts  # Sentry client-side instrumentation
├── next.config.mjs       # Next.js config (Sentry + React Compiler + i18n)
├── CONTEXT.MD            # Single Source of Truth (SSOT) for AI & developers
├── CONTRIBUTING.md       # Contribution guidelines
├── CHANGELOG.md          # Keep a Changelog format
└── src/
    ├── actions/          # Server Actions (auth + validate + DAL + typed response)
    ├── app/              # App Router pages, layouts, API routes
    │   ├── [locale]/     # i18n locale wrapper (es/en)
    │   ├── api/webhooks/ # Clerk + Stripe webhook handlers
    │   ├── global-error.tsx  # Error boundary with Sentry capture
    │   ├── not-found.tsx     # Custom 404 page
    │   ├── robots.ts         # SEO robots rules
    │   ├── sitemap.ts        # Dynamic sitemap
    │   └── manifest.ts       # PWA manifest
    ├── components/ui/    # Shadcn/UI primitives (Button, Card, Input, etc.)
    ├── data/             # Data Access Layer — pure DB queries
    ├── hooks/            # Custom hooks (useAction)
    ├── i18n/             # Internationalization config + routing
    ├── instrumentation.ts    # Sentry server/edge instrumentation
    ├── lib/              # SDK clients, utils, logger, env, auth, errors
    │   ├── db/           # Drizzle ORM connection + schema + seed
    │   ├── email/        # Email send function + HTML templates
    │   ├── error-messages.ts # Friendly error message mapping
    │   └── rate-limit.ts     # In-memory rate limiter
    ├── messages/         # Translation JSON files (es.json, en.json)
    ├── proxy.ts          # Clerk auth + next-intl locale proxy
    ├── schemas/          # Zod validation schemas
    ├── sentry.*.config.ts    # Sentry server/edge configuration
    ├── store/            # Zustand stores
    └── types/            # Shared TypeScript types
```

## 🧰 Available Commands

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start dev server (Turbopack)                       |
| `npm run build`        | Production build                                   |
| `npm run lint`         | Run ESLint                                         |
| `npm run lint:fix`     | ESLint with auto-fix                               |
| `npm run format`       | Format with Prettier                               |
| `npm run format:check` | Check formatting without writing                   |
| `npm run typecheck`    | TypeScript strict type check                       |
| `npm run validate`     | Full CI locally: typecheck → lint → format → build |
| `npm run clean`        | Delete `.next` cache                               |
| `npm run db:push`      | Push schema to NeonDB                              |
| `npm run db:generate`  | Generate Drizzle migrations                        |
| `npm run db:migrate`   | Run Drizzle migrations                             |
| `npm run db:studio`    | Open Drizzle Studio                                |
| `npm run db:seed`      | Seed database                                      |

## 🤖 AI Agent Skills

This template comes with **68 pre-installed AI agent skills** that give AI assistants (Antigravity, Cursor, GitHub Copilot, etc.) deep knowledge of your stack:

| Source               | Skills                                           |
| -------------------- | ------------------------------------------------ |
| **Clerk**            | Auth patterns, webhooks, testing, org management |
| **Next.js / Vercel** | Best practices, caching, upgrades                |
| **Stripe**           | Payments, billing, security, upgrades            |
| **Sentry**           | SDK setup, debugging, code review                |
| **Resend**           | Email sending, React Email, CLI                  |
| **Cloudflare**       | Workers, R2, D1, Wrangler, performance           |
| **Shadcn/UI**        | Components, styling, forms, composition          |
| **Drizzle**          | ORM best practices (community)                   |

Skills are stored in `.agents/skills/` and loaded automatically by compatible AI agents.

## 🔒 Quality Gates

Every commit is automatically validated:

1. **Pre-commit** (Husky) → `lint-staged` (Prettier + ESLint) + TypeScript check
2. **Pre-push** (Husky) → Full production build
3. **CI** (GitHub Actions) → typecheck → lint → format:check → build
4. **Dependabot** → Automated dependency update PRs

## 🏁 How to Start Your Project

1. **Define your domain** — Edit `src/lib/db/schema.ts` with your tables.
2. **Push schema** — `npm run db:push`.
3. **Create DAL functions** — Add files in `src/data/` for each entity.
4. **Build Server Actions** — Add files in `src/actions/` following the example pattern.
5. **Build UI** — Create pages in `src/app/[locale]/` and components in `src/components/`.
6. **Update CONTEXT.MD** — Keep it updated as your single source of truth.

## 📖 CONTEXT.MD

This project includes a comprehensive `CONTEXT.MD` file that serves as the **Single Source of Truth (SSOT)** for any AI assistant or developer working on the project. It documents:

- Full tech stack and coding guidelines
- Complete directory structure and route inventory
- Database schema and DAL patterns
- All environment variables
- Known gotchas and architectural patterns
- Project roadmap and current status

**Always keep `CONTEXT.MD` updated** — it saves time for both humans and AI.

## 📄 License

MIT
