# Simplefit — Agent Instructions

## Project Overview
Simplefit is a fitness management app. The workspace is a **pnpm monorepo** with two packages:
- `src/backend` — Node.js + Express REST API written in TypeScript, compiled with `tsc`
- `src/frontend` — Next.js 15 app (App Router) written in TypeScript

## Workspace Commands (run from root)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run backend + frontend concurrently (dev mode) |
| `pnpm build` | Build backend first, then frontend |
| `pnpm start` | Start both in production mode |
| `pnpm dev:backend` | Run only the backend |
| `pnpm dev:frontend` | Run only the frontend |

## Backend (`src/backend`)

- **Port:** `4000` (default) — override with `PORT` env var
- **Entry:** `src/server.ts` → instantiates `App` from `src/app.ts`
- **Routing pattern:** Each route file exports a `module.exports = router` (CommonJS-compatible). All routes are registered in `src/routes/index.routes.ts`.
- **Build:** `tsc` compiles `src/` → `build/`. Run with `node build/server.js`.
- **Dev:** `tsc-watch` recompiles on save and restarts with `node build/server.js`.

### Adding a new endpoint
1. Create `src/controllers/your.controller.ts`
2. Create `src/routes/your.routes.ts` and export via `module.exports = router`
3. Register in `src/routes/index.routes.ts`

### Current endpoints
- `POST /api/login` — returns `{}`

## Frontend (`src/frontend`)

- **Framework:** Next.js 15 with App Router (`src/app/`)
- **Port:** `3000`
- **API base URL:** `http://localhost:4000` in development

## Conventions
- TypeScript strict mode is enabled in both packages
- No database or auth logic yet — keep it minimal until explicitly added
- pnpm is the only package manager — never use npm or yarn
