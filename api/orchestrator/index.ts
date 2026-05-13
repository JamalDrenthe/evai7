import { nanoid } from "nanoid";
import type {
  ChatMessage,
  ToolDefinition,
  ToolCall,
  LLMClient,
} from "../../contracts/llm";
import type {
  ContextEntry,
  SessionContext,
} from "../../contracts/session-context";
import type { InteractionMode } from "../../contracts/module-manifest";
import type { ProgressEvent } from "../../contracts/skill";
import { getModuleRegistry } from "../modules/_registry";
import { getSessionStore } from "../memory/session-store";
import { getLLMClient } from "./llm-client";

export type OrchestratorEvent =
  | { type: "session.started"; sessionId: string }
  | { type: "user.message"; sessionId: string; text: string; entryId: string }
  | { type: "token"; text: string }
  | { type: "tool.start"; moduleId: string; capability: string; input: unknown; callId: string }
  | { type: "tool.end"; moduleId: string; capability: string; callId: string; ok: boolean; output?: unknown; error?: string; durationMs: number }
  | { type: "assistant.message"; entryId: string; text: string }
  | { type: "context.updated"; sessionId: string }
  | { type: "workflow.started"; workflowId: string }
  | { type: "workflow.step.completed"; workflowId: string; stepId: string }
  | { type: "workflow.completed"; workflowId: string }
  | { type: "done"; reason: "stop" | "tool_calls" | "length" | "error"; error?: string };

const MODE_TO_TYPES: Record<InteractionMode, Array<"calculator" | "chatbot" | "tool" | "visualization" | "verification">> = {
  "chat-calculators": ["calculator"],
  "chat-projects": ["chatbot", "tool", "visualization", "verification"],
  "direct-tool": ["calculator", "chatbot", "tool", "visualization", "verification"],
};

const SYSTEM_PROMPTS: Record<InteractionMode, string> = {
  "chat-calculators":
    "Je bent EVAI, een AI assistent gespecialiseerd in calculators. Je hebt toegang tot rekentools (ZZP Netto, etc). Roep de juiste tool aan op basis van de vraag. Antwoord ALTIJD in het Nederlands.",
  "chat-projects":
    "Je bent EVAI, een AI assistent. Je hebt toegang tot project-tools en chatbots (TGC, Organogram, etc). Roep de juiste tool aan op basis van de vraag. Antwoord ALTIJD in het Nederlands.",
  "direct-tool":
    "Je bent EVAI, een AI assistent. Je hebt toegang tot alle tools, calculators en chatbots. Antwoord ALTIJD in het Nederlands.",
};

export class Orchestrator {
  private llm: LLMClient;
  private maxToolIterations = 5;

  constructor(llm?: LLMClient) {
    this.llm = llm ?? getLLMClient();
  }

