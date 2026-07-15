# Security — Avento

Security posture for the Avento site (Next.js 16 / React 19). Owned by the
security-engineer. "Protection = everything together": code security, data &
privacy (GDPR/PT), and runtime protection.

## Done (implemented in this pass)

### Code security
- **Input validation on the form boundary** — `src/lib/validation.ts` (zod
  `leadSchema`). Every field from the browser is parsed before anything
  downstream sees it. Length caps on all fields; strict `phone` format;
  `name`/`phone` reject CR/LF (email-header-injection defense); `mortgage` is a
  strict boolean (no `"false"` → truthy coercion).
- **No PII in logs** — the API route logs only non-identifying markers, never
  `name`/`phone`.
- **No secrets in code** — delivery reads `RESEND_API_KEY`, `LEAD_NOTIFY_TO`,
  `LEAD_NOTIFY_FROM` from `process.env`; only placeholders + TODO in source.
  `.env*` is already git-ignored (`.gitignore`).
- **Client input never reflected** — the API returns machine-readable error
  codes, not submitted values (no reflected XSS surface in error responses).

### Data & privacy (GDPR / Portugal)
- **Consent-gated analytics** — `src/components/CookieConsent.tsx`. GA4 / Meta
  Pixel load **only** after explicit "Accept". Decline / no-choice / blocked
  storage all keep analytics **off** (fail-closed on privacy). Choice persisted
  in `localStorage`. GA configured with `anonymize_ip` and Consent Mode
  (`ad_storage: denied`).
- **Data minimization** — the form collects only name + phone (+ optional
  qualifiers). Schema enforces the shape.
- Consent banner links to the privacy/cookie policy (`policyHref` prop).

### Runtime protection
- **Honeypot anti-bot** — `src/lib/security/honeypot.ts`. Hidden `company`
  field; any value ⇒ bot. Checked **before** validation; bots get a `200` that
  looks like success (no signal to adapt).
- **Rate limiting** — `src/lib/security/rateLimit.ts`. In-memory fixed window,
  edge/Node compatible. `POST /api/lead` = 5 req/min/IP → `429` + `Retry-After`.
- **Request hardening** on `POST /api/lead` — JSON-only (`415` otherwise), body
  size cap (`413`), malformed JSON → `400` (never `500`), non-object body → `400`.
- **Security headers + strict CSP** — `src/lib/security/headers.ts`. HSTS
  (2y, preload), `X-Frame-Options: DENY` + `frame-ancestors 'none'`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment
  denied), COOP, and a CSP with `default-src 'self'`, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`.

## Wiring: connect the security headers in `next.config.ts`

`next.config.ts` is owned by web-engineer. To activate the headers, add an
async `headers()` function that returns the exported list (also set
`poweredByHeader: false` to drop the `X-Powered-By` fingerprint):

```ts
import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Apply to every route. API routes also send their own no-store header.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

Then render `<CookieConsent />` once in the layout, passing a localized
`policyHref` (e.g. `/${locale}/privacy`) and translated labels via next-intl.

## Known tradeoffs / to-do before launch

- **CSP `script-src` uses `'unsafe-inline'` in the default (static) mode.**
  Statically-rendered Next injects inline hydration scripts, and a static
  `headers()` config has no per-request nonce. This is the documented interim
  posture — it weakens XSS defense, which is why every input is strictly
  validated/escaped. **Upgrade path:** add a `proxy.ts` that mints a per-request
  nonce and call `buildContentSecurityPolicy({ nonce })`; the builder then emits
  `'nonce-…' 'strict-dynamic'` and drops `'unsafe-inline'` (requires dynamic
  rendering). `headers.ts` already supports this mode.
- **Email delivery (Resend) is a stub.** `deliverLead()` in
  `src/app/api/lead/route.ts` must be implemented. In production, missing
  `RESEND_API_KEY`/`LEAD_NOTIFY_TO`/`LEAD_NOTIFY_FROM` throws (→ `502`) rather
  than silently dropping a lead — wire the env + real Resend call before launch.
  Secrets go in the platform env store, **never** committed; never use a
  `NEXT_PUBLIC_*` name for the API key.
- **Rate limiter is per-instance (in-memory).** On serverless scale-out each
  instance has its own counter, so it's a spam speed-bump, not a hard boundary.
  Swap the store for **Upstash Ratelimit / Redis** before relying on it under
  load. Keep the `rateLimit()` signature.
- **CAPTCHA.** Honeypot is the zero-friction first layer. Add a real CAPTCHA
  (Cloudflare Turnstile / hCaptcha) on `POST /api/lead` if spam grows past the
  honeypot + rate limit.
- **WAF / DDoS at the edge.** Enable Vercel WAF / Cloudflare (bot management,
  rate rules, DDoS protection) in front of the app — the app-level limiter does
  not replace edge protection.
- **Payload admin hardening** (when Payload is added): strong unique admin
  auth, roles/least-privilege, login lockout, **no default credentials**, admin
  behind auth + ideally IP allowlist, and `X-Robots-Tag: noindex` on the admin.
  Shipping an exposed admin or PII without these is a launch blocker.
- **Privacy & cookie policy pages** — draft legal text near launch; get a
  **lawyer review** (GDPR/Portugal) before go-live. The consent banner already
  links to `policyHref`.
- **`NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID`** — set only when analytics
  is approved; until set, the consent gate loads nothing.

## Dependencies
No new dependencies were installed. `zod` (already present) is used for
validation. Future additions to consider (flagged, not installed): `resend`
(email), `@upstash/ratelimit` + `@upstash/redis` (shared rate limit), a CAPTCHA
SDK. Install these separately; do not add ad-hoc during parallel work.
