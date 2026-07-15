/**
 * Central Avento site configuration: route paths, navigation structure and
 * placeholder brand/contact values.
 *
 * Placeholders (AMI number, contacts, domain) are marked and MUST be replaced
 * with real values once provided — never hardcode secrets here.
 */

/** Canonical route paths (locale prefix is added by next-intl <Link>). */
export const routes = {
  home: "/",
  catalog: "/properties",
  buy: "/buy",
  sell: "/sell",
  services: "/services",
  about: "/about",
  contacts: "/contacts",
  districts: "/districts",
  taxes: "/taxes",
  investors: "/investors",
  relocation: "/relocation",
  journal: "/journal",
} as const;

/**
 * District long-read slugs (`/districts/[slug]`). Order matches the overview
 * carousel. Text for each lives in the `Districts` message namespace under
 * `d_<slug>_*`. Keep this in sync with DISTRICTS in DistrictsCarousel.tsx.
 */
export const districtSlugs = [
  "foz",
  "cedofeita",
  "bonfim",
  "boavista",
  "campanha",
  "matosinhos",
  "maia",
] as const;

export type DistrictSlug = (typeof districtSlugs)[number];

/**
 * Journal articles (`/journal/[slug]`). `key` maps to the `Journal` message
 * namespace (`<key>_title` / `_excerpt` / `_date`); `cat` drives the category
 * filter and cover. Order = newest first (matches the index).
 */
export const journalArticles = [
  { slug: "taxes-2026", key: "a1", cat: "taxes", featured: true },
  { slug: "schools", key: "a2", cat: "life", featured: false },
  { slug: "why-invest", key: "a3", cat: "invest", featured: false },
  { slug: "cost-of-living", key: "a4", cat: "life", featured: false },
  { slug: "visas-d7-d8", key: "a5", cat: "relocation", featured: false },
  { slug: "save-on-buying", key: "a6", cat: "buying", featured: false },
  { slug: "buyer-mistakes", key: "a7", cat: "buying", featured: false },
  { slug: "rent-vs-buy", key: "a8", cat: "invest", featured: false },
  { slug: "short-term-rental", key: "a9", cat: "invest", featured: false },
  { slug: "buying-remotely", key: "a10", cat: "buying", featured: false },
] as const;

export const journalSlugs = journalArticles.map((a) => a.slug);
export type JournalCategory = (typeof journalArticles)[number]["cat"];

/** i18n message key -> href. Labels are resolved via next-intl (namespace `Nav`). */
export type NavItem = { key: string; href: string };

/** Primary sections shown in the header bar and the mega-menu "Sections" column. */
export const primaryNav: NavItem[] = [
  { key: "buy", href: routes.buy },
  { key: "sell", href: routes.sell },
  { key: "services", href: routes.services },
  { key: "about", href: routes.about },
  { key: "contacts", href: routes.contacts },
];

/** Mega-menu "Guides & info" column. */
export const guidesNav: NavItem[] = [
  { key: "districts", href: routes.districts },
  { key: "taxes", href: routes.taxes },
  { key: "investors", href: routes.investors },
  { key: "relocation", href: routes.relocation },
  { key: "journal", href: routes.journal },
];

/**
 * Brand + contact placeholders. Replace with real values when provided.
 * TODO(placeholder): fill AMI licence number, contacts and domain.
 */
export const brand = {
  name: "Avento",
  /** TODO(placeholder): real AMI licence number. */
  amiLicence: "AMI №___",
  /** TODO(placeholder): production domain. */
  domain: "example.com",
  /** TODO(placeholder): real contact channels. */
  contacts: {
    whatsapp: "#",
    telegram: "#",
    email: "hello@example.com",
  },
} as const;
