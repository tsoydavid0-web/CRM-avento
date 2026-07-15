/**
 * Minimal in-memory, fixed-window rate limiter for API routes.
 *
 * Design goals:
 * - Edge/Node compatible: uses only `Map` + `Date.now()`, no Node built-ins.
 * - Drop-in replaceable: keep the `rateLimit()` signature and swap the store
 *   for Upstash Ratelimit / Redis when running multi-instance (see SECURITY.md).
 *
 * LIMITATION (documented on purpose): the store is per-process. On serverless
 * (Vercel) each instance has its own counter, so effective limits are looser
 * under scale-out. This is a spam/abuse speed bump, NOT a security boundary —
 * pair it with WAF/DDoS at the edge and a shared store before relying on it.
 */

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injectable clock for tests. Defaults to `Date.now`. */
  now?: () => number;
}

export interface RateLimitResult {
  /** Whether this request is allowed. */
  success: boolean;
  /** Configured max requests per window. */
  limit: number;
  /** Requests remaining in the current window (never negative). */
  remaining: number;
  /** Epoch ms when the current window resets. */
  reset: number;
  /** Seconds until reset — convenient for a `Retry-After` header. */
  retryAfterSeconds: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// Module-scoped store: shared across requests within a single process/instance.
const store = new Map<string, WindowEntry>();

// Opportunistic memory hygiene: sweep expired entries once the map gets large,
// so a flood of unique keys (e.g. spoofed IPs) can't grow memory unbounded.
const SWEEP_THRESHOLD = 5000;

function sweep(now: number): void {
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Consume one unit from `key`'s window.
 *
 * @param key    Bucket key (e.g. `lead:<ip>`). Callers namespace by route.
 * @param opts   Limit / window / optional clock.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = (opts.now ?? Date.now)();
  const { limit, windowMs } = opts;

  if (store.size > SWEEP_THRESHOLD) sweep(now);

  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  const success = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);
  const retryAfterSeconds = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));

  return { success, limit, remaining, reset: entry.resetAt, retryAfterSeconds };
}

/** Test/ops helper: clears all counters. */
export function resetRateLimitStore(): void {
  store.clear();
}

/**
 * Best-effort client IP extraction for rate-limit keying.
 *
 * `NextRequest.ip` was removed in Next 15+, so we read the proxy headers the
 * platform sets (`x-forwarded-for` first hop, then `x-real-ip`). These are
 * spoofable by clients but trustworthy behind Vercel/Cloudflare, which
 * overwrite them at the edge. Falls back to a constant so the limiter still
 * degrades safely (all unknown-IP traffic shares one bucket) instead of
 * silently disabling itself.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
