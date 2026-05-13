import { nanoid } from "nanoid";
import Redis from "ioredis";
import type {
  ContextDelta,
  ContextEntry,
  SessionContext,
  WorkflowState,
} from "../../contracts/session-context";
import type { InteractionMode } from "../../contracts/module-manifest";

export interface SessionStore {
  create(userId: string, mode: InteractionMode): Promise<SessionContext>;
  get(sessionId: string): Promise<SessionContext | null>;
  update(sessionId: string, delta: ContextDelta): Promise<SessionContext | null>;
  appendEntry(sessionId: string, entry: ContextEntry): Promise<void>;
  setMode(sessionId: string, mode: InteractionMode): Promise<void>;
  setActiveModule(sessionId: string, moduleId: string | undefined): Promise<void>;
  upsertWorkflow(sessionId: string, workflow: WorkflowState): Promise<void>;
  listForUser(userId: string): Promise<SessionContext[]>;
  delete(sessionId: string): Promise<void>;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const MAX_HISTORY = 200;

class InMemorySessionStore implements SessionStore {
  private store = new Map<string, SessionContext>();

  constructor() {
    setInterval(() => this.gc(), 1000 * 60 * 5).unref?.();
  }

  private gc() {
    const now = Date.now();
    for (const [id, ctx] of this.store) {
      if (now - ctx.updatedAt > SESSION_TTL_MS) {
        this.store.delete(id);
      }
    }
  }

