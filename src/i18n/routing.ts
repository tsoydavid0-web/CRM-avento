import { defineRouting } from "next-intl/routing";

/**
 * Avento i18n routing.
 *
 * Sitewide locales. RU + EN ship now; the architecture is intentionally kept
 * ready for a future `he` (Hebrew, RTL) locale — adding it here + a messages
 * catalog + an `dir` switch in the layout is all that's required later.
 */
export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix the URL with the locale (/ru, /en) so the active language is
  // explicit and shareable.
  localePrefix: "always",
});
