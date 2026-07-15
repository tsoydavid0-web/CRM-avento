import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { brand } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/site-settings";

import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: LayoutProps<"/[locale]">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: {
      default: t("title"),
      template: `%s · ${brand.name}`,
    },
    description: t("description"),
  };
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const messages = await getMessages();

  // Render per request so the admin catalog toggle (below) takes effect live
  // instead of being baked into static HTML at build time.
  await connection();
  // Admin-controlled: show the property catalog + its nav link only when on.
  const { showCatalog } = await getSiteSettings();

  // LTR for ru/en today; a future `he` locale would flip this to `rtl`.
  const dir = "ltr";

  // Cookie-banner copy (kept inline for now; can move into messages/*.json later).
  const cookie =
    locale === "ru"
      ? {
          message:
            "Мы используем cookie для аналитики — только с вашего согласия.",
          policyLinkLabel: "Политика cookie",
          acceptLabel: "Принять",
          declineLabel: "Отклонить",
        }
      : {
          message: "We use cookies for analytics — only with your consent.",
          policyLinkLabel: "Cookie policy",
          acceptLabel: "Accept",
          declineLabel: "Decline",
        };

  return (
    <html lang={locale} dir={dir} className="h-full">
      <head>
        <link
          rel="preload"
          href="/fonts/rubik-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/rubik-bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {locale === "en" && (
          <link
            rel="preload"
            href="/fonts/neue-einstellung-bold.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages}>
          <Header showCatalog={showCatalog} />
          <main>{props.children}</main>
          <Footer />
          <CookieConsent
            policyHref={`/${locale}/privacy`}
            message={cookie.message}
            policyLinkLabel={cookie.policyLinkLabel}
            acceptLabel={cookie.acceptLabel}
            declineLabel={cookie.declineLabel}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
