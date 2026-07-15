import { describe, it, expect } from "vitest";
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  securityHeaders,
} from "./headers";

describe("buildContentSecurityPolicy", () => {
  it("locks down the dangerous directives by default", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("static (no-nonce) mode allows Next inline scripts but not eval", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("nonce mode is strict: nonce + strict-dynamic, no unsafe-inline scripts", () => {
    const csp = buildContentSecurityPolicy({ nonce: "abc123" });
    const scriptSrc = csp
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src"))!;
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("adds 'unsafe-eval' only in dev", () => {
    expect(buildContentSecurityPolicy({ isDev: true })).toContain(
      "'unsafe-eval'",
    );
    expect(buildContentSecurityPolicy({ isDev: false })).not.toContain(
      "'unsafe-eval'",
    );
  });

  it("omits analytics origins when analytics is disabled", () => {
    const off = buildContentSecurityPolicy({ allowAnalytics: false });
    expect(off).not.toContain("googletagmanager.com");
    expect(off).not.toContain("facebook.net");
    const on = buildContentSecurityPolicy({ allowAnalytics: true });
    expect(on).toContain("https://www.googletagmanager.com");
  });
});

describe("buildSecurityHeaders / securityHeaders", () => {
  it("includes the core hardening headers", () => {
    const keys = securityHeaders.map((h) => h.key);
    expect(keys).toContain("Content-Security-Policy");
    expect(keys).toContain("Strict-Transport-Security");
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Permissions-Policy");
  });

  it("HSTS is long-lived and covers subdomains", () => {
    const hsts = securityHeaders.find(
      (h) => h.key === "Strict-Transport-Security",
    )!;
    expect(hsts.value).toContain("max-age=63072000");
    expect(hsts.value).toContain("includeSubDomains");
  });

  it("nosniff and frame deny are set", () => {
    expect(
      buildSecurityHeaders().find((h) => h.key === "X-Content-Type-Options")!
        .value,
    ).toBe("nosniff");
    expect(
      buildSecurityHeaders().find((h) => h.key === "X-Frame-Options")!.value,
    ).toBe("DENY");
  });
});
