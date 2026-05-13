# MASTER PROMPT FOR KIMI 2.6
## EVAI Ecosystem Platform — MVP Ready to Ship

> Copy everything below the divider into Kimi 2.6. This prompt is optimized for autonomous full-stack delivery on the existing `xabai/app` codebase.

---

# ROLE

You are **Kimi 2.6**, operating simultaneously as:

- Senior AI Systems Architect
- Principal Full-Stack Engineer (TypeScript + React + Node)
- AI Orchestration Engineer (LLM tool-calling, multi-agent routing)
- Plugin Ecosystem Designer
- Production Infrastructure Engineer

You will deliver a **production-grade, ship-ready MVP** of the **EVAI Ecosystem Platform**: one unified intelligent workspace that absorbs 12 existing tools (and any future ones) into a single context-aware AI operating layer.

You are not building a website. You are building an **AI operating system for tools, calculators, chatbots, and workflows** with shared memory and orchestration.

---

# 1. CONTEXT — WHAT ALREADY EXISTS

## 1.1 The Codebase: `xabai/app`

The project lives at `C:/Users/verbo/CascadeProjects/xabai/app` and is **already partially built**. Do NOT rebuild from scratch. Extend and refactor.

### Existing Stack (DO NOT REPLACE)

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Radix UI / shadcn-style components |
| State / Data | TanStack Query, tRPC client, Zustand pattern (add if missing) |
| Backend | **Hono** (running on Node via `@hono/node-server`), tRPC server, async-first |
| ORM | Drizzle ORM |
| DB | MySQL (production) — must work without DB in demo mode |
| Auth | JWT via `jose`, cookie-based session, demo login active (`demo@evai.nl` / `demo123`) |
| Validation | Zod (shared between client/server via tRPC) |
| Charts | Recharts |
| Forms | react-hook-form + @hookform/resolvers |
| Icons | lucide-react |
| Realtime | Not yet present — **you will add SSE/WebSocket** |
| Build | esbuild for server bundle, Vite for client |

### Existing Routers (in `api/`)

- `auth-router.ts` — login/logout/me (demo mode active)
- `tools-router.ts` — tool registry endpoints (skeleton)
- `workspace-router.ts` — workspace state
- `agenda-router.ts`, `notifications-router.ts`, `work-router.ts`

### Existing Pages (in `src/pages/`)

- `Login.tsx` — neon-themed, working with demo login
- `Dashboard.tsx`, `Tools.tsx`, `ToolDetail.tsx` — scaffolded, need wiring
- `Workspace.tsx`, `Organigram.tsx`, `Agenda.tsx`, `Work.tsx`, `Account.tsx`

## 1.2 STACK DECISION — CRITICAL

The original spec mentioned Python/FastAPI. **Override this**: the existing codebase is TypeScript end-to-end and works. Rebuilding in Python adds 3+ weeks for zero MVP value.

**Decision tree for Python tools:**

1. **If a tool is pure UI/logic (calculators, chatbots, organograms):** rewrite in TypeScript using the React components already provided. Zero runtime overhead, full type sharing.
2. **If a tool requires Python-only libraries (e.g., Voice Verification with `librosa`, ML models):** expose it as a sidecar **FastAPI microservice** behind a single tRPC adapter at `api/adapters/python-bridge.ts`. The Hono backend orchestrates; Python only does the specialized work.
3. **Default:** TypeScript first. Python only when objectively necessary.

This decision is final unless the user overrides it.

## 1.3 Tools to Integrate (12 modules)

| # | Tool | Type | Notes |
|---|---|---|---|
| 1 | **Mining Calculator** | Calculator (skill) | Source code provided by user — port to TS component |
| 2 | **Estate Calculator** | Calculator (skill) | Port to TS component |
| 3 | **ZZP Netto Calculator** | Calculator (skill) | **Full code provided** — see Appendix A |
| 4 | **Takenblok** | Productivity tool | Task board with shared context |
| 5 | **Hellings Delivery Chatbot** | Agent | Domain-specific chat (delivery logistics) |
| 6 | **Loep Services Chatbot** | Agent | Domain-specific chat (services) |
| 7 | **VVC Chatbot** | Agent | Verdienende Vrienden Club chat |
| 8 | **Voice Verification** | Tool (Python sidecar candidate) | Audio analysis — likely Python |
| 9 | **Organogram** | Visualization tool | **Full code provided** — see Appendix B |
| 10 | **TGC Chatbot** | Agent | **Full code provided** — see Appendix C, multilingual |
| 11 | **Ecosysteem Chatbot** | Agent | Master/meta-chatbot for platform |
| 12 | **VVC Calculator** | Calculator (skill) | **Full code provided** — see Appendix D |

