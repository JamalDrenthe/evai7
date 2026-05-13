import { useState, useCallback, useRef } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
  toolCalls?: ToolInvocation[];
};

export type ToolInvocation = {
  callId: string;
  moduleId: string;
  capability: string;
  status: "running" | "ok" | "error";
  input?: unknown;
  output?: unknown;
  error?: string;
  durationMs?: number;
  startedAt: number;
  endedAt?: number;
};

export type OrchestratorState = {
  messages: ChatMessage[];
  toolInvocations: ToolInvocation[];
  isStreaming: boolean;
  error: string | null;
};

const initialState: OrchestratorState = {
  messages: [],
  toolInvocations: [],
  isStreaming: false,
  error: null,
};

export function useOrchestrator(sessionId: string | null) {
  const [state, setState] = useState<OrchestratorState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(initialState);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((s) => ({ ...s, isStreaming: false }));
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!sessionId) {
        setState((s) => ({ ...s, error: "Geen actieve sessie" }));
        return;
      }
      if (!text.trim()) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assist-${Date.now()}`;

      setState((s) => ({
        ...s,
        isStreaming: true,
        error: null,
        messages: [
          ...s.messages,
          { id: userMsgId, role: "user", text, ts: Date.now() },
          { id: assistantMsgId, role: "assistant", text: "", ts: Date.now() },
        ],
      }));

      try {
        const resp = await fetch("/api/orchestrator/stream", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: text }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          const body = await resp.text().catch(() => "");
          throw new Error(`HTTP ${resp.status}: ${body.slice(0, 200)}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const block of events) {
            const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const data = dataLine.slice(5).trim();
            if (!data) continue;
            try {
              const event = JSON.parse(data);
              handleEvent(event, assistantMsgId, setState);
            } catch {
              /* ignore malformed */
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // stopped intentionally
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          setState((s) => ({ ...s, error: msg }));
        }
      } finally {
        setState((s) => ({ ...s, isStreaming: false }));
        abortRef.current = null;
      }
    },
    [sessionId],
  );

  return { ...state, send, stop, reset };
}

type Event =
  | { type: "session.started"; sessionId: string }
  | { type: "user.message"; sessionId: string; text: string; entryId: string }
  | { type: "token"; text: string }
  | { type: "tool.start"; moduleId: string; capability: string; input: unknown; callId: string }
  | { type: "tool.end"; moduleId: string; capability: string; callId: string; ok: boolean; output?: unknown; error?: string; durationMs: number }
  | { type: "assistant.message"; entryId: string; text: string }
  | { type: "context.updated"; sessionId: string }
  | { type: "done"; reason: string; error?: string };

function handleEvent(
  event: Event,
  assistantMsgId: string,
  setState: React.Dispatch<React.SetStateAction<OrchestratorState>>,
) {
  switch (event.type) {
    case "token":
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === assistantMsgId ? { ...m, text: m.text + event.text } : m,
        ),
      }));
      break;
    case "tool.start": {
      const inv: ToolInvocation = {
        callId: event.callId,
        moduleId: event.moduleId,
        capability: event.capability,
        status: "running",
        input: event.input,
        startedAt: Date.now(),
      };
      setState((s) => ({
        ...s,
        toolInvocations: [...s.toolInvocations, inv],
        messages: s.messages.map((m) =>
          m.id === assistantMsgId
            ? { ...m, toolCalls: [...(m.toolCalls ?? []), inv] }
            : m,
        ),
      }));
      break;
    }
    case "tool.end": {
      setState((s) => ({
        ...s,
        toolInvocations: s.toolInvocations.map((t) =>
          t.callId === event.callId
            ? {
                ...t,
                status: event.ok ? "ok" : "error",
                output: event.output,
                error: event.error,
                durationMs: event.durationMs,
                endedAt: Date.now(),
              }
            : t,
        ),
        messages: s.messages.map((m) =>
          m.id === assistantMsgId && m.toolCalls
            ? {
                ...m,
                toolCalls: m.toolCalls.map((t) =>
                  t.callId === event.callId
                    ? {
                        ...t,
                        status: event.ok ? "ok" : "error",
                        output: event.output,
                        error: event.error,
                        durationMs: event.durationMs,
                        endedAt: Date.now(),
                      }
                    : t,
                ),
              }
            : m,
        ),
      }));
      break;
    }
    case "done":
      if (event.error) {
        setState((s) => ({ ...s, error: event.error ?? null }));
      }
      break;
    default:
      break;
  }
}
