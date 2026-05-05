// =============================================================================
// In-memory rate limiter — suitable for single-instance / MVP deployments.
// For multi-instance production, upgrade to Redis (e.g. Upstash).
// =============================================================================

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

function prune(key: string): void {
  const entry = store.get(key);
  if (entry && Date.now() > entry.resetAt) {
    store.delete(key);
  }
}

/**
 * Check if a request is allowed under the rate limit.
 * Returns `true` if allowed, `false` if rate limited.
 *
 * @param identifier - Unique key for the client (e.g. IP address)
 * @param options - Optional overrides for limit and window
 *
 * @example
 * ```ts
 * const ip = getClientIdentifier(req.headers);
 * if (!checkRateLimit(ip)) {
 *   throw new RateLimitError();
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  options?: { maxRequests?: number; windowMs?: number }
): boolean {
  const limit = options?.maxRequests ?? MAX_REQUESTS;
  const window = options?.windowMs ?? WINDOW_MS;

  prune(identifier);
  const entry = store.get(identifier);
  const now = Date.now();

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + window });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Extract client IP from request headers.
 * Prefers x-forwarded-for (first hop), then x-real-ip.
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