  async *handleTurn(opts: {
    sessionId: string;
    userId: string;
    userMessage: string;
    abortSignal: AbortSignal;
  }): AsyncIterable<OrchestratorEvent> {
    const { sessionId, userId, userMessage, abortSignal } = opts;
    const store = getSessionStore();

    let session = await store.get(sessionId);
    if (!session) {
      yield { type: "done", reason: "error", error: "Session not found" };
      return;
    }

    const userEntry: ContextEntry = {
      id: nanoid(),
      ts: Date.now(),
      source: "user",
      kind: "message",
      payload: { text: userMessage },
      refs: [],
      summary: userMessage.slice(0, 80),
    };
    await store.appendEntry(sessionId, userEntry);
    yield { type: "user.message", sessionId, text: userMessage, entryId: userEntry.id };

    session = await store.get(sessionId);
    if (!session) return;

    const tools = this.buildToolDefinitions(session.mode);
    const messages = this.buildMessages(session, userMessage);

    // Create workflow state for multi-step tracking
    const workflowId = nanoid();
    const workflow = {
      id: workflowId,
      status: "running" as const,
      steps: [] as Array<{ id: string; moduleId: string; capability: string; status: "done" | "error" | "pending" | "running"; input?: unknown; output?: unknown; error?: string; startedAt?: number; endedAt?: number }>,
      startedAt: Date.now(),
    };
    await store.update(sessionId, { workflows: [...session.workflows, workflow] });
    yield { type: "workflow.started", workflowId };

    let assistantText = "";
    let assistantEntryId: string | null = null;
    let iterations = 0;

    while (iterations < this.maxToolIterations) {
      iterations += 1;
      const toolCalls: ToolCall[] = [];
      let finishReason: "stop" | "tool_calls" | "length" | "error" = "stop";
      let chunkText = "";

      for await (const chunk of this.llm.stream({
        messages,
        tools: tools.length > 0 ? tools : undefined,
        temperature: 0.4,
        abortSignal,
      })) {
        if (chunk.type === "token") {
          chunkText += chunk.text;
          yield { type: "token", text: chunk.text };
        } else if (chunk.type === "tool_call") {
          toolCalls.push(chunk.toolCall);
        } else if (chunk.type === "finish") {
          finishReason = chunk.reason;
          if (chunk.error) {
            yield { type: "done", reason: "error", error: chunk.error };
            return;
          }
        }
      }

      assistantText += chunkText;

      if (toolCalls.length === 0 || finishReason !== "tool_calls") {
        if (assistantText.trim()) {
          assistantEntryId = nanoid();
          const entry: ContextEntry = {
            id: assistantEntryId,
            ts: Date.now(),
            source: "assistant",
            kind: "message",
            payload: { text: assistantText },
            refs: [],
            summary: assistantText.slice(0, 80),
          };
          await store.appendEntry(sessionId, entry);
          yield { type: "assistant.message", entryId: assistantEntryId, text: assistantText };
        }

        // Complete workflow
        session = await store.get(sessionId);
        if (session) {
          const updatedWorkflows = session.workflows.map((w) =>
            w.id === workflowId ? { ...w, status: "done" as const, endedAt: Date.now() } : w
          );
          await store.update(sessionId, { workflows: updatedWorkflows });
        }
        yield { type: "workflow.completed", workflowId };
        yield { type: "done", reason: finishReason };
        return;
      }

      messages.push({
        role: "assistant",
        content: chunkText,
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        const callId = call.id;
        const stepId = nanoid();
        const moduleId = call.function.name.split("__")[0] ?? "unknown";
        const capability = call.function.name.split("__")[1] ?? "unknown";

        // Add step to workflow
        session = await store.get(sessionId);
        if (session) {
          const step = { id: stepId, moduleId, capability, status: "running" as const, startedAt: Date.now(), input: this.safeParse(call.function.arguments) };
          const updatedWorkflows = session.workflows.map((w) =>
            w.id === workflowId ? { ...w, steps: [...w.steps, step] } : w
          );
          await store.update(sessionId, { workflows: updatedWorkflows });
        }

        yield {
          type: "tool.start",
          moduleId,
          capability,
          input: this.safeParse(call.function.arguments),
          callId,
        };

        const result = await this.executeToolCall({
          call,
          sessionId,
          userId,
          abortSignal,
        });

        // Update step status
        session = await store.get(sessionId);
        if (session) {
          const updatedWorkflows = session.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  steps: w.steps.map((s) =>
                    s.id === stepId
                      ? { 
                          ...s, 
                          status: (result.ok ? "done" : "error") as "done" | "error", 
                          endedAt: Date.now(),
                          output: result.ok ? result.output : undefined,
                          error: result.ok ? undefined : result.error,
                        }
                      : s
                  ),
                }
              : w
          );
          await store.update(sessionId, { workflows: updatedWorkflows });
        }
        yield { type: "workflow.step.completed", workflowId, stepId };

        yield {
          type: "tool.end",
          moduleId: result.moduleId,
          capability: result.capability,
          callId,
          ok: result.ok,
          output: result.output,
          error: result.error,
          durationMs: result.durationMs,
        };

        messages.push({
          role: "tool",
          tool_call_id: callId,
          content: JSON.stringify(
            result.ok
              ? { ok: true, data: result.output }
              : { ok: false, error: result.error },
          ),
        });
      }

      yield { type: "context.updated", sessionId };
    }

