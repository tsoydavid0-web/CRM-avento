import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DistrictsCarousel } from "@/components/districts/DistrictsCarousel";
import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(
  props: PageProps<"/[locale]/districts">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Districts" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function DistrictsPage(
  props: PageProps<"/[locale]/districts">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Districts" });

  return (
    <>
      {/* Hero */}
      <section className="block buy-hero">
        <div className="wrap">
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h1>{t("hero_title")}</h1>
          <p className="sub">{t("hero_lede")}</p>
          <ul className="hero-chips">
            <li>
              <span className="dot" aria-hidden="true">
                🧭
              </span>{" "}
              {t("hero_chip")}
            </li>
          </ul>
        </div>
      </section>

      {/* Swipe carousel of districts */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("cards_eyebrow")}</p>
          <h2 className="sec">{t("cards_title")}</h2>
          <p className="sec-lede">{t("cards_lede")}</p>
          <DistrictsCarousel />
          <p className="dnote">{t("method_note")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="block">
        <div className="wrap">
          <div className="invest-card">
            <h2 className="sec">{t("cta_title")}</h2>
            <p className="sec-lede">{t("cta_lede")}</p>
            <div className="dcta-links">
              <Link href={routes.contacts}>{t("cta_pick")} →</Link>
              <Link href={routes.taxes}>{t("cta_mortgage")} →</Link>
              <Link href={routes.taxes}>{t("cta_taxes")} →</Link>
              <Link href={routes.investors}>{t("cta_yield")} →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
