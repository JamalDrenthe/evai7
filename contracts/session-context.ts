import { z } from "zod";
import { InteractionModeEnum } from "./module-manifest";

export const ContextEntrySchema = z.object({
  id: z.string(),
  ts: z.number(),
  source: z.enum(["user", "assistant", "skill", "system"]),
  moduleId: z.string().optional(),
  capability: z.string().optional(),
  kind: z.enum(["input", "output", "message", "decision", "error"]),
  payload: z.unknown(),
  refs: z.array(z.string()).default([]),
  summary: z.string().optional(),
});
export type ContextEntry = z.infer<typeof ContextEntrySchema>;

export const ContextValueSchema = z.object({
  name: z.string(),
  value: z.unknown(),
  sourceEntryId: z.string().optional(),
  ts: z.number(),
});
export type ContextValue = z.infer<typeof ContextValueSchema>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  capability: z.string(),
  status: z.enum(["pending", "running", "done", "error"]),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowStateSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "running", "done", "error"]),
  steps: z.array(WorkflowStepSchema),
  startedAt: z.number(),
  endedAt: z.number().optional(),
});
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

export const SessionContextSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  mode: InteractionModeEnum,
  activeModuleId: z.string().optional(),
  variables: z.record(z.string(), ContextValueSchema),
  history: z.array(ContextEntrySchema),
  workflows: z.array(WorkflowStateSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type SessionContext = z.infer<typeof SessionContextSchema>;

export type ContextDelta = {
  variables?: Record<string, ContextValue>;
  history?: ContextEntry[];
  workflows?: WorkflowState[];
  activeModuleId?: string;
  mode?: SessionContext["mode"];
};
