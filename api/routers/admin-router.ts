import { z } from "zod";
import { getDb } from "../queries/connection";
import { moduleRuns, workflowRuns, sessions } from "@db/schema";
import { desc, like, and } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";

const ListModuleRunsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().optional().default(100),
});

const ListWorkflowRunsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().optional().default(100),
});

const ListSessionsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().optional().default(100),
});

export const adminRouter = createRouter({
  listModuleRuns: publicQuery
    .input(ListModuleRunsSchema)
    .query(async ({ input }: { input: z.infer<typeof ListModuleRunsSchema> }) => {
      const { search, limit } = input;
      const db = getDb();
      
      const conditions = search
        ? [like(moduleRuns.sessionId, `%${search}%`), like(moduleRuns.moduleId, `%${search}%`)]
        : [];
      
      const runs = await db
        .select()
        .from(moduleRuns)
        .where(search ? and(...conditions) : undefined)
        .orderBy(desc(moduleRuns.createdAt))
        .limit(limit);
      
      return runs;
    }),

  listWorkflowRuns: publicQuery
    .input(ListWorkflowRunsSchema)
    .query(async ({ input }: { input: z.infer<typeof ListWorkflowRunsSchema> }) => {
      const { search, limit } = input;
      const db = getDb();
      
      const conditions = search
        ? [like(workflowRuns.sessionId, `%${search}%`)]
        : [];
      
      const runs = await db
        .select()
        .from(workflowRuns)
        .where(search ? and(...conditions) : undefined)
        .orderBy(desc(workflowRuns.createdAt))
        .limit(limit);
      
      return runs;
    }),

  listSessions: publicQuery
    .input(ListSessionsSchema)
    .query(async ({ input }: { input: z.infer<typeof ListSessionsSchema> }) => {
      const { search, limit } = input;
      const db = getDb();
      
      const conditions = search
        ? [like(sessions.id, `%${search}%`), like(sessions.mode, `%${search}%`)]
        : [];
      
      const sessionList = await db
        .select()
        .from(sessions)
        .where(search ? and(...conditions) : undefined)
        .orderBy(desc(sessions.startedAt))
        .limit(limit);
      
      return sessionList;
    }),
});
