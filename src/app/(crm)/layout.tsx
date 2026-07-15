import type { ReactNode } from "react";

import "../globals.css";
import "./crm.css";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

/**
 * Root layout for the CRM app surface (the internal inbox, board, etc.), served
 * under `/crm/*`. It is a separate root layout from the marketing `[locale]`
 * site and the Payload `(payload)` admin — the project already uses this
 * multiple-root-layout pattern. We reuse the brand tokens from globals.css but
 * NOT the marketing Header/Footer.
 */
export const metadata = {
  title: "Avento CRM",
  robots: { index: false, follow: false },
};

export default function CrmRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#012c79" />
        {/* iOS "Add to Home Screen" support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Avento CRM" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/brand/avento-logo-final.png" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
