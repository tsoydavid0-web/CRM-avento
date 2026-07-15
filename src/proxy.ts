import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Next.js 16 renamed the `middleware` convention to `proxy` (runtime: nodejs).
 * We delegate to next-intl's locale negotiation / redirect handler, which
 * rewrites `/` → `/ru`, detects `Accept-Language`, and keeps the locale in the
 * URL in sync.
 */
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except Next internals, API routes, the Payload admin,
  // the CRM surface (`/crm/*`), and files with an extension (static assets).
  // This lets `/api/lead`, `/admin` and `/crm/inbox` bypass locale handling.
  matcher: ["/((?!api|admin|crm|_next|_vercel|.*\\..*).*)"],
};
