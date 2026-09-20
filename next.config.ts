import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { buildSecurityHeaders } from "./src/lib/security/headers";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// `next dev` needs 'unsafe-eval' in script-src for React's dev-mode Fast
// Refresh / stack-reconstruction eval() calls. The static `securityHeaders`
// export defaults isDev to false (correct for prod); rebuild it per-env here
// so dev doesn't ship a CSP that trips React's "eval() is not supported"
// console error on every page load. Production keeps the strict default.
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Drop the framework fingerprint.
  poweredByHeader: false,
  // `sharp` (used internally by next/image's optimizer, and separately by
  // Payload for Media uploads) ships its native libvips binary in a *sibling*
  // optional-dependency package (@img/sharp-<platform>) that is dlopen()'d at
  // runtime rather than require()'d — Vercel's static file tracer can miss it,
  // which crashes every SSR page in prod with
  // "Failed to load external module sharp-...: Could not load the sharp module".
  // Same root cause and fix as Site avento israel's 300ea6a — this project
  // forked from that site's skeleton before that fix was applied there.
  // There are two independent copies of sharp in this tree (our own top-level
  // one, and Next's own nested copy under next/node_modules/sharp) — include
  // both explicitly so the deployed function always has the real binaries.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
      "./node_modules/next/node_modules/sharp/**/*",
      "./node_modules/next/node_modules/@img/**/*",
    ],
  },
  // Security headers + strict CSP (module owned by the security engineer).
  // Exclude the Payload admin (`/admin*`), which ships and manages its own
  // headers — the strict marketing CSP would block its inline styles/eval.
  async headers() {
    return [
      {
        source: "/((?!admin).*)",
        headers: buildSecurityHeaders({ isDev }),
      },
    ];
  },
};

export default withPayload(withNextIntl(nextConfig));