  async create(userId: string, mode: InteractionMode): Promise<SessionContext> {
    const now = Date.now();
    const ctx: SessionContext = {
      sessionId: nanoid(),
      userId,
      mode,
      activeModuleId: undefined,
      variables: {},
      history: [],
      workflows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(ctx.sessionId, ctx);
    return ctx;
  }

  async get(sessionId: string): Promise<SessionContext | null> {
    const ctx = this.store.get(sessionId);
    if (!ctx) return null;
    if (Date.now() - ctx.updatedAt > SESSION_TTL_MS) {
      this.store.delete(sessionId);
      return null;
    }
    return ctx;
  }

  async update(
    sessionId: string,
    delta: ContextDelta,
  ): Promise<SessionContext | null> {
    const ctx = await this.get(sessionId);
    if (!ctx) return null;

    if (delta.variables) {
      ctx.variables = { ...ctx.variables, ...delta.variables };
    }
    if (delta.history) {
      ctx.history = [...ctx.history, ...delta.history].slice(-MAX_HISTORY);
    }
    if (delta.workflows) {
      const map = new Map(ctx.workflows.map((w) => [w.id, w]));
      for (const w of delta.workflows) map.set(w.id, w);
      ctx.workflows = Array.from(map.values());
    }
    if (delta.activeModuleId !== undefined) {
      ctx.activeModuleId = delta.activeModuleId;
    }
    if (delta.mode !== undefined) {
      ctx.mode = delta.mode;
    }
    ctx.updatedAt = Date.now();
    this.store.set(sessionId, ctx);
    return ctx;
  }

  async appendEntry(sessionId: string, entry: ContextEntry): Promise<void> {
    await this.update(sessionId, { history: [entry] });
  }

  async setMode(sessionId: string, mode: InteractionMode): Promise<void> {
    await this.update(sessionId, { mode });
  }

  async setActiveModule(
    sessionId: string,
    moduleId: string | undefined,
  ): Promise<void> {
    await this.update(sessionId, { activeModuleId: moduleId });
  }

  async upsertWorkflow(sessionId: string, workflow: WorkflowState): Promise<void> {
    await this.update(sessionId, { workflows: [workflow] });
  }

  async listForUser(userId: string): Promise<SessionContext[]> {
    return Array.from(this.store.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async delete(sessionId: string): Promise<void> {
    this.store.delete(sessionId);
  }
}

class RedisSessionStore implements SessionStore {
  private redis: Redis;
  private prefix = "session:";

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    // Graceful fallback if Redis is unavailable
    this.redis.on("error", (err) => {
      console.error("[RedisSessionStore] Redis error, falling back to in-memory:", err.message);
    });
  }

  private getKey(sessionId: string): string {
    return `${this.prefix}${sessionId}`;
  }

  async create(userId: string, mode: InteractionMode): Promise<SessionContext> {
    const now = Date.now();
    const ctx: SessionContext = {
      sessionId: nanoid(),
      userId,
      mode,
      activeModuleId: undefined,
      variables: {},
      history: [],
      workflows: [],
      createdAt: now,
      updatedAt: now,
    };
    await this.redis.setex(this.getKey(ctx.sessionId), SESSION_TTL_MS / 1000, JSON.stringify(ctx));
    return ctx;
  }

  async get(sessionId: string): Promise<SessionContext | null> {
    try {
      const data = await this.redis.get(this.getKey(sessionId));
      if (!data) return null;
      return JSON.parse(data) as SessionContext;
    } catch {
      return null;
    }
  }

  async update(
    sessionId: string,
    delta: ContextDelta,
  ): Promise<SessionContext | null> {
    const ctx = await this.get(sessionId);
    if (!ctx) return null;

    if (delta.variables) {
      ctx.variables = { ...ctx.variables, ...delta.variables };
    }
    if (delta.history) {
      ctx.history = [...ctx.history, ...delta.history].slice(-MAX_HISTORY);
    }
    if (delta.workflows) {
      const map = new Map(ctx.workflows.map((w) => [w.id, w]));
      for (const w of delta.workflows) map.set(w.id, w);
      ctx.workflows = Array.from(map.values());
    }
    if (delta.activeModuleId !== undefined) {
      ctx.activeModuleId = delta.activeModuleId;
    }
    if (delta.mode !== undefined) {
      ctx.mode = delta.mode;
    }
    ctx.updatedAt = Date.now();
    await this.redis.setex(this.getKey(sessionId), SESSION_TTL_MS / 1000, JSON.stringify(ctx));
    return ctx;
  }

  async appendEntry(sessionId: string, entry: ContextEntry): Promise<void> {
    await this.update(sessionId, { history: [entry] });
  }

  async setMode(sessionId: string, mode: InteractionMode): Promise<void> {
    await this.update(sessionId, { mode });
  }

  async setActiveModule(
    sessionId: string,
    moduleId: string | undefined,
  ): Promise<void> {
    await this.update(sessionId, { activeModuleId: moduleId });
  }

  async upsertWorkflow(sessionId: string, workflow: WorkflowState): Promise<void> {
    await this.update(sessionId, { workflows: [workflow] });
  }

  async listForUser(userId: string): Promise<SessionContext[]> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`);
      if (keys.length === 0) return [];
      const values = await this.redis.mget(keys);
      const sessions = values
        .filter((v): v is string => v !== null)
        .map((v) => JSON.parse(v) as SessionContext)
        .filter((s) => s.userId === userId)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      return sessions;
    } catch {
      return [];
    }
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(this.getKey(sessionId));
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

let _store: SessionStore | null = null;
let _redisStore: RedisSessionStore | null = null;

export function getSessionStore(): SessionStore {
  if (!_store) {
    // Try Redis first, fall back to in-memory if unavailable
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      const redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 0, // Fail immediately if Redis is unavailable
        enableReadyCheck: false,
      });
      
      // Test connection synchronously by setting up error handler
      let connected = false;
      redis.on("connect", () => {
        connected = true;
        console.log("[SessionStore] Using Redis adapter");
        _store = new RedisSessionStore(redisUrl);
      });
      
      redis.on("error", (err) => {
        if (!connected && !_store) {
          console.warn("[SessionStore] Redis unavailable, using in-memory fallback:", err.message);
          _store = new InMemorySessionStore();
          redis.quit().catch(() => {});
        }
      });
      
      // If no connection within 100ms, fall back to in-memory
      setTimeout(() => {
        if (!connected && !_store) {
          console.warn("[SessionStore] Redis connection timeout, using in-memory fallback");
          _store = new InMemorySessionStore();
          redis.quit().catch(() => {});
        }
      }, 100);
      
      // Default to in-memory until connection is confirmed
      _store = new InMemorySessionStore();
    } catch (err) {
      console.warn("[SessionStore] Redis initialization failed, using in-memory fallback:", err);
      _store = new InMemorySessionStore();
    }
  }
  return _store;
}

export async function closeSessionStore(): Promise<void> {
  if (_redisStore) {
    await _redisStore.close();
    _redisStore = null;
  }
  _store = null;
}
