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
#   NEXT_PUBLIC_API_URL       -> the backend incl. its /v1 prefix, e.g. http://localhost:3000/v1
#   NEXT_PUBLIC_RECAPTCHA_SITE_KEY -> reCAPTCHA v3 site key (optional in dev)
#   NEXT_PUBLIC_SITE_URL      -> canonical site origin for metadataBase/OG (optional)

# Start the dev server (Turbopack)
pnpm dev
```

The app runs on `http://localhost:3002`. **The backend must be running** (default
`http://localhost:3000`) — see `../nextlift-backend`.

> **`NEXT_PUBLIC_API_URL` must include the backend's `/v1` version prefix.** The
> backend uses URI versioning (`defaultVersion: '1'`), so every route lives under
> `/v1` (e.g. `/v1/auth/login`); the client appends paths directly to
> `NEXT_PUBLIC_API_URL`. Locally that means `http://localhost:3000/v1`; in
> production it is the deployed backend origin + `/v1`.

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
- `src/features/` — feature modules (workouts, exercises, programs, body-measurements, …)
- `src/components/` — shared UI, incl. `components/ui/` (shadcn)
- `src/api/` — the hand-written API client, auth context and data hooks
- `src/react-query/` — the QueryClient
- `src/validation/` — Zod schemas
- `src/hooks/`, `src/lib/` — hooks, utilities and constants

## Training programs

`/app/programs` lists the curated library (filterable by goal, level and days
per week) and the user's own programs; `/app/programs/[programId]` shows a
program's blocks, weeks and days with an enroll wizard (start date, weekday
mapping for calendar programs, starting loads prefilled from history);
`/app/programs/active` is the active program: today's / next workout, week
navigation with per-day actions (start, skip, jump), adherence, lift trends
and a sheet to adjust numbers or swap exercises. Data hooks live in
`src/api/programs/` and `src/api/program-enrollments/`; formatting helpers in
`src/lib/program-format.ts`.

Users build their own programs at `/app/programs/new` (a short wizard:
basics, schedule, days) and refine them at `/app/programs/[programId]/edit`:
a full-page editor with a per-week strip (labels, deload toggle, volume and
load multipliers), day cards whose exercises and sets autosave through a
debounced replace-all request, a progression form per exercise (linear with
optional set × rep stages, double, percent of training max with AMRAP rules,
RPE top-set or RIR mesocycle, fixed), template import and a readiness check
mirroring the backend's enrollment validation. Curated programs can be copied
into "Mine" with "Customize a copy". Editor state lives in
`src/features/programs/editor/` (`draft.ts`, `use-day-autosave.ts`,
`wizard-plan.ts`).

Program workouts are ordinary workouts: their sets carry the prescription as
`suggested*` fields plus a `programSetId`, which is what turns on the target
chip, the RPE column, the AMRAP marker and the auto-starting rest timer in the
workout modal. Free workouts and templates are untouched, and the dashboard
card only renders while a program is being followed.

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
   Production and Preview: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`;
   Production only: `NEXT_PUBLIC_SITE_URL` — the canonical site origin used for
   `metadataBase`/OG URLs (optional; falls back to the deployment URL).
2. **Install/build**: pnpm is used automatically (pinned via `packageManager`).
3. **Deploy**: push a branch → Preview build → open a PR to review; merge to
   `main` → Production.
4. **Rollback**: Vercel dashboard → Deployments → promote a previous deployment
   (instant, no rebuild).

CI (`.github/workflows/ci.yml`) runs lint / typecheck / test / build on pushes
and PRs, independent of Vercel's build.
