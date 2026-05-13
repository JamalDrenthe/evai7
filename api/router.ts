import { authRouter } from "./auth-router";
import { toolsRouter } from "./tools-router";
import { workspaceRouter } from "./workspace-router";
import { notificationsRouter } from "./notifications-router";
import { workRouter } from "./work-router";
import { agendaRouter } from "./agenda-router";
import { modulesRouter } from "./modules-router";
import { sessionsRouter } from "./sessions-router";
import { adminRouter } from "./routers/admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  tools: toolsRouter,
  workspace: workspaceRouter,
  notifications: notificationsRouter,
  work: workRouter,
  agenda: agendaRouter,
  modules: modulesRouter,
  sessions: sessionsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
