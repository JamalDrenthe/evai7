# EVAI Ecosystem Platform (`xabai/app`)

> A unified, context-aware **AI operating layer** that absorbs calculators, chatbots, productivity tools and verification modules into a single workspace with a shared LLM orchestrator, persistent session memory, and pluggable modules.

Built end-to-end in **TypeScript** on React 19 + Vite + Hono + Drizzle ORM, with optional Supabase Postgres, Redis, and a Python sidecar for Voice Verification.

---

## Table of contents

- [Overview](#overview)
- [The three interaction modes](#the-three-interaction-modes)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Module registry](#module-registry)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Database](#database)
- [LLM providers](#llm-providers)
- [Demo login](#demo-login)
- [Docker](#docker)
- [Project phases](#project-phases)
- [Troubleshooting](#troubleshooting)

---

## Overview

EVAI is an **AI operating system for tools** — not a website. It exposes one chat-driven workspace where an LLM orchestrator can invoke any registered "module" (calculator, chatbot, tool, visualization, verification) as a typed function call, with results flowing into a shared session context that persists across tool invocations.

Highlights:

- **Auto-discovery module registry** (`api/modules/*` + `src/modules/*`) — drop a folder, register the manifest, and the module is instantly available to the LLM, the Module Browser UI, and the Direct Tool mode.
- **Streaming SSE orchestrator** with OpenAI-compatible tool calling, multi-step workflow tracking, and `@variable` reference resolution in user messages.
- **Three first-class interaction modes** rendered from one Workspace shell.
- **Type-safe end-to-end** via Zod schemas shared between client/server through tRPC.
- **Graceful offline degradation**: no DB / no Redis / no Supabase → in-memory sessions + localStorage Documents & Organogram. Ship the demo, wire infra later.

---

## The three interaction modes

The Workspace page (`src/pages/Workspace.tsx`) hosts all three modes, switched via the top-bar `ModeSwitcher`.

| Mode | Slug | What it does |
|---|---|---|
| **1. Chat with Calculators** | `chat-calculators` | LLM can call any registered calculator module as a tool (ZZP, VVC, Mining, Estate). |
| **2. Chat with Projects** | `chat-projects` | LLM can call chatbots, productivity tools, visualizations, and verification modules (TGC, Takenblok, Hellings, Loep, VVC, Ecosysteem). |
| **3. Direct Tool** | `direct-tool` | User picks one module and interacts with its full UI panel directly — no LLM in the middle. |

The orchestrator's `MODE_TO_TYPES` mapping enforces which module types are exposed per mode.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, TailwindCSS 3, Radix UI / shadcn-style components, lucide-react |
| State / Data | TanStack Query, tRPC client, React Router 7 |
| Backend | Hono on Node (`@hono/node-server`), tRPC server, SSE streaming |
| ORM | Drizzle ORM (PostgreSQL dialect via `postgres` driver) |
| DB | Supabase Postgres (Transaction Pooler, port 6543) — optional |
| Auth | JWT via `jose`, httpOnly cookie session, demo login active |
| Validation | Zod (shared client/server via tRPC) |
| Charts | Recharts |
| Forms | react-hook-form + @hookform/resolvers |
| Realtime | SSE for orchestrator token streaming |
| Cache / Sessions | Redis via `ioredis` (optional, falls back to in-process LRU) |
| Build | Vite for client, esbuild for server bundle |
| Test | Vitest |

---

## Project structure

```
app/
├── api/                          # Hono + tRPC backend
│   ├── boot.ts                   # Server entry (Hono app + SSE handler)
│   ├── router.ts                 # Root tRPC router
│   ├── auth-router.ts            # Login / logout / me (demo login)
│   ├── modules-router.ts         # Module manifest endpoints
│   ├── sessions-router.ts        # Session create / setMode / setActiveModule
│   ├── tools-router.ts           # Tool registry + execution
│   ├── workspace-router.ts       # Documents & Organogram CRUD
│   ├── work-router.ts            # Work items
│   ├── agenda-router.ts          # Calendar / events
│   ├── notifications-router.ts   # Notifications
│   ├── lib/                      # env, auth, cookies, http, vite static
│   ├── kimi/                     # Session token signing
│   ├── middleware/               # Rate limit
│   ├── orchestrator/             # LLM orchestrator
│   │   ├── index.ts              # Workflow engine + variable parser
│   │   ├── llm-client.ts         # OpenAI-compatible + mock client
│   │   └── sse-handler.ts        # SSE streaming endpoint
│   └── modules/                  # Backend module skills (12 modules)
│       ├── _registry.ts
│       ├── zzp-netto-calculator/ # { schema, skill, manifest }
│       ├── vvc-calculator/
│       ├── tgc-chatbot/
│       ├── organogram/
│       ├── … (8 more)
│
├── src/                          # React frontend
│   ├── App.tsx                   # Routes
│   ├── main.tsx                  # Entry
│   ├── pages/                    # Dashboard, Workspace, Tools, Organigram, Agenda, …
│   ├── components/
│   │   ├── orchestrator/         # ChatStream, ContextViewer, ModeSwitcher, ModuleBrowser
│   │   ├── documents/            # DocumentsPanel + tabs
│   │   ├── layout/               # Sidebar + AuthLayout
│   │   └── ui/                   # shadcn-style primitives (50+ components)
│   ├── modules/                  # Frontend module panels (mirror of api/modules)
│   │   ├── _registry.ts          # Lazy-loaded panels + context cards
│   │   └── <module>/             # { Panel.tsx, ContextCard.tsx, manifest.ts }
│   ├── hooks/                    # useOrchestrator, useAuth, …
│   ├── providers/                # TRPCProvider
│   └── lib/                      # supabase client, utils
│
├── contracts/                    # Shared Zod schemas + TS types
│   ├── llm.ts                    # LLMClient, ChatRequest, ChatChunk, ToolCall
│   ├── module-manifest.ts        # ModuleManifest + InteractionMode
│   ├── session-context.ts        # SessionContext, Workflow, History
│   ├── skill.ts                  # Skill interface
│   └── constants.ts
│
├── db/
│   ├── schema.ts                 # Drizzle schema (users, sessions, modules, docs, organogram, …)
│   ├── seed.ts                   # Seed data
│   └── migrations/               # SQL migrations (hand-written for Supabase)
│
├── public/                       # Static assets
├── Dockerfile                    # Multi-stage build (deps → build → production)
├── docker-compose.yml            # app + mysql + redis + ollama + python-services
├── drizzle.config.ts             # Drizzle Kit config (PostgreSQL)
├── vite.config.ts                # Vite + Hono dev server
├── .env.example                  # Reference for required env vars
└── package.json
```

---

## Module registry

Every module is a self-contained folder that ships:

1. **Backend skill** (`api/modules/<id>/`): `schema.ts` (Zod input/output), `skill.ts` (execution logic), `manifest.ts` (typed `ModuleManifest`).
2. **Frontend manifest** (`src/modules/<id>/`): `Panel.tsx` (full UI), `ContextCard.tsx` (history card), `manifest.ts` (frontend metadata, lazy import).

Both registries (`api/modules/_registry.ts` and `src/modules/_registry.ts`) eagerly import every module at boot; adding a new one requires:

1. Drop `api/modules/<new-id>/` + `src/modules/<new-id>/`.
2. Add one import line per registry.
3. Restart dev server.

The module then appears in the Module Browser, becomes callable by the LLM, and is selectable in Direct Tool mode.

### Current modules (12 registered)

| # | Module | Type | Status |
|---|---|---|---|
| 1 | ZZP Netto Calculator | calculator | ✅ Functional (NL tax 2025) |
| 2 | VVC Calculator | calculator | ✅ Functional (sliders + chart) |
| 3 | Mining Calculator | calculator | ⏸️ Placeholder |
| 4 | Estate Calculator | calculator | ⏸️ Placeholder |
| 5 | TGC Chatbot | chatbot | ✅ Functional (multilingual) |
| 6 | Hellings Delivery Chatbot | chatbot | ⏸️ Placeholder |
| 7 | Loep Services Chatbot | chatbot | ⏸️ Placeholder |
| 8 | VVC Chatbot | chatbot | ⏸️ Placeholder |
| 9 | Ecosysteem Chatbot | chatbot | ⏸️ Placeholder (meta) |
| 10 | Organogram | visualization | ✅ Functional (query + CRUD) |
| 11 | Takenblok | tool | ⏸️ Placeholder |
| 12 | Visualization | visualization | ⏸️ Placeholder |
| 13 | Verification | verification | ⏸️ Placeholder |
| 14 | Voice Verification | verification | ⏸️ Placeholder (TS stub → Python sidecar) |

Placeholders are wired into the registry, return descriptive "source code pending" responses, and have a Panel UI explaining what's expected. Replacing them with real logic requires **zero core changes**.

---

## Getting started

### Prerequisites

- **Node.js 20+** (the Dockerfile pins `node:20-alpine`)
- **npm** (lockfile is `package-lock.json`)
- Optional: a **Supabase project** (for Postgres + Documents/Organogram CRUD)
- Optional: a **Redis server** (for persistent sessions)
- Optional: an **LLM API key** (OpenAI / Groq / Together / OpenRouter / Google Gemini) **or** a local **Ollama** install

### Install

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
# then edit .env — see the table below
```

The minimum to launch the app in **demo mode** is just:

```dotenv
APP_ID=eva7-local
APP_SECRET=any-long-random-string
```

Everything else falls back to mock / in-memory / localStorage.

### Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000> and log in with the [demo credentials](#demo-login).

### Type-check & lint

```bash
npm run check    # tsc -b
npm run lint     # eslint .
npm run format   # prettier --write .
```

### Test

```bash
npm test         # vitest run
```

---

## Environment variables

Full reference (matches `.env.example`):

### Backend core

| Variable | Required | Description |
|---|---|---|
| `APP_ID` | yes | Application ID, used as JWT issuer. |
| `APP_SECRET` | yes (in prod) | JWT signing secret. Falls back to a demo key in dev. **Rotate before production.** |
| `DATABASE_URL` | optional | Supabase **Transaction Pooler** connection string (port `6543`). Required only for `drizzle-kit` and DB-backed routers. Format: `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres`. |
| `KIMI_AUTH_URL` | optional | Legacy Kimi OAuth server URL (currently unused). |
| `KIMI_OPEN_URL` | optional | Legacy Kimi Open Platform URL (currently unused). |
| `OWNER_UNION_ID` | optional | `union_id` of the platform owner; receives `role=admin` on first login. |

### LLM orchestrator

| Variable | Required | Description |
|---|---|---|
| `LLM_PROVIDER` | optional | `openai` \| `ollama` \| _(empty for mock)_. |
| `LLM_API_KEY` | depends | API key for the OpenAI-compatible endpoint. |
| `LLM_MODEL` | optional | Model id (e.g. `gpt-4o-mini`, `gemini-2.5-flash`, `llama3.2`). |
| `LLM_BASE_URL` | optional | Override base URL. Examples: `https://api.groq.com/openai/v1`, `https://generativelanguage.googleapis.com/v1beta/openai`, `https://openrouter.ai/api/v1`. |
| `OLLAMA_HOST` | optional | Default `http://localhost:11434/v1` when `LLM_PROVIDER=ollama`. |

Without `LLM_PROVIDER` set, the orchestrator uses the built-in `MockLLMClient` which still demonstrates tool calling (it will invoke the ZZP calculator on keywords like "zzp" / "bereken" / "netto").

### Memory & sidecars

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | optional | `redis://localhost:6379`. Without it, sessions live in an in-process LRU map. |
| `SESSION_TTL_HOURS` | optional | Defaults to `6`. |
| `PYTHON_BRIDGE_URL` | optional | `http://localhost:8001` — only required when the Voice Verification sidecar is enabled. |

### Frontend (exposed to the browser via Vite)

| Variable | Required | Description |
|---|---|---|
| `VITE_APP_ID` | optional | Mirror of `APP_ID` for the client. |
| `VITE_KIMI_AUTH_URL` | optional | Kimi OAuth server URL for the client (currently unused). |
| `VITE_SUPABASE_URL` | optional | `https://<project-ref>.supabase.co`. When empty, Documents + Organogram fall back to **localStorage offline mode**. |
| `VITE_SUPABASE_ANON_KEY` | optional | Supabase publishable / anon key. |

⚠️ **`.env` is gitignored** (`@.gitignore:26`) — never commit secrets. Use `.env.example` for non-secret references only.

---

## npm scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server on port `3000` with Hono backend hot-reload (`@hono/vite-dev-server`). |
| `npm run build` | Vite client build → `dist/public/` **and** esbuild server bundle → `dist/boot.js`. |
| `npm start` | Production server: `NODE_ENV=production node dist/boot.js`. |
| `npm run preview` | Vite production preview. |
| `npm run check` | TypeScript project-references check (`tsc -b`). |
| `npm run lint` | ESLint over the whole repo. |
| `npm run format` | Prettier write. |
| `npm test` | Vitest one-shot run. |
| `npm run db:generate` | `drizzle-kit generate` — emit migrations from `db/schema.ts`. |
| `npm run db:migrate` | `drizzle-kit migrate` — apply pending migrations. |
| `npm run db:push` | `drizzle-kit push` — push schema directly (dev only). |

> All `db:*` scripts require a valid `DATABASE_URL`.

---

## Database

The schema lives in `db/schema.ts` (Drizzle, PostgreSQL dialect). It defines:

- `users`, `sessions`, `chat_sessions`, `chat_messages`
- `documents`, `tools`, `tool_executions`
- `notifications`, `work_items`, `events`
- `module_runs`, `workflow_runs`, `module_registry`
- `organogram_nodes`, `workspace_documents` (the latter two are also driven by Supabase RLS — see `db/migrations/0001_workspace_documents_and_organogram.sql`)

### Set up Supabase

1. Create a Supabase project.
2. Copy your **Transaction Pooler** connection string into `DATABASE_URL`.
3. Copy the project URL + anon key into `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Either run the SQL in `db/migrations/0001_workspace_documents_and_organogram.sql` via the Supabase SQL editor, **or** run `npm run db:push` to sync the full Drizzle schema.

If you skip this, the app still runs — Documents and Organogram fall back to localStorage.

---

## LLM providers

The orchestrator (`api/orchestrator/llm-client.ts`) speaks the OpenAI Chat Completions protocol, so any compatible endpoint works. Tested setups:

### Google Gemini (OpenAI-compatible endpoint)

```dotenv
LLM_PROVIDER=openai
LLM_API_KEY=AIza...
LLM_MODEL=gemini-2.5-flash
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
```

### OpenAI

```dotenv
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
# LLM_BASE_URL unset → defaults to https://api.openai.com/v1
```

### Groq

```dotenv
LLM_PROVIDER=openai
LLM_API_KEY=gsk_...
LLM_MODEL=llama-3.3-70b-versatile
LLM_BASE_URL=https://api.groq.com/openai/v1
```

### Local Ollama

```dotenv
LLM_PROVIDER=ollama
LLM_MODEL=llama3.2
OLLAMA_HOST=http://localhost:11434/v1
```

```bash
ollama serve
ollama pull llama3.2
```

### Mock (no key needed)

Leave `LLM_PROVIDER` unset. The mock client streams a friendly message and still triggers the ZZP calculator on keywords like "bereken" / "zzp" / "netto" so you can verify the tool-calling pipeline end-to-end.

---

## Demo login

The auth router (`api/auth-router.ts`) ships with a hard-coded demo user:

- **Email:** `demo@evai.nl`
- **Password:** `demo123`

This bypasses the database, mints a JWT with `unionId=demo-user`, and sets the session cookie. Disable or replace this before production.

---

## Docker

The repo ships with a multi-stage `Dockerfile` (Node 20 alpine) and a `docker-compose.yml` that wires the app together with optional services:

```bash
docker compose up app                     # app only (needs external Postgres + LLM)
docker compose --profile local-llm up    # + Ollama
docker compose --profile python-services up   # + Python sidecar for Voice Verification
```

> Note: `docker-compose.yml` currently references a MySQL container as a legacy example. The production target is **Supabase Postgres** — point `DATABASE_URL` at your Supabase instance and you can ignore the MySQL service.

---

## Project phases

See the per-phase summaries for granular history:

- `PHASE_2_SUMMARY.md` — Cross-tool intelligence (multi-step workflow engine, variable references, VVC Calculator).
- `PHASE_3_SUMMARY.md` — Project agents (Takenblok + 4 chatbot placeholders, Mode 2 wiring).
- `PHASE_4_SUMMARY.md` — Advanced features (Visualization, Verification, Voice Verification stubs).
- `FLOW_A_TESTING.md` — Manual test plan for Phase 1 (orchestrator + 3 modes + 3 functional modules).
- `KIMI_PROMPT.md` — Original master spec.

### What's still pending

- Source code for 10 placeholder modules (Mining, Estate, Takenblok, Hellings, Loep, VVC Chatbot, Ecosysteem, Visualization, Verification, Voice Verification).
- Python sidecar implementation for Voice Verification.
- pgvector indexing for semantic history search (optional, low priority).
- Replacing the demo login with the real Kimi OAuth flow (when `KIMI_AUTH_URL` becomes available).

---

## Troubleshooting

**"No active session" on `/workspace`** — Browser cookie missing. Make sure you logged in at `/login` first.

**Tool calls fail with `LLM_ERROR`** — Verify `LLM_PROVIDER` + `LLM_API_KEY` (and `LLM_BASE_URL` for non-OpenAI providers). For Ollama, confirm `ollama serve` is running and the model is pulled.

**`drizzle-kit` throws `DATABASE_URL is required`** — Set `DATABASE_URL` in `.env` (Supabase Transaction Pooler string).

**Documents / Organogram changes disappear on refresh** — `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are empty, so the frontend is in localStorage mode. Fill them and run the migration to enable persistence.

**SSE stream doesn't deliver tokens** — Check the browser DevTools Network tab for `/api/orchestrator/stream`. CORS issues only appear if you're hitting the backend from a different origin; the dev server proxies it transparently.

---

## License

Private project. All rights reserved.
