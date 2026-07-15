import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, resetRateLimitStore, getClientIp } from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimitStore());

  it("allows up to the limit then blocks", () => {
    const opts = { limit: 3, windowMs: 1000, now: () => 1000 };
    expect(rateLimit("k", opts).success).toBe(true); // 1
    expect(rateLimit("k", opts).success).toBe(true); // 2
    const third = rateLimit("k", opts); // 3
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
    expect(rateLimit("k", opts).success).toBe(false); // 4 -> blocked
  });

  it("reports retryAfter and reset", () => {
    const r = rateLimit("k", { limit: 1, windowMs: 60_000, now: () => 5_000 });
    expect(r.reset).toBe(65_000);
    expect(r.retryAfterSeconds).toBe(60);
  });

  it("resets after the window elapses", () => {
    expect(
      rateLimit("k", { limit: 1, windowMs: 1000, now: () => 0 }).success,
    ).toBe(true);
    expect(
      rateLimit("k", { limit: 1, windowMs: 1000, now: () => 500 }).success,
    ).toBe(false);
    // New window.
    expect(
      rateLimit("k", { limit: 1, windowMs: 1000, now: () => 1500 }).success,
    ).toBe(true);
  });

  it("isolates keys", () => {
    const opts = { limit: 1, windowMs: 1000, now: () => 0 };
    expect(rateLimit("a", opts).success).toBe(true);
    expect(rateLimit("b", opts).success).toBe(true);
    expect(rateLimit("a", opts).success).toBe(false);
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://x.test", { headers });

  it("uses the first x-forwarded-for hop", () => {
    expect(
      getClientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })),
    ).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip then to 'unknown'", () => {
    expect(getClientIp(req({ "x-real-ip": "198.51.100.9" }))).toBe(
      "198.51.100.9",
    );
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
