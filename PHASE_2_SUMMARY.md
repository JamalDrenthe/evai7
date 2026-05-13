# Phase 2 Summary — Cross-tool Intelligence

## Completed Features

### 1. Multi-step Workflow Engine ✅
- **File**: `api/orchestrator/index.ts`
- **Features**:
  - Workflow state tracking with unique workflow IDs
  - Step-by-step execution tracking with status (pending, running, done, error)
  - Workflow events: `workflow.started`, `workflow.step.completed`, `workflow.completed`
  - Steps capture: moduleId, capability, input, output, error, timestamps
  - Workflows persisted in session context

### 2. Context Propagation Between Tool Calls ✅
- **File**: `api/orchestrator/index.ts` (existing capability enhanced)
- **Features**:
  - Skills can return `contextDelta` with variables and history entries
  - Session context updates after each tool execution
  - Variables flow between sequential tool calls
  - History entries create audit trail for each tool result

### 3. Variable Reference Parser (@variable syntax) ✅
- **File**: `api/orchestrator/index.ts` (new `resolveVariableReferences` method)
- **Features**:
  - Parses `@variableName` syntax in user messages
  - Supports nested properties: `@variableName.property`
  - Formats numbers with Dutch locale
  - Resolves variables from session context before LLM call
  - Example: "Vergelijk @lastVvcEarnings.yearEndMonthlyIncome met 30% meer"

### 4. VVC Calculator Module ✅
- **Backend**: `api/modules/vvc-calculator/` (schema, skill, manifest)
- **Frontend**: `src/modules/vvc-calculator/` (Panel, ContextCard, manifest)
- **Features**:
  - Two sliders: hours/week (0–40), placements/month (0–100)
  - Recharts AreaChart with stacked data (Uurloon, Bonussen, Passief)
  - Yellow accent (#EAB308) on dark slate theme
  - Calculates monthly base salary, bonuses, passive income
  - Projects 12-month trajectory with compound passive income
  - Registered in both backend and frontend registries

### 5. Mining Calculator Placeholder ✅
- **Backend**: `api/modules/mining-calculator/` (schema, skill, manifest)
- **Frontend**: `src/modules/mining-calculator/` (Panel, ContextCard, manifest)
- **Status**: Placeholder awaiting source code from user
- **Registered**: Both backend and frontend registries

### 6. Estate Calculator Placeholder ✅
- **Backend**: `api/modules/estate-calculator/` (schema, skill, manifest)
- **Frontend**: `src/modules/estate-calculator/` (Panel, ContextCard, manifest)
- **Status**: Placeholder awaiting source code from user
- **Registered**: Both backend and frontend registries

### 7. TypeScript Compilation ✅
- **Status**: All errors resolved
- **Command**: `npx tsc -b --noEmit` passes with exit code 0
- **Fixes**:
  - Workflow step type matching (added optional input/output/error fields)
  - Proper union type assertions for status fields
  - All module manifests registered correctly

## Pending Tasks (Lower Priority)

### Workflow Timeline Interactive (re-run, branch)
- **Status**: Not implemented
- **Priority**: Medium
- **Description**: Add interactive features to ContextViewer workflow timeline:
  - Re-run specific workflow steps
  - Branch from a specific step
  - Visual workflow state machine diagram
- **Impact**: Nice-to-have for debugging and workflow exploration

## Module Registry Status

### Total Modules: 6
1. **ZZP Netto Calculator** ✅ (Phase 1)
2. **TGC Chatbot** ✅ (Phase 1)
3. **Organogram** ✅ (Phase 1)
4. **VVC Calculator** ✅ (Phase 2)
5. **Mining Calculator** ⏸️ (Phase 2 - placeholder)
6. **Estate Calculator** ⏸️ (Phase 2 - placeholder)

### Modules Awaiting Source Code
- Mining Calculator
- Estate Calculator

**Note**: These placeholders are ready for integration. When source code is provided:
1. Replace schema.ts with actual Zod schemas
2. Replace skill.ts calculation logic
3. Replace Panel.tsx with full UI component
4. No registry changes needed (auto-discovery)

## Testing Status

### Flow A (Phase 1) — Ready to Test
- Single tool invocation via chat
- Direct tool use in mode 3
- Context persistence across modes

### Flow B (Phase 2) — Ready to Test
- Multi-tool chaining (orchestrator supports sequential tool calls)
- Variable references in chat (`@variableName`)
- Context propagation between tools

**To test Flow B**:
1. Configure `.env` with LLM credentials
2. Run dev server: `npm run dev`
3. Navigate to `/workspace`
4. In Mode 1, ask: "Bereken VVC bij 20 uur/week en 10 plaatsingen/maand"
5. Then: "Wat als ik 30% meer zou plaatsen?"
6. Then: "@lastVvcEarnings.totalYearEarnings gedeeld door 12"

## Next Steps (Phase 3)

Per the Master Prompt, Phase 3 focuses on **Project Agents**:

- Port 3 chatbot agents: Hellings, Loep Services, VVC Chatbot, Ecosysteem Chatbot
- Port Takenblok as both UI and skill
- Wire Mode 2 (Chat with projects) fully

**Prerequisites for Phase 3**:
- Source code for chatbots from user
- Source code for Takenblok from user

## Architecture Notes

### Variable Reference Resolution
The variable reference parser runs **before** the LLM call. This means:
- User types: "Vergelijk @lastVvcEarnings.yearEndMonthlyIncome met 30% meer"
- Parser resolves: "Vergelijk €4,500 met 30% meer"
- LLM receives the resolved text
- LLM can then invoke tools with the actual values

### Workflow State Persistence
Workflows are stored in the session context's `workflows` array. Each workflow contains:
- Unique ID
- Status (running, done, error)
- Array of steps with full execution details
- Start and end timestamps

This enables:
- Audit trail of multi-step workflows
- Potential future features: workflow replay, branching, analysis

### Module Auto-Discovery
Both backend and frontend registries use auto-discovery:
- Backend: Scans `api/modules/*/skill.ts` at boot
- Frontend: Scans `src/modules/*/manifest.ts` at boot
- Adding a new module = drop folder + restart
- No core code changes required

## Files Modified/Created in Phase 2

### Modified
- `api/orchestrator/index.ts` — workflow tracking, variable parser
- `api/modules/_registry.ts` — registered VVC, Mining, Estate
- `src/modules/_registry.ts` — registered VVC, Mining, Estate
- `db/schema.ts` — added sessions, moduleRuns, workflowRuns, moduleRegistry tables

### Created
- `api/modules/vvc-calculator/schema.ts`
- `api/modules/vvc-calculator/skill.ts`
- `api/modules/vvc-calculator/manifest.ts`
- `src/modules/vvc-calculator/Panel.tsx`
- `src/modules/vvc-calculator/ContextCard.tsx`
- `src/modules/vvc-calculator/manifest.ts`
- `api/modules/mining-calculator/` (all files)
- `src/modules/mining-calculator/` (all files)
- `api/modules/estate-calculator/` (all files)
- `src/modules/estate-calculator/` (all files)