The user will publish more Python projects later. **Architecture must support plug-and-play addition without core changes.**

---

# 2. THE THREE INTERACTION MODES (MANDATORY)

The platform exposes exactly three top-level user modes. The Workspace page (`src/pages/Workspace.tsx`) is the home of all three.

### Mode 1 — Chat with all Calculators

A unified chat interface where the AI orchestrator can call any registered calculator as a tool. Example:

> User: "Bereken mijn ZZP netto bij €120k omzet en €18k kosten, en vergelijk met €100k omzet."
> AI: invokes `ZzpNettoCalculator` twice with different inputs, normalizes outputs, returns comparison.

### Mode 2 — Chat with all Projects

Chat where the AI can query and act on project-style modules (chatbots, organogram, voice verification, takenblok). Example:

> User: "Wat staat er nog open in mijn Takenblok en kan de Ecosysteem Chatbot daar prioriteiten op geven?"
> AI: queries Takenblok module → passes tasks as context to Ecosysteem agent → returns prioritized list.

### Mode 3 — Direct Tool / Skill Use

Skip the chat. User opens a tool directly (e.g., VVC Calculator) and uses its native UI. **All inputs and outputs still flow into the shared session context** so subsequent chat turns are aware.

A toggle at the top of `Workspace.tsx` switches between these three modes. The active session memory is shared across all three.

---

# 3. CRITICAL CROSS-TOOL BEHAVIOR (NON-NEGOTIABLE)

This is the heart of the product. Without it, this is just a tool launcher.

### Required scenario (must work end-to-end in MVP):

1. User opens **Mining Calculator** in Mode 3, runs a calculation. Output: `{ profitPerMonth: 4500, period: "2025-Q1" }`.
2. User switches to **Mode 1 (Chat with calculators)**.
3. User types: *"Neem de winst uit Mining en gooi 'm door de ZZP Netto Calculator als omzet."*
4. AI orchestrator must:
   - Read the **Session Context** to find the latest Mining output.
   - Identify `ZzpNettoCalculator` as the target skill.
   - Map `profitPerMonth × 12` → `revenueInput` (year mode).
   - Invoke the skill, stream the result back.
   - Save the result to the same session context.
5. User: *"Vergelijk dit met als ik 30% meer omzet zou hebben."*
6. AI: re-invokes ZZP calculator with `revenue × 1.3`, returns delta.

**Every step is auditable in a Workflow Timeline panel on the right side of the Workspace page.**

---

# 4. ARCHITECTURE

## 4.1 Layered View

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (React 19 + Vite + TS)                                  │
│  - Workspace shell (3 modes)                                    │
│  - Plugin UI registry (each module registers its panel)         │
│  - Streaming chat (SSE)                                         │
│  - Session Context viewer                                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │ tRPC + SSE
┌─────────────────────────────▼───────────────────────────────────┐
│  EDGE / API (Hono + tRPC)                                       │
│  - Auth middleware                                              │
│  - Session manager                                              │
│  - Tool registry                                                │
│  - Streaming endpoint /api/orchestrator/stream                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│  ORCHESTRATOR (TypeScript service)                              │
│  - Intent classification                                        │
│  - Tool selection (LLM function calling)                        │
│  - Workflow state machine                                       │
│  - Context propagation                                          │
└──────┬───────────────┬──────────────┬───────────────┬───────────┘
       │               │              │               │
   ┌───▼────┐    ┌─────▼────┐   ┌─────▼─────┐  ┌──────▼──────┐
   │ Skills │    │  Agents  │   │  Memory   │  │  Adapters   │
   │ (calc) │    │ (chats)  │   │           │  │ (Python svc)│
   └────────┘    └──────────┘   └───────────┘  └─────────────┘
                                      │
                       ┌──────────────┼─────────────────┐
                       │              │                 │
                  ┌────▼────┐    ┌────▼────┐      ┌─────▼────┐
                  │  Redis  │    │   PG    │      │ pgvector │
                  │ (eph.)  │    │ (persist│      │ (semantic│
                  │         │    │   ent)  │      │  memory) │
                  └─────────┘    └─────────┘      └──────────┘
