import type { Context, Next } from "hono";
import Redis from "ioredis";

const DEFAULT_LIMIT = 60; // requests per minute
const DEFAULT_WINDOW = 60; // seconds

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: 3,
      });
      redis.on("error", () => {
        redis = null;
      });
    } catch {
      redis = null;
    }
  }
  return redis;
}

export interface RateLimitOptions {
  limit?: number;
  window?: number;
  keyPrefix?: string;
  identifier?: (c: Context) => string;
}

export async function rateLimit(options: RateLimitOptions = {}) {
  const {
    limit = DEFAULT_LIMIT,
    window = DEFAULT_WINDOW,
    keyPrefix = "ratelimit",
    identifier = (c) => c.req.header("x-forwarded-for")?.[0] || c.req.header("x-real-ip") || "unknown",
  } = options;

  return async (c: Context, next: Next) => {
    const redis = getRedis();
    if (!redis) {
      // Redis unavailable, skip rate limiting
      await next();
      return;
    }

    const id = identifier(c);
    const key = `${keyPrefix}:${id}`;
    
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, window);
      }

      if (current > limit) {
        const ttl = await redis.ttl(key);
        c.header("X-RateLimit-Limit", limit.toString());
        c.header("X-RateLimit-Remaining", "0");
        c.header("X-RateLimit-Reset", ttl.toString());
        return c.json(
          {
            error: "Rate limit exceeded",
            retryAfter: ttl,
          },
          429,
        );
      }

      c.header("X-RateLimit-Limit", limit.toString());
      c.header("X-RateLimit-Remaining", (limit - current).toString());
      c.header("X-RateLimit-Reset", (await redis.ttl(key)).toString());
      
      await next();
    } catch {
      // Redis error, skip rate limiting
      await next();
    }
  };
}

export function rateLimitByUserId(limit = DEFAULT_LIMIT, window = DEFAULT_WINDOW) {
  return rateLimit({
    limit,
    window,
    keyPrefix: "ratelimit:user",
    identifier: (c) => {
      const userId = c.get("userId") as string | undefined;
      return userId ? `user:${userId}` : "anonymous";
    },
  });
}
