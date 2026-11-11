interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory IP rate limiter for Next.js App Router API routes.
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = oldest + windowMs - now;
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(resetMs, 0)
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs
  };
}

export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return "127.0.0.1";
}