```

## 4.2 Folder Structure (extend existing)

```
xabai/app/
├── api/
│   ├── boot.ts                        # existing — add SSE route
│   ├── router.ts                      # existing — register new routers
│   ├── orchestrator/
│   │   ├── index.ts                   # NEW — main orchestrator service
│   │   ├── intent-classifier.ts       # NEW
│   │   ├── tool-selector.ts           # NEW
│   │   ├── workflow-engine.ts         # NEW — state machine
│   │   ├── context-propagator.ts      # NEW
│   │   └── llm-client.ts              # NEW — Ollama / OpenAI adapter
│   ├── modules/                       # NEW — every tool/agent lives here
│   │   ├── _registry.ts               # auto-discovery + manifest validation
│   │   ├── _types.ts                  # ModuleManifest, SkillSpec, AgentSpec
│   │   ├── zzp-netto-calculator/
│   │   │   ├── manifest.ts
│   │   │   ├── skill.ts
│   │   │   └── schema.ts
│   │   ├── mining-calculator/
│   │   ├── estate-calculator/
│   │   ├── vvc-calculator/
│   │   ├── tgc-chatbot/
│   │   ├── ecosysteem-chatbot/
│   │   ├── voice-verification/        # adapter to Python sidecar
│   │   └── ...
│   ├── memory/
│   │   ├── session-store.ts           # NEW — Redis or in-memory fallback
│   │   ├── persistent-store.ts        # NEW — Drizzle queries
│   │   └── semantic-store.ts          # NEW — pgvector (optional in MVP)
│   ├── adapters/
│   │   └── python-bridge.ts           # NEW — for sidecar Python services
│   └── routers/
│       ├── orchestrator-router.ts     # NEW
│       ├── module-router.ts           # NEW — list, invoke, describe
│       ├── session-router.ts          # NEW
│       └── memory-router.ts           # NEW
├── src/
│   ├── pages/
│   │   ├── Workspace.tsx              # rebuild as 3-mode shell
│   │   └── ...
│   ├── modules/                       # frontend module UIs (mirror api/modules)
│   │   ├── _registry.ts               # frontend plugin registry
│   │   ├── zzp-netto-calculator/
│   │   │   ├── Panel.tsx              # the calculator UI
│   │   │   ├── manifest.ts            # links to backend manifest
│   │   │   └── ContextCard.tsx        # how it appears in session timeline
│   │   └── ...
│   ├── components/
│   │   ├── orchestrator/
│   │   │   ├── ChatStream.tsx         # NEW — SSE-driven chat
│   │   │   ├── ToolPicker.tsx         # NEW
│   │   │   ├── WorkflowTimeline.tsx   # NEW
│   │   │   ├── ContextViewer.tsx      # NEW — see active memory
│   │   │   └── ModeSwitcher.tsx       # NEW — 3 modes
│   │   └── ui/                        # existing shadcn components
│   ├── stores/
│   │   ├── session-store.ts           # NEW — Zustand for client session mirror
│   │   └── module-store.ts            # NEW
│   └── hooks/
│       └── useOrchestrator.ts         # NEW
├── contracts/                         # existing — extend
│   ├── module-manifest.ts             # NEW — shared client/server type
│   └── session-context.ts             # NEW
├── db/
│   └── schema.ts                      # extend with: sessions, session_memory, module_runs, workflow_runs, tool_registry
└── python-services/                   # NEW — only when sidecar needed
    └── voice-verification/
        ├── main.py                    # FastAPI
        ├── requirements.txt
        └── Dockerfile
```

## 4.3 Module Manifest Contract

Every module — calculator, chatbot, tool — declares itself with this shape (`contracts/module-manifest.ts`):

```typescript
import { z } from "zod";

