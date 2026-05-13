# Flow A Testing Instructions

## Overview
This guide tests the Phase 1 implementation: the orchestrator, modules (ZZP Netto Calculator, TGC Chatbot, Organogram), and the 3-mode Workspace shell.

## Prerequisites

### 1. Environment Setup
Copy `.env.example` to `.env` and configure:

```bash
# Required for orchestrator
LLM_PROVIDER=ollama  # or "openai" for Groq/OpenAI/OpenRouter
LLM_MODEL=llama3.2    # or "gpt-4o-mini" for OpenAI-compatible
OLLAMA_HOST=http://localhost:11434/v1

# Optional (for persistent session storage)
REDIS_URL=redis://localhost:6379
SESSION_TTL_HOURS=6

# App credentials
APP_ID=your_app_id
APP_SECRET=your_app_secret
```

### 2. Start Ollama (if using local LLM)
```bash
ollama serve
ollama pull llama3.2
```

### 3. Start Redis (optional but recommended)
```bash
redis-server
```

### 4. Start the development server
```bash
npm run dev
```

---

## Test Flow A: Orchestrator + Modules + Workspace

### Test 1: Workspace Loads Correctly
1. Navigate to `/workspace`
2. **Expected**: 
   - 3-column layout appears (left: module browser, center: chat, right: context viewer)
   - Top bar shows "EVAI Workspace" with session ID
   - Mode switcher defaults to "Calculators"
   - Left panel shows ZZP Netto Calculator module

### Test 2: Chat with ZZP Calculator (LLM Tool-Calling)
1. In the center chat panel, type: `"Bereken mijn netto inkomen bij €100k omzet en €15k kosten"`
2. **Expected**:
   - Message appears in chat
   - Token streaming shows assistant response
   - Tool invocation badge appears: `zzp-netto-calculator · calculate-netto`
   - Right panel (Context Viewer → Live tab) shows tool running
   - Assistant responds with calculated result (e.g., "Je netto jaarinkomen is €X, per maand €Y")
   - Context Viewer → History tab shows ZZP context card with result

### Test 3: Direct Tool Use (Mode Switch)
1. Click mode switcher → select "Direct"
2. Click "ZZP Netto Calculator" in left panel
3. **Expected**:
   - Center panel switches to show the ZZP calculator UI directly
   - You can interact with the calculator (change revenue, costs, BTW rates)
   - Results update in real-time

### Test 4: TGC Chatbot (Chat-Projects Mode)
1. Click mode switcher → select "Projects"
2. In chat, type: `"Wat is Time Gap Cash Flow?"`
3. **Expected**:
   - Tool invocation: `tgc-chatbot · ask`
   - Assistant responds with TGC explanation in Dutch
   - Context card shows in History tab

### Test 5: Organogram Query
1. In Projects mode, type: `"Wie is de CEO in het organogram?"`
2. **Expected**:
   - Tool invocation: `organogram · query-role`
   - Assistant responds with CEO info and hierarchy path
   - Context card shows role details

### Test 6: Context Persistence
1. Send multiple messages across different tools
2. Click "Vars" tab in Context Viewer
3. **Expected**:
   - Variables like `lastZzpNetto`, `lastTgcAnswer` appear
   - Values are properly formatted

### Test 7: Session Reset
1. Switch modes multiple times
2. Send messages
3. Refresh the page
4. **Expected**:
   - New session is created (different session ID)
   - Chat history is empty (no persistence across sessions unless Redis is configured)

---

## Verification Checklist

- [ ] Workspace 3-column layout renders correctly
- [ ] Mode switcher toggles between Calculators / Projects / Direct
- [ ] Module browser filters modules by mode
- [ ] Chat streaming works (tokens appear incrementally)
- [ ] Tool invocations appear as badges in chat
- [ ] Context Viewer shows live tool calls in "Live" tab
- [ ] Context Viewer shows history in "History" tab with context cards
- [ ] Context Viewer shows variables in "Vars" tab
- [ ] Direct tool mode loads module panels correctly
- [ ] TypeScript compilation passes (`npx tsc -b --noEmit`)
- [ ] No console errors in browser dev tools

---

## Troubleshooting

### Issue: "No active session" message
- **Cause**: Session creation failed
- **Fix**: Check browser console for tRPC errors, verify `APP_ID` and `APP_SECRET` are set

### Issue: Tool calls fail with "LLM_ERROR"
- **Cause**: LLM provider not configured or not reachable
- **Fix**: 
  - If using Ollama: run `ollama serve` and verify `OLLAMA_HOST`
  - If using OpenAI: verify `LLM_API_KEY` and `LLM_BASE_URL`

### Issue: "Module not found" errors
- **Cause**: Module registry not loading
- **Fix**: Check server console for `[registry] Registered module:` logs

### Issue: SSE stream not receiving events
- **Cause**: CORS or authentication issue
- **Fix**: Verify cookie is set, check `/api/orchestrator/stream` endpoint responds

---

## Next Steps (Phase 2+)

After verifying Flow A works:
1. Add Redis for persistent session storage
2. Add more modules (Voice Verification, Document Processor, etc.)
3. Implement Python sidecar for specialized tools
4. Add pgvector for semantic search over history
