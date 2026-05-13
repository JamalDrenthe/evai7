import type { Context } from "hono";
import { z } from "zod";
import { authenticateRequest } from "../lib/auth";
import { getOrchestrator, type OrchestratorEvent } from "./index";
import { getSessionStore } from "../memory/session-store";

const StreamRequestSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
});

export async function handleOrchestratorStream(c: Context): Promise<Response> {
  // Authenticate via the same flow as tRPC context so userId matches what
  // `sessions.create` stored (String(ctx.user.id)).
  let userId: string;
  try {
    const user = await authenticateRequest(c.req.raw.headers);
    userId = String(user.id);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Parse request body
  let body: z.infer<typeof StreamRequestSchema>;
  try {
    const json = await c.req.json();
    body = StreamRequestSchema.parse(json);
  } catch (err) {
    return c.json(
      { error: "Invalid request", details: err instanceof Error ? err.message : String(err) },
      400,
    );
  }

  // Verify session belongs to this user
  const store = getSessionStore();
  const session = await store.get(body.sessionId);
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }
  if (session.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Setup SSE stream
  const orchestrator = getOrchestrator();
  const abortController = new AbortController();
  c.req.raw.signal.addEventListener("abort", () => abortController.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: OrchestratorEvent) => {
        const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        send({ type: "session.started", sessionId: body.sessionId });
        for await (const event of orchestrator.handleTurn({
          sessionId: body.sessionId,
          userId,
          userMessage: body.message,
          abortSignal: abortController.signal,
        })) {
          send(event);
          if (event.type === "done") break;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "done", reason: "error", error: msg });
      } finally {
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
