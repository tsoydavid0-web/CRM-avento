"use client";

import { useEffect, useState } from "react";

/**
 * GDPR cookie-consent banner (Portugal / EU).
 *
 * Privacy-by-default: analytics/marketing tags (GA4, Meta Pixel) load ONLY
 * after the user explicitly clicks "Accept". Until then — and if they
 * "Decline" — nothing that sets non-essential cookies is loaded. The choice is
 * persisted so the banner shows once.
 *
 * This is the runtime gate. The CSP in `lib/security/headers.ts` is the static
 * allowlist. Both layers are required: consent decides *whether* tags load, CSP
 * decides *what origins are even allowed to*.
 *
 * Localization: strings are props with English defaults so this component is
 * self-contained. Pass translated labels + a localized policy href from a
 * next-intl-aware parent (web-engineer) at launch.
 */

const CONSENT_KEY = "avento_cookie_consent";
type ConsentValue = "granted" | "denied";

interface CookieConsentProps {
  /** Link to the cookie/privacy policy page. Localize per-locale. */
  policyHref?: string;
  message?: string;
  policyLinkLabel?: string;
  acceptLabel?: string;
  declineLabel?: string;
}

function readConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Storage blocked (private mode / cookies disabled) — treat as "no choice",
    // which keeps analytics OFF. Fail closed on privacy.
    return null;
  }
}

function persistConsent(value: ConsentValue): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // If we can't persist, we simply re-ask next visit. Never load tags anyway.
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    __aventoAnalyticsLoaded?: boolean;
  }
}

/**
 * Load analytics tags. Called ONLY on explicit consent.
 *
 * Tags are injected as external <script> elements from our own bundle code
 * (allowed by CSP as our first-party JS), pointing at the allowlisted analytics
 * origins — no inline <script> tags, so this stays compatible with a future
 * nonce-based strict CSP. IDs come from public env; if unset, this is a no-op,
 * so the gate is safe to ship before analytics is configured.
 */
function loadAnalytics(): void {
  if (typeof window === "undefined" || window.__aventoAnalyticsLoaded) return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!gaId && !pixelId) return; // nothing configured yet (prototype)

  window.__aventoAnalyticsLoaded = true;

  // --- GA4 (gtag) ---
  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args);
    };
    gtag("js", new Date());
    // Consent Mode: analytics only, no ad personalization by default.
    gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "granted",
    });
    gtag("config", gaId, { anonymize_ip: true });

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
  }

  // --- Meta Pixel ---
  if (pixelId) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    // fbq bootstrap runs from our own code (not an inline tag) once loaded.
    s.addEventListener("load", () => {
      const w = window as unknown as { fbq?: (...a: unknown[]) => void };
      if (typeof w.fbq === "function") {
        w.fbq("init", pixelId);
        w.fbq("track", "PageView");
      }
    });
  }
}

export function CookieConsent({
  policyHref = "/privacy",
  message = "We use cookies to analyze traffic and improve your experience. Analytics load only if you accept.",
  policyLinkLabel = "Privacy & Cookie Policy",
  acceptLabel = "Accept",
  declineLabel = "Decline",
}: CookieConsentProps) {
  // Start hidden; decide after mount to avoid an SSR/hydration flash and to
  // read storage only in the browser.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing === "granted") {
      loadAnalytics();
      return;
    }
    if (existing === "denied") return;
    // Reveal the banner only after reading browser-only storage post-mount.
    // This is the correct place to sync UI with an external system (localStorage)
    // and cannot run during SSR; a one-off setState here is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  function accept() {
    persistConsent("granted");
    setVisible(false);
    loadAnalytics();
  }

  function decline() {
    persistConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white p-4 shadow-lg dark:border-white/15 dark:bg-zinc-900"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-700 dark:text-zinc-200">
          {message}{" "}
          <a
            href={policyHref}
            className="font-medium underline underline-offset-2"
          >
            {policyLinkLabel}
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
          >
            {declineLabel}
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
