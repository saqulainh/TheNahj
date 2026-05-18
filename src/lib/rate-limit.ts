import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

let upstashLimiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${limit}:${windowMs}`;
  const existing = upstashLimiterCache.get(cacheKey);
  if (existing) return existing;

  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
    analytics: true,
    prefix: "thenahj:ratelimit",
  });
  upstashLimiterCache.set(cacheKey, limiter);
  return limiter;
}

function consumeLocalRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const next: Bucket = {
      count: 1,
      resetAt: now + windowMs,
    };
    buckets.set(key, next);
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSec: Math.ceil(windowMs / 1000),
      backend: "memory" as const,
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      backend: "memory" as const,
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    backend: "memory" as const,
  };
}

export async function consumeRateLimit(options: RateLimitOptions) {
  const limiter = getUpstashLimiter(options.limit, options.windowMs);
  if (limiter) {
    const result = await limiter.limit(options.key);
    const resetAtMs = result.reset;
    return {
      allowed: result.success,
      remaining: Math.max(0, result.remaining),
      retryAfterSec: Math.max(1, Math.ceil((resetAtMs - Date.now()) / 1000)),
      backend: "upstash" as const,
    };
  }

  return consumeLocalRateLimit(options);
}

export function getRequestClientIp(request: Request) {
  const xForwardedFor = request.headers.get("x-forwarded-for") || "";
  const first = xForwardedFor.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip") || "unknown";
}
