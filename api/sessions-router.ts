import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getSessionStore } from "./memory/session-store";
import { InteractionModeEnum } from "../contracts/module-manifest";

export const sessionsRouter = createRouter({
  create: authedQuery
    .input(z.object({ mode: InteractionModeEnum.default("chat-calculators") }))
    .mutation(async ({ input, ctx }) => {
      const store = getSessionStore();
      const session = await store.create(String(ctx.user.id), input.mode);
      return session;
    }),

  get: authedQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const store = getSessionStore();
      const session = await store.get(input.sessionId);
      if (!session) return null;
      if (session.userId !== String(ctx.user.id)) return null;
      return session;
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const store = getSessionStore();
    return store.listForUser(String(ctx.user.id));
  }),

  setMode: authedQuery
    .input(
      z.object({
        sessionId: z.string(),
        mode: InteractionModeEnum,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const store = getSessionStore();
      const session = await store.get(input.sessionId);
      if (!session || session.userId !== String(ctx.user.id)) {
        throw new Error("Session not found");
      }
      await store.setMode(input.sessionId, input.mode);
      return { ok: true };
    }),

  setActiveModule: authedQuery
    .input(
      z.object({
        sessionId: z.string(),
        moduleId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const store = getSessionStore();
      const session = await store.get(input.sessionId);
      if (!session || session.userId !== String(ctx.user.id)) {
        throw new Error("Session not found");
      }
      await store.setActiveModule(input.sessionId, input.moduleId);
      return { ok: true };
    }),

  delete: authedQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const store = getSessionStore();
      const session = await store.get(input.sessionId);
      if (!session || session.userId !== String(ctx.user.id)) {
        return { ok: false };
      }
      await store.delete(input.sessionId);
      return { ok: true };
    }),
});