    yield { type: "done", reason: "length", error: "Max tool iterations exceeded" };
  }

  private buildToolDefinitions(mode: InteractionMode): ToolDefinition[] {
    const registry = getModuleRegistry();
    const allowedTypes = MODE_TO_TYPES[mode];
    const modules = registry.list().filter((m) => allowedTypes.includes(m.type));

    const tools: ToolDefinition[] = [];
    for (const m of modules) {
      for (const cap of m.capabilities) {
        tools.push({
          type: "function",
          function: {
            name: `${m.id}__${cap.name}`,
            description: `[${m.name}] ${cap.description}`,
            parameters: (cap.inputSchema as Record<string, unknown>) ?? {
              type: "object",
              properties: {},
            },
          },
        });
      }
    }
    return tools;
  }

  private buildMessages(session: SessionContext, userMessage: string): ChatMessage[] {
    const systemPrompt = SYSTEM_PROMPTS[session.mode];
    const recentContext = this.summarizeContext(session);

    // Resolve variable references (@variableName)
    const resolvedMessage = this.resolveVariableReferences(userMessage, session);

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt + (recentContext ? `\n\nActieve sessie context:\n${recentContext}` : "") },
    ];

    const recentEntries = session.history.slice(-12);
    for (const e of recentEntries) {
      if (e.kind !== "message") continue;
      if (e.source === "user") {
        messages.push({ role: "user", content: (e.payload as { text: string }).text });
      } else if (e.source === "assistant") {
        messages.push({ role: "assistant", content: (e.payload as { text: string }).text });
      }
    }

    messages.push({ role: "user", content: resolvedMessage });
    return messages;
  }

  private resolveVariableReferences(text: string, session: SessionContext): string {
    // Match @variableName or @variableName.property syntax
    return text.replace(/@(\w+(?:\.\w+)?)/g, (match, path) => {
      const parts = path.split(".");
      const varName = parts[0];
      const prop = parts[1];

      const variable = session.variables[varName];
      if (!variable) {
        return match; // Keep original if variable not found
      }

      let value = variable.value;
      if (prop && typeof value === "object" && value !== null) {
        value = (value as Record<string, unknown>)[prop];
      }

      if (value === undefined || value === null) {
        return match;
      }

      // Format the value
      if (typeof value === "number") {
        return value.toLocaleString("nl-NL");
      }
      return String(value);
    });
  }

  private summarizeContext(session: SessionContext): string {
    const parts: string[] = [];
    const vars = Object.values(session.variables).slice(-8);
    if (vars.length > 0) {
      parts.push(
        "Recente variabelen:\n" +
          vars
            .map((v) => `- ${v.name}: ${JSON.stringify(v.value).slice(0, 100)}`)
            .join("\n"),
      );
    }
    const skillOutputs = session.history
      .filter((e) => e.source === "skill" && e.kind === "output")
      .slice(-5);
    if (skillOutputs.length > 0) {
      parts.push(
        "Recente tool resultaten:\n" +
          skillOutputs
            .map((e) => `- ${e.moduleId}.${e.capability}: ${e.summary ?? ""}`)
            .join("\n"),
      );
    }
    return parts.join("\n\n");
  }

  private async executeToolCall(opts: {
    call: ToolCall;
    sessionId: string;
    userId: string;
    abortSignal: AbortSignal;
    emitEvent?: (event: ProgressEvent) => void;
  }): Promise<{
    moduleId: string;
    capability: string;
    input: unknown;
    ok: boolean;
    output?: unknown;
    error?: string;
    durationMs: number;
  }> {
    const startTs = Date.now();
    const [moduleId, capability] = opts.call.function.name.split("__");
    const registry = getModuleRegistry();
    const entry = registry.get(moduleId);

    if (!entry) {
      return {
        moduleId,
        capability,
        input: undefined,
        ok: false,
        error: `Unknown module: ${moduleId}`,
        durationMs: Date.now() - startTs,
      };
    }

    const handler = entry.skill.capabilities[capability];
    if (!handler) {
      return {
        moduleId,
        capability,
        input: undefined,
        ok: false,
        error: `Unknown capability: ${capability} on ${moduleId}`,
        durationMs: Date.now() - startTs,
      };
    }

    let input: unknown;
    try {
      input = JSON.parse(opts.call.function.arguments || "{}");
    } catch {
      input = {};
    }

    const store = getSessionStore();
    const session = await store.get(opts.sessionId);
    if (!session) {
      return {
        moduleId,
        capability,
        input,
        ok: false,
        error: "Session expired",
        durationMs: Date.now() - startTs,
      };
    }

    try {
      const result = await handler(input, {
        sessionId: opts.sessionId,
        userId: opts.userId,
        history: session.history,
        variables: session.variables,
        abortSignal: opts.abortSignal,
        emit: opts.emitEvent ?? (() => {}),
        llm: this.llm,
      });

      if (result.contextDelta) {
        await store.update(opts.sessionId, result.contextDelta);
      }

      return {
        moduleId,
        capability,
        input,
        ok: result.ok,
        output: result.data,
        error: result.error?.message,
        durationMs: Date.now() - startTs,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        moduleId,
        capability,
        input,
        ok: false,
        error: msg,
        durationMs: Date.now() - startTs,
      };
    }
  }

  private safeParse(s: string): unknown {
    try {
      return JSON.parse(s || "{}");
    } catch {
      return {};
    }
  }

  async invokeDirectly(opts: {
    sessionId: string;
    userId: string;
    moduleId: string;
    capability: string;
    input: unknown;
    abortSignal?: AbortSignal;
  }) {
    const fakeCall: ToolCall = {
      id: `direct_${Date.now()}`,
      type: "function",
      function: {
        name: `${opts.moduleId}__${opts.capability}`,
        arguments: JSON.stringify(opts.input),
      },
    };
    return this.executeToolCall({
      call: fakeCall,
      sessionId: opts.sessionId,
      userId: opts.userId,
      abortSignal: opts.abortSignal ?? new AbortController().signal,
    });
  }
}

let _instance: Orchestrator | null = null;
export function getOrchestrator(): Orchestrator {
  if (!_instance) _instance = new Orchestrator();
  return _instance;
}
