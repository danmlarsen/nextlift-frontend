# NextLift Workout Tracker — Frontend

The web client for NextLift: create workouts, log sets and reps, track personal
records and body measurements, and visualize progress. Built with Next.js and
TypeScript.

## Tech Stack

- **Framework**: Next.js 15 (App Router) — a client-rendered SPA (no server data
  fetching or Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config) + shadcn/ui (Radix primitives)
- **Data**: TanStack Query v5 against the NextLift backend
- **Forms**: React Hook Form + Zod
- **Auth**: JWT — access token held in memory, refresh token in an httpOnly cookie
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library
- **Package manager**: pnpm (pinned via `packageManager`; **Node ≥ 22**)

## Quick Start

```bash
# Install dependencies (pnpm is pinned; Node >= 22)
pnpm install

# Configure environment
cp .env.local.example .env.local
#   NEXT_PUBLIC_API_URL       -> the backend, e.g. http://localhost:3000
#   NEXT_PUBLIC_RECAPTCHA_SITE_KEY -> reCAPTCHA v3 site key (optional in dev)

# Start the dev server (Turbopack)
pnpm dev
```

The app runs on `http://localhost:3002`. **The backend must be running** (default
`http://localhost:3000`) — see `../nextlift-backend`.

> `NEXT_PUBLIC_API_URL` is required: the build fails fast if it is unset
> (see `src/lib/constants.ts`).

> **pnpm build approvals**: `pnpm-workspace.yaml` approves the dependency build
> scripts pnpm 11 blocks by default (`@tailwindcss/oxide`, `esbuild`, `sharp`, …)
> and pins a couple of patched transitive versions via `overrides`. Do not delete
> it — without it `pnpm install` aborts with `ERR_PNPM_IGNORED_BUILDS` and the
> Vercel build fails.

## Scripts

```bash
pnpm dev          # dev server (Turbopack) on :3002
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest (watch)
pnpm test:run     # vitest run (CI)
pnpm api:generate # orval codegen (see "API client" below)
```

## Project Structure

- `src/app/` — App Router routes and layouts (`(public)` marketing/auth, `app/`
  the authenticated product)
- `src/features/` — feature modules (workouts, exercises, body-measurements, …)
- `src/components/` — shared UI, incl. `components/ui/` (shadcn)
- `src/api/` — the hand-written API client, auth context and data hooks
- `src/react-query/` — the QueryClient
- `src/validation/` — Zod schemas
- `src/hooks/`, `src/lib/` — hooks, utilities and constants

## Authentication

JWT with automatic refresh. The access token lives only in React state; the
refresh token is an httpOnly cookie owned by the backend. `localStorage` holds
only a boolean "has session" flag used to decide whether to attempt a refresh on
load. Client routes are gated by the `<AuthGuard>` component (defense-in-depth;
the backend enforces authorization on every request).

## API integration

All requests go through `useApiClient()` (`src/api/client.ts`), which attaches
the bearer token, retries once through a single-flight refresh on 401, and
surfaces errors as `ApiError`.

**Codegen (not yet wired up):** `orval.config.ts` + `pnpm api:generate` are
scaffolding for a planned future release that will generate the client from the
backend's `openapi.json`. The hand-written client in `src/api/` is what the app
uses today.

## Testing

```bash
pnpm test:run
```

Vitest + Testing Library (jsdom). Component tests mock the auth context and
`next/navigation`.

## Deployment (Vercel)

The frontend is deployed on Vercel; pushing to `main` builds and deploys
Production, and pull requests get Preview deployments. There is no `vercel.json`
— build settings and environment variables live in the Vercel dashboard.

1. **Environment variables** (Project → Settings → Environment Variables), for
   Production and Preview: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
2. **Install/build**: pnpm is used automatically (pinned via `packageManager`).
3. **Deploy**: push a branch → Preview build → open a PR to review; merge to
   `main` → Production.
4. **Rollback**: Vercel dashboard → Deployments → promote a previous deployment
   (instant, no rebuild).

CI (`.github/workflows/ci.yml`) runs lint / typecheck / test / build on pushes
and PRs, independent of Vercel's build.
