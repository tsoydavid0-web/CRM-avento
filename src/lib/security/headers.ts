/**
 * Security response headers + Content-Security-Policy for the Avento site.
 *
 * This module is consumed by `next.config.ts` (owned by web-engineer) via its
 * async `headers()` function — see the wiring snippet in SECURITY.md. Keeping
 * the policy here means the security posture is reviewable in one place and
 * unit-testable.
 *
 * CSP posture
 * -----------
 * The current default is a *host-allowlist* CSP that works with statically
 * rendered Next.js pages (no per-request nonce available from static
 * `headers()`). Next injects inline hydration/streaming scripts, so a static
 * policy must permit inline scripts. `buildContentSecurityPolicy()` therefore
 * has two modes:
 *
 *  - No nonce (default, static): `script-src 'self' 'unsafe-inline' <hosts>`.
 *    This is the pragmatic interim posture. `'unsafe-inline'` weakens XSS
 *    defense, which is why input is strictly validated/escaped everywhere else.
 *  - With nonce (recommended prod target, via a `proxy.ts`): `script-src
 *    'self' 'nonce-…' 'strict-dynamic'` — truly strict, `'unsafe-inline'` is
 *    dropped and ignored by CSP3 browsers. Requires dynamic rendering.
 *
 * See SECURITY.md ("CSP hardening") for the upgrade path.
 */

/**
 * Third-party origins that analytics/marketing tags need once cookie consent
 * is granted. These are *allowlist* entries only — nothing loads until the
 * user opts in via <CookieConsent> at runtime. Kept centralized so devops can
 * adjust in one spot.
 */
const ANALYTICS = {
  script: ["https://www.googletagmanager.com", "https://connect.facebook.net"],
  connect: [
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
  ],
  img: [
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://www.facebook.com",
  ],
  frame: ["https://www.facebook.com"],
} as const;

export interface CspOptions {
  /** Per-request nonce (from a proxy). Enables strict, nonce-based script-src. */
  nonce?: string;
  /** Dev needs 'unsafe-eval' (React refresh) and inline styles. */
  isDev?: boolean;
  /** Allowlist analytics/marketing origins. Default true. */
  allowAnalytics?: boolean;
}

/**
 * Build the CSP header value.
 *
 * Defaults (no args) produce the static-site interim policy described above.
 */
export function buildContentSecurityPolicy(options: CspOptions = {}): string {
  const {
    nonce,
    isDev = false,
    allowAnalytics = true,
  } = options;

  const analyticsScript = allowAnalytics ? ANALYTICS.script : [];
  const analyticsConnect = allowAnalytics ? ANALYTICS.connect : [];
  const analyticsImg = allowAnalytics ? ANALYTICS.img : [];
  const analyticsFrame = allowAnalytics ? ANALYTICS.frame : [];

  // script-src: nonce-based (strict) when a nonce is supplied, otherwise the
  // static-compatible fallback that allows Next's inline hydration scripts.
  const scriptSrc = nonce
    ? [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        isDev ? "'unsafe-eval'" : "",
      ]
    : [
        "'self'",
        "'unsafe-inline'",
        isDev ? "'unsafe-eval'" : "",
        ...analyticsScript,
      ];

  // style-src: Next/Tailwind emit inline styles; nonce them when available.
  const styleSrc = nonce && !isDev
    ? ["'self'", `'nonce-${nonce}'`]
    : ["'self'", "'unsafe-inline'"];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "script-src": scriptSrc.filter(Boolean),
    "style-src": styleSrc,
    // next/font self-hosts fonts, so 'self' is enough (no Google Fonts CDN).
    "font-src": ["'self'"],
    "img-src": ["'self'", "data:", "blob:", ...analyticsImg],
    "connect-src": ["'self'", ...analyticsConnect],
    "frame-src": ["'self'", ...analyticsFrame],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");

  // Force HTTPS for any accidental http subresource.
  return `${policy}; upgrade-insecure-requests`;
}

/**
 * Build the full set of security headers as `{ key, value }` objects, ready to
 * spread into a next.config `headers()` entry.
 *
 * `Content-Security-Policy` here uses the static default (no nonce). If you
 * later add a `proxy.ts` that mints a nonce, set the CSP there per-request and
 * drop it from this list to avoid a duplicate/looser header.
 */
export function buildSecurityHeaders(
  options: CspOptions = {},
): { key: string; value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    // Force HTTPS for 2 years incl. subdomains; eligible for the preload list.
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    // Belt-and-suspenders clickjacking defense (frame-ancestors is the modern one).
    { key: "X-Frame-Options", value: "DENY" },
    // Block MIME sniffing.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Send only the origin cross-site; full path same-origin.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Deny powerful features the marketing site never uses.
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
    // Cross-origin isolation hardening.
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    // Explicitly opt out of legacy DNS prefetch leakage control.
    { key: "X-DNS-Prefetch-Control", value: "off" },
  ];
}

/**
 * Default, ready-to-use header list for the static site.
 * In `next.config.ts`: `headers: [...securityHeaders]` for `source: '/(.*)'`.
 */
export const securityHeaders = buildSecurityHeaders();
