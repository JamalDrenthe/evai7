import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { events } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const agendaRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(events)
      .where(eq(events.userId, ctx.user.id))
      .orderBy(desc(events.start));
  }),

  range: authedQuery
    .input(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(events)
        .where(
          and(
            eq(events.userId, ctx.user.id),
            gte(events.start, new Date(input.start)),
            lte(events.start, new Date(input.end))
          )
        )
        .orderBy(events.start);
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        start: z.string(),
        end: z.string(),
        type: z.enum(["meeting", "deadline", "reminder", "task"]).default("meeting"),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db
        .insert(events)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          start: new Date(input.start),
          end: new Date(input.end),
          type: input.type,
          location: input.location,
        })
        .returning({ id: events.id });
      return { id: row.id };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        type: z.enum(["meeting", "deadline", "reminder", "task"]).optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, start, end, ...rest } = input;
      const updateData: Partial<typeof events.$inferInsert> = { ...rest };
      if (start) updateData.start = new Date(start);
      if (end) updateData.end = new Date(end);
      await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(events).where(eq(events.id, input.id));
      return { success: true };
    }),
});
