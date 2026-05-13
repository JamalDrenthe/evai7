import { z } from "zod";

export const ModuleTypeEnum = z.enum([
  "calculator",
  "chatbot",
  "tool",
  "visualization",
  "verification",
]);
export type ModuleType = z.infer<typeof ModuleTypeEnum>;

export const CapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.unknown(),
  outputSchema: z.unknown(),
});
export type Capability = z.infer<typeof CapabilitySchema>;

export const ModuleManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  type: ModuleTypeEnum,
  version: z.string(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  capabilities: z.array(CapabilitySchema),
  contextRequirements: z.array(z.string()).optional(),
  contextOutputs: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).default([]),
  ui: z.object({
    icon: z.string(),
    color: z.string().optional(),
    panel: z.string().optional(),
  }),
  requiresAuth: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
  runtime: z.enum(["typescript", "python-sidecar"]).default("typescript"),
});
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

export const InteractionModeEnum = z.enum([
  "chat-calculators",
  "chat-projects",
  "direct-tool",
]);
export type InteractionMode = z.infer<typeof InteractionModeEnum>;