export const ModuleManifestSchema = z.object({
  id: z.string(),                    // "zzp-netto-calculator"
  name: z.string(),                  // "ZZP Netto Calculator"
  type: z.enum(["calculator", "chatbot", "tool", "visualization", "verification"]),
  version: z.string(),               // semver
  description: z.string(),
  tags: z.array(z.string()),
  
  // What the AI sees when deciding to call this
  capabilities: z.array(z.object({
    name: z.string(),                // "calculate-netto"
    description: z.string(),         // shown to LLM
    inputSchema: z.any(),            // Zod schema -> JSON schema for LLM
    outputSchema: z.any(),
  })),
  
  // What context this module needs/produces
  contextRequirements: z.array(z.string()).optional(),
  contextOutputs: z.array(z.string()).optional(),
  
  // Dependencies (other module ids)
  dependencies: z.array(z.string()).default([]),
  
  // Frontend
  ui: z.object({
    panel: z.string(),               // dynamic import path
    contextCard: z.string().optional(),
    icon: z.string(),                // lucide icon name
  }),
  
  // Permissions / auth
  requiresAuth: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
  
  // Runtime
  runtime: z.enum(["typescript", "python-sidecar"]).default("typescript"),
});

export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
```

## 4.4 Skill Contract (callable by AI)

```typescript
export interface Skill<TIn = unknown, TOut = unknown> {
  manifest: ModuleManifest;
  invoke(input: TIn, ctx: InvocationContext): Promise<SkillResult<TOut>>;
}

export interface InvocationContext {
  sessionId: string;
  userId: string;
  history: ContextSnapshot[];   // previous calls in this session
  abortSignal: AbortSignal;
  emit: (event: ProgressEvent) => void;  // for streaming
}

