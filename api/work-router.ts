import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { workItems } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const workRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(workItems)
      .where(eq(workItems.userId, ctx.user.id))
      .orderBy(desc(workItems.createdAt));
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "review", "done"]).default("todo"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        assignee: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db
        .insert(workItems)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          assignee: input.assignee,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        })
        .returning({ id: workItems.id });
      return { id: row.id };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        assignee: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db
        .update(workItems)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(workItems.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(workItems).where(eq(workItems.id, input.id));
      return { success: true };
    }),
});
