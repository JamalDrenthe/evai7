import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getModuleRegistry } from "./modules/_registry";
import { getOrchestrator } from "./orchestrator";
import { getSessionStore } from "./memory/session-store";

export const modulesRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          type: z
            .enum(["calculator", "chatbot", "tool", "visualization", "verification"])
            .optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const registry = getModuleRegistry();
      const all = registry.list();
      if (input?.type) {
        return all.filter((m) => m.type === input.type);
      }
      return all;
    }),

  get: authedQuery
    .input(z.object({ moduleId: z.string() }))
    .query(({ input }) => {
      const registry = getModuleRegistry();
      const entry = registry.get(input.moduleId);
      if (!entry) return null;
      return entry.manifest;
    }),

  invoke: authedQuery
    .input(
      z.object({
        moduleId: z.string(),
        capability: z.string(),
        input: z.unknown(),
        sessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = String(ctx.user.id);
      const store = getSessionStore();

      let sessionId = input.sessionId;
      if (!sessionId) {
        const session = await store.create(userId, "direct-tool");
        sessionId = session.sessionId;
      } else {
        const existing = await store.get(sessionId);
        if (!existing) {
          const session = await store.create(userId, "direct-tool");
          sessionId = session.sessionId;
        }
      }

      const orchestrator = getOrchestrator();
      const result = await orchestrator.invokeDirectly({
        sessionId,
        userId,
        moduleId: input.moduleId,
        capability: input.capability,
        input: input.input,
      });

      return {
        sessionId,
        ok: result.ok,
        data: result.output,
        error: result.error,
        durationMs: result.durationMs,
      };
    }),
});
