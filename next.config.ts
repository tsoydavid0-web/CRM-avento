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