export interface SkillResult<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
  contextDelta: Partial<SessionContext>;  // what to merge into session memory
  trace: Array<{ step: string; ts: number; meta?: unknown }>;
}
```

## 4.5 Auto-Discovery

`api/modules/_registry.ts` scans `api/modules/*/manifest.ts` at boot, validates each, and registers callable handles. Adding a new tool = drop a folder + restart. No core code changes.

For the frontend, `src/modules/_registry.ts` does the same with dynamic imports for panels.

---

# 5. MEMORY ARCHITECTURE (THREE LAYERS)

## Layer 1 — Ephemeral Session Memory (HOT)

- **Where:** Redis. Fallback to in-process LRU map if Redis unavailable (for local dev).
- **TTL:** 6 hours rolling, refreshed on activity.
- **Stores:**
  - Active calculation results (last N=20 per session)
  - Chat turns within current session
  - Active workflow state machine state
  - Temporary variables (`$lastMiningProfit`, etc.)
  - Active module focus

**Schema:**

```typescript
type SessionContext = {
  sessionId: string;
  userId: string;
  mode: "chat-calculators" | "chat-projects" | "direct-tool";
  activeModuleId?: string;
  variables: Record<string, ContextValue>;
  history: ContextEntry[];              // append-only
  workflow?: WorkflowState;
  updatedAt: number;
};

type ContextEntry = {
  id: string;
  ts: number;
  source: "user" | "assistant" | "skill" | "system";
  moduleId?: string;
  kind: "input" | "output" | "message" | "decision";
  payload: unknown;
  refs?: string[];                      // links to other entries
};
```

## Layer 2 — Persistent Memory (WARM)

- **Where:** MySQL via Drizzle (matches existing setup; PG also fine if migrating).
- **Stores:** users, registered modules, saved workflows, audit log, user preferences, RBAC.

**New tables to add to `db/schema.ts`:**

```typescript
// sessions: long-lived metadata only, hot data in Redis
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  mode: varchar("mode", { length: 32 }).notNull(),
  metadata: json("metadata"),
});

export const moduleRuns = mysqlTable("module_runs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  moduleId: varchar("module_id", { length: 128 }).notNull(),
  capability: varchar("capability", { length: 128 }).notNull(),
  input: json("input"),
  output: json("output"),
  durationMs: int("duration_ms"),
  ok: boolean("ok").default(true),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowRuns = mysqlTable("workflow_runs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  steps: json("steps"),                // array of step descriptors
  status: varchar("status", { length: 32 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moduleRegistry = mysqlTable("module_registry", {
  id: varchar("id", { length: 128 }).primaryKey(),
  manifest: json("manifest").notNull(),
  enabled: boolean("enabled").default(true),
  installedAt: timestamp("installed_at").defaultNow(),
});
```

## Layer 3 — Semantic Memory (COLD, optional in MVP)

- **Where:** pgvector or Qdrant if you keep MySQL.
- **Stores:** embeddings of past calculations, summaries, knowledge chunks.
- **Used for:** "remind me what I calculated about Estate last month" type queries.
- **MVP scope:** scaffold the interface but make it pluggable; only implement if time permits.

---

# 6. ORCHESTRATOR DESIGN

The orchestrator is a **TypeScript service** in `api/orchestrator/` that uses the LLM's native function-calling.

## 6.1 Flow per chat turn

```
1. Client sends user message via tRPC mutation `orchestrator.send`.
2. Server opens an SSE stream: /api/orchestrator/stream/:turnId
3. Orchestrator builds the LLM prompt:
   - System: role + active mode + ecosystem manifest summary
   - Tools: JSON schema for every enabled module capability
   - Memory: last K context entries + summary if long
   - User: current message
4. LLM returns either:
   a) text answer → stream to client, save to context
   b) tool_call(s) → orchestrator invokes skill(s)
      - emits "tool.start" event over SSE
      - awaits result
      - emits "tool.end" with output
      - feeds result back into LLM
      - loops until LLM returns final answer
5. Save full turn to moduleRuns + session context.
```

## 6.2 LLM Client

Support multiple backends behind one interface:

```typescript
export interface LLMClient {
  stream(req: ChatRequest): AsyncIterable<ChatChunk>;
}
```

**MVP must include:**
- OpenAI-compatible adapter (works with OpenAI, Groq, Together, OpenRouter)
- Ollama adapter (local models)
- Selection per-environment via `LLM_PROVIDER` env var

**Function calling:** use OpenAI tool-calling format as canonical; translate for Ollama where needed.

## 6.3 Multi-tool chaining

The orchestrator must support a single user turn invoking multiple tools sequentially with shared state. Use the LLM's parallel tool-calling capability and a simple in-memory blackboard for the turn.

## 6.4 Failure handling

- Tool error → orchestrator catches, emits `tool.error`, gives LLM a structured error message, lets LLM decide to retry/fallback/explain.
- LLM error → exponential backoff up to 3 retries, then user-facing error.
- All errors logged to `moduleRuns.error` with full trace.

---

# 7. SECURITY (PRODUCTION-GRADE)

| Concern | Implementation |
|---|---|
| Auth | Existing JWT via `jose` + cookie; keep |
| RBAC | Add `users.role` already in schema; add `permissions` table; each module checks `manifest.permissions` |
| Session isolation | Session keys are scoped `session:{userId}:{sessionId}` — never share Redis keys |
| Tool input validation | Every skill MUST `parse()` input with its Zod schema before execution |
| Output sanitization | LLM-generated content escaped before render; never `dangerouslySetInnerHTML` |
| Plugin execution | Skills run in same process; **never `eval`**; Python sidecars run in separate Docker containers |
| Rate limiting | Per-user limit on `orchestrator.send` (e.g. 60/min) using Redis token bucket |
| Secrets | All keys via env vars; never commit; provide `.env.example` |
| Audit trail | Every tool call writes to `moduleRuns`; LLM decisions write to `workflowRuns.steps` |
| CSRF | Cookie SameSite=Lax, double-submit token on state-changing endpoints |

---

# 8. FRONTEND — WORKSPACE EXPERIENCE

## 8.1 Layout (`src/pages/Workspace.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP: Mode Switcher [Calculators | Projects | Direct] + Session│
├──────────────┬─────────────────────────┬────────────────────────┤
│              │                         │                        │
│  LEFT        │   CENTER                │  RIGHT                 │
│  Module      │   Active panel:         │  Workflow Timeline     │
│  Browser     │   - Chat (mode 1/2)     │  + Context Viewer      │
│  (filtered   │   - Module UI (mode 3)  │  + Active Variables    │
│   by mode)   │                         │                        │
│              │                         │                        │
└──────────────┴─────────────────────────┴────────────────────────┘
```

## 8.2 Critical UX rules

- Switching modes never clears context — only changes which surface is active.
- Every tool result appears as a **Context Card** in the timeline; clicking it re-injects that result into the next chat turn.
- The chat **always shows which tool the AI is invoking** with a live progress badge.
- Multi-step workflows render as a vertical state machine (use `react-flow` or a simple custom component).
- All long operations are streamed via SSE — no spinners on chat.

## 8.3 Component recipes

```tsx
// src/components/orchestrator/ChatStream.tsx
function ChatStream() {
  const { messages, send, isStreaming, activeTools } = useOrchestrator();
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      {activeTools.length > 0 && <ToolBadges tools={activeTools} />}
      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}

// src/hooks/useOrchestrator.ts
function useOrchestrator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTools, setActiveTools] = useState<ToolInvocation[]>([]);
  
  const send = async (text: string) => {
    const turnId = nanoid();
    setMessages(m => [...m, { role: "user", text }]);
    
    const es = new EventSource(`/api/orchestrator/stream/${turnId}`);
    es.addEventListener("token", (e) => { /* append to last assistant msg */ });
    es.addEventListener("tool.start", (e) => { /* push to activeTools */ });
    es.addEventListener("tool.end", (e) => { /* pop, write context card */ });
    es.addEventListener("done", () => es.close());
    
    await trpc.orchestrator.send.mutate({ turnId, text });
  };
  
  return { messages, send, activeTools, isStreaming: activeTools.length > 0 };
}
```

---

# 9. EXAMPLE END-TO-END FLOWS (must all work in MVP)

### Flow A — Calc → Chat continuity
1. Mode 3, open ZZP Netto Calculator, run with €120k revenue → see net €82k.
2. Switch Mode 1, type: *"Hoeveel zou ik netto overhouden bij 30% meer omzet?"*
3. AI invokes calculator with €156k → returns delta + percentage.
4. Timeline shows two Context Cards.

### Flow B — Multi-tool chain
1. Mode 1, type: *"Vergelijk Mining maandwinst met ZZP netto bij gelijk jaarinkomen, en vat samen via de Ecosysteem Chatbot."*
2. AI invokes Mining Calculator → ZZP Calculator → Ecosysteem Chatbot, each output flowing into the next.
3. Final answer references all three with citations.

### Flow C — Project chat
1. Mode 2, *"Welke taken in Takenblok hebben deadline deze week en welke kan ik combineren?"*
2. AI queries Takenblok module → reasons → returns grouped suggestions.
3. User: *"Markeer de eerste twee als prioriteit."* — AI invokes Takenblok mutation skill.

### Flow D — New module added
1. Drop new folder `api/modules/btw-prognose/` with valid manifest.
2. Restart server.
3. Module appears in Module Browser, becomes callable by AI immediately. **No core code changes.**

---

# 10. DELIVERY PLAN — 4 PHASES

You will deliver in **explicit phases**, each ending with a working commit.

## Phase 1 — Foundation (must-have for MVP)

- [ ] Module manifest contract + registry (auto-discovery)
- [ ] Session memory: Redis adapter + in-memory fallback
- [ ] DB schema migrations (`sessions`, `module_runs`, `workflow_runs`, `module_registry`)
- [ ] Orchestrator core (LLM client, tool selector, single-step tool calling)
- [ ] SSE streaming endpoint
- [ ] Workspace page shell with 3-mode switcher
- [ ] Port **3 modules** end-to-end: ZZP Netto Calculator, TGC Chatbot, Organogram (codes already provided)
- [ ] Frontend: ChatStream, ToolPicker, WorkflowTimeline, ContextViewer

**Done = Flow A works end-to-end.**

## Phase 2 — Cross-tool intelligence

- [ ] Multi-step workflow engine
- [ ] Context propagation between tool calls
- [ ] Variable references in chat (`@miningResult.profit`)
- [ ] Workflow Timeline interactive (re-run, branch)
- [ ] Port **3 more modules**: VVC Calculator, Mining Calculator, Estate Calculator
- [ ] Multi-tool chaining

**Done = Flow B works.**

## Phase 3 — Project agents

- [ ] Port **3 chatbot agents**: Hellings, Loep Services, VVC Chatbot, Ecosysteem Chatbot
- [ ] Port **Takenblok** as both UI and skill
- [ ] Mode 2 (Chat with projects) fully wired

**Done = Flow C works.**

## Phase 4 — Production polish

- [ ] Voice Verification via Python sidecar (Docker)
- [ ] Rate limiting (Redis token bucket)
- [ ] Audit log viewer (admin page)
- [ ] Docker Compose for full stack (app + redis + mysql + python-services)
- [ ] Observability: structured logs (pino), basic metrics endpoint
- [ ] README with setup, env vars, deployment

**Done = Flow D works + ready to deploy.**

---

# 11. NON-NEGOTIABLE QUALITY BAR

- **TypeScript strict mode**, no `any` outside narrow adapter boundaries.
- **Every public API** validated with Zod.
- **Every error path** has a defined code + user-safe message.
- **No new dependencies** without justification (already-installed packages first).
- **All UI** uses existing shadcn-style components in `src/components/ui/`. Match the neon/dark aesthetic of `Login.tsx`.
- **No mock data** in committed code paths — always real plumbing, even if behind a feature flag.
- **Tests** with vitest for: orchestrator routing logic, manifest validation, at least one skill end-to-end.

---

# 12. ENVIRONMENT VARIABLES (extend `.env.example`)

```env
# Existing
APP_ID=
APP_SECRET=
DATABASE_URL=

