# TradeNavigatorPro – Developer Guide

Welcome to the codebase!  
This README is **for engineers who will clone, run, and extend TradeNavigatorPro**.  
For business-level documentation (features, user stories, design system, etc.) see `/docs`.

---

## 1. Quick Start

### 1.1 Prerequisites

| Tool             | Minimum Version                | Notes                                      |
| ---------------- | ------------------------------ | ------------------------------------------ |
| Node.js          | 18 LTS                         | Check with `node -v`                       |
| npm              | 9.x                            | Yarn/PNPM are fine, but scripts assume npm |
| Git              | latest                         |                                            |
| Supabase account | —                              | Create project & copy URL / anon key       |
| Stripe account   | —                              | For payments & webhooks                    |
| Optional         | Docker, Redis, Sentry, Datadog |

### 1.2 Clone & bootstrap

```bash
git clone https://github.com/JulesSitpach/factory-integration.git
cd factory-integration
cp .env.example .env.local          # add your secrets
npm install                         # install dependencies
npm run dev                         # http://localhost:3000
```

The first run will:

1. Compile Tailwind/TypeScript
2. Launch Next.js 14 in **app router** mode
3. Hot-reload on file changes

---

## 2. Project Structure (monorepo-lite)

```
/
├── app/                    # Next.js app directory
│   ├── (auth)/             # Authentication routes
│   ├── (marketing)/[locale]/
│   ├── (dashboard)/[locale]/
│   └── api/                # REST / server actions
├── components/             # Re-usable React / UI
├── lib/                    # Shared logic (db, auth, i18n, ai, utils)
├── public/                 # Static assets
├── scripts/                # One-off or CI helper scripts
├── types/                  # Global TS types
├── docs/                   # Product & technical docs (non-code)
└── tests/                  # Jest / Playwright
```

Key conventions:

- **Absolute imports** with `@/*`, e.g. `import NavBar from '@components/NavBar'`
- **Multi-language** folders use `[locale]` param (`en`, `es`, …)
- **Server Components** default; append `'use client'` only when needed.

---

## 3. Environment Variables

All runtime secrets live in **`.env.local`** (ignored by git).  
Populate from your Supabase & Stripe dashboards.

Important keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENROUTER_API_KEY=
```

Tip: `next dev` automatically loads `.env.local`.

---

## 4. NPM Scripts

| Script                   | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `dev`                    | Local dev server                                |
| `build` / `start`        | Production build & run                          |
| `type-check`             | `tsc --noEmit`                                  |
| `lint`                   | ESLint + Prettier                               |
| `format`                 | Prettier write                                  |
| `test`, `test:watch`     | Jest unit tests                                 |
| `db:migrate` / `db:seed` | Prisma migrations (server-side helpers)         |
| `i18n:extract`           | Pulls message keys into `public/locales/*.json` |

---

## 5. Coding Guidelines

- **TypeScript first** – no `any`; leverage generics & `zod` for validation.
- **Tailwind CSS** via classNames; avoid inline styles.
- **ESLint + Prettier** run on pre-commit (husky).
- Prefer **React Server Components**; move client logic behind `'use client'`.
- Keep **components dumb, hooks smart** (`/lib/hooks/*`).
- **Feature flags** via environment or Supabase config.

---

## 6. Git Workflow

1. `main` – protected, always deployable.
2. Feature branches: `feat/<scope>`, `fix/<scope>`, `chore/*`.
3. PR template lives in `.github/`.
4. Pass **CI** (lint, type-check, unit tests) before merging.

---

## 7. Testing Strategy

- **Jest + React Testing Library** for unit / component tests.
- **Playwright** (planned) for e2e flows.
- Run `npm test` locally, CI executes `npm run test:ci`.

---

## 8. Local Supabase Tips

```bash
# optional: run supabase locally (requires supabase CLI)
supabase init
supabase start
```

- SQL schema lives in `/prisma/schema.prisma` (server environment).
- Migrations auto-generated with `prisma migrate dev`.

---

## 9. CI/CD Overview

| Stage  | Tool           | Description                    |
| ------ | -------------- | ------------------------------ |
| Build  | GitHub Actions | `npm ci && npm run build`      |
| Test   | GitHub Actions | Lint, type-check, Jest         |
| Deploy | Vercel         | Auto-deploy `main`             |
| DB     | Supabase       | Managed Postgres, RLS policies |

See `/docs/CI CD Pipeline CI/` for YAML details.

---

## 10. Troubleshooting

| Issue                        | Fix                                                                 |
| ---------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_* undefined`    | Check `.env.local` spelling                                         |
| CORS errors to Supabase      | Ensure project URL set in Supabase -> Auth -> URL config            |
| Stripe webhook fails         | Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| Tailwind classes not applied | Restart `npm run dev`; ensure imported `app/globals.css`            |

---

## 11. Contribution Guide

1. Open issue or draft PR to discuss feature.
2. Follow coding guidelines & write tests.
3. Update docs if public API or UI changes.
4. Add yourself to CONTRIBUTORS.md (TBD).

Happy shipping! 🚀
