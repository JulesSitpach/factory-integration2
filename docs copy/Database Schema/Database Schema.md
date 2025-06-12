# Database Schema & Supabase Setup Guide

_factory-integration_

_Last updated: 2025-06-09_

---

## 1 Overview

The factory-integration platform stores user profiles, integration metadata, cost-calculation history, audit logs and more in PostgreSQL / Supabase.  
This guide explains how to:

1. Spin-up a Supabase project & configure environment variables
2. Apply the SQL migration scripts delivered in `/migrations/*.sql`
3. Enable Row Level Security (RLS) & JWT authentication for the API
4. Run local development with the Supabase CLI
5. Promote changes to staging / production instances

---

## 2 Prerequisites

| Tool                | Version | Purpose                             |
| ------------------- | ------- | ----------------------------------- |
| **Node.js**         | ≥ 18    | Run Next.js app & scripts           |
| **supabase CLI**    | ≥ 1.145 | Local Supabase & migrations         |
| **psql** (optional) | latest  | Direct SQL execution                |
| **Docker**          | ≥ 20    | Local database via `supabase start` |
| **Git**             | any     | clone repository                    |

Install Supabase CLI:

```bash
brew install supabase/tap/supabase   # macOS
# or
npm  i -g supabase
```

---

## 3 Create a Supabase Project

1. Sign-in at <https://app.supabase.com> → **New project**
2. Choose _Organization_, _Project name_ (eg. `factory-integration`), strong _DB password_
3. Wait for project provisioning (30-60 s)
4. Note **Project URL**, **Anon public key**, **Service role key**, **JWT secret** (Settings → API)

---

## 4 Configure Environment Variables

Copy `.env.example` to `.env.local` (root of repo) and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-side only
SUPABASE_JWT_SECRET=<jwt-secret>               # matches Supabase JWT secret
```

Add any optional provider secrets (GitHub, Google, SMTP) as required.

---

## 5 Apply SQL Migrations

All schema objects live in `migrations/`. Each file is **idempotent** – safe to re-run.

### 5.1 Local development (recommended)

```bash
# start local Postgres, Studio & auth emulator
supabase start

# in another terminal
supabase db reset                     # wipes local DB
supabase db push                      # applies migrations/*
```

This spins up `localhost:54322` (Postgres) and `localhost:54323` (Studio) containers.

### 5.2 Directly against remote project

**⚠️ Use with caution in production.**

```bash
supabase link --project-ref <project-ref>
supabase db push --remote
```

or with plain `psql`:

```bash
psql "postgresql://postgres:<DB_PASSWORD>@db.<project-ref>.supabase.co:6543/postgres" \
     -f migrations/00001_initial_schema.sql
```

### 5.3 Migration contents (high-level)

| Object                     | Purpose                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Schemas**: `factory_app` | logical separation from `public`                                                                              |
| **Tables**                 | `user_profiles`, `cost_calculations`, `integration_configs`, `data_mappings`, `integration_jobs`, `audit_log` |
| **Views**                  | `active_integrations`                                                                                         |
| **Enum types**             | `user_role`, `integration_type`, `integration_status`, `job_status`                                           |
| **Functions**              | `calculate_total_cost`, `create_audit_log`, `set_updated_at`                                                  |
| **Policies**               | Fine-grained RLS for all tables                                                                               |
| **Extensions**             | `uuid-ossp`, `pgcrypto`, `pg_stat_statements`                                                                 |

---

## 6 Authentication & RLS

Supabase Auth (email magic-link, OAuth, etc.) populates `auth.users`.

### 6.1 Linking app data to Supabase Auth

The `user_profiles.id` column is a **FK → `auth.users.id`**.  
Immediately after a user signs-up, create a matching `user_profile` row (NextAuth callback or DB trigger).

### 6.2 Row-Level Security

Policies are defined in the migration script. Key rules:

| Table                 | Read           | Write              |
| --------------------- | -------------- | ------------------ |
| `user_profiles`       | self or admin  | self or admin      |
| `cost_calculations`   | owner or admin | owner via `INSERT` |
| `integration_configs` | admin/engineer | admin              |
| `audit_log`           | admin          | _none_             |

All Supabase client calls inside the app respect these policies when using **Anon Key**.  
Server-side “admin” calls use the **service-role key** (bypasses RLS) – restrict to trusted code paths.

---

## 7 Running the App Locally

```bash
# terminal 1 – Supabase
supabase start        # local db + auth

# terminal 2 – Next.js
pnpm install
pnpm dev              # http://localhost:3000
```

The app connects to local Supabase (`localhost:54322`) automatically when `supabase start` is active; otherwise it uses the remote project URL from `.env.local`.

---

## 8 Promoting to Production

1. **Create staging** Supabase project → apply migrations
2. Test end-to-end (auth, integrations, cost calculator)
3. Review DB usage limits (compute, storage, egress)
4. Update `.env.production` with production keys
5. Deploy Next.js via Vercel, Fly.io, AWS, etc.
6. Configure **Allowed Redirect URLs** in Supabase Auth (Vercel domain, custom domain)

---

## 9 Back-up & Disaster Recovery

- Enable **Point-in-Time Recovery (PITR)** on paid Supabase tiers
- Schedule daily `supabase db dump` or use Supabase scheduled backups
- Store dumps in off-site storage (S3, GCS)

---

## 10 Troubleshooting

| Issue                       | Resolution                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| _`auth.uid()` returns null_ | Ensure `supabase.auth.getSession()` is called on client; check `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| RLS “permission denied”     | Verify policy predicates & that JWT contains correct claims (`role`, `sub`)                    |
| Migrations fail on enums    | Supabase <1.100 required `ALTER TYPE` work-arounds; upgrade CLI                                |
| Cannot connect to local DB  | Another service may already use port 54322 – change with `supabase start --db-port 54325`      |

---

## 11 Additional Resources

- Supabase docs: <https://supabase.com/docs>
- Supabase CLI: `supabase --help`
- NextAuth + Supabase pattern: <https://supabase.com/docs/guides/auth/auth-nextjs>
- Postgres RLS deep dive: <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

---

**Happy building!** 🚀
