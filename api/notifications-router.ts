import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const notificationsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt));
  }),

  unread: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt));
  }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),

  create: authedQuery
    .input(
      z.object({
        type: z.enum(["info", "warning", "success", "update"]),
        title: z.string(),
        message: z.string(),
        link: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(notifications).values({
        userId: ctx.user.id,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
      });
      return { success: true };
    }),
});
