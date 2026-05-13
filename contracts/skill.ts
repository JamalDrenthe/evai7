import type { ModuleManifest } from "./module-manifest";
import type { ContextDelta, ContextEntry, SessionContext } from "./session-context";

export type ProgressEvent =
  | { type: "skill.start"; moduleId: string; capability: string; ts: number }
  | { type: "skill.progress"; moduleId: string; message: string; ts: number }
  | { type: "skill.end"; moduleId: string; capability: string; ts: number; durationMs: number };

export type InvocationContext = {
  sessionId: string;
  userId: string;
  history: ContextEntry[];
  variables: SessionContext["variables"];
  abortSignal: AbortSignal;
  emit: (event: ProgressEvent) => void;
  llm?: import("./llm").LLMClient;
};

export type SkillResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
  contextDelta?: ContextDelta;
  trace: Array<{ step: string; ts: number; meta?: unknown }>;
};

export interface Skill<TIn = unknown, TOut = unknown> {
  manifest: ModuleManifest;
  capabilities: Record<
    string,
    (input: TIn, ctx: InvocationContext) => Promise<SkillResult<TOut>>
  >;
}