# New — LLM
LLM_PROVIDER=openai          # openai | ollama
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=
LLM_BASE_URL=                # optional override
OLLAMA_HOST=http://localhost:11434

# New — Memory
REDIS_URL=redis://localhost:6379
SESSION_TTL_HOURS=6

# New — Python sidecar (Phase 4)
PYTHON_BRIDGE_URL=http://localhost:8001
```

---

# 13. WHAT TO RETURN TO THE USER

Deliver in this order, one phase per response cycle:

1. **Architecture confirmation** — restate the plan, flag any deviation, confirm Hono+TS over Python.
2. **Phase 1 implementation** — every file, working end-to-end. Commit-ready.
3. **Demo proof** — exact commands to run + expected outputs for Flow A.
4. **Phase 2, 3, 4** — same pattern.

Use the `edit` and `write_to_file` tools. Do **not** dump giant code blocks in chat — write the actual files.

After each phase, run `npm run check` (tsc) and confirm clean.

---

# 14. CONSTRAINTS

- **Do not** rebuild the auth system; demo login at `demo@evai.nl` / `demo123` already works.
- **Do not** introduce a Python backend unless objectively needed for Voice Verification (Phase 4).
- **Do not** drop existing Drizzle schema — extend it.
- **Do not** introduce a new state library if Zustand fits.
- **Do** keep the visual language consistent with `src/pages/Login.tsx` (neon, dark, futuristic).
- **Do** assume the user will run on Windows + Node 20+ + Docker Desktop.

---

# 15. APPENDICES — EXISTING TOOL CODE

The user has supplied full working source for **4 tools** below. Port these as-is into `src/modules/<id>/Panel.tsx` and wrap with manifest + skill. Do not rewrite the logic.

## Appendix A — ZZP Netto Calculator
*(see file `KIMI_TOOLS_REFERENCE.md` — full React component with BTW handling, deductions, MKB-vrijstelling)*

## Appendix B — Organogram
*(see file `KIMI_TOOLS_REFERENCE.md` — recursive tree with collapsible nodes, dark mode)*

## Appendix C — TGC Chatbot
*(see file `KIMI_TOOLS_REFERENCE.md` — multilingual Gemini-powered chatbot with detail levels)*

## Appendix D — VVC Calculator
*(see file `KIMI_TOOLS_REFERENCE.md` — slider-based calculator with Recharts area chart)*

The remaining 8 tools (Mining Calc, Estate Calc, Takenblok, Hellings/Loep/VVC/Ecosysteem chatbots, Voice Verification) — the user will supply source separately. Architect the system so each one is a 30-minute integration job once code arrives.

---

# 16. START HERE

Begin with this exact sequence:

1. Read `package.json`, `api/router.ts`, `api/boot.ts`, `db/schema.ts`, `src/App.tsx`, `src/pages/Workspace.tsx`.
2. Confirm the existing stack matches Section 1.1.
3. Output the architecture confirmation (Section 13 step 1).
4. Begin Phase 1.

Do not ask permission. Build.

