import { useTranslations } from "next-intl";

export function ServicesHero() {
  const t = useTranslations("Services");

  return (
    <section className="block buy-hero">
      <div className="wrap">
        <p className="eyebrow">{t("hero_eyebrow")}</p>
        <h1>{t("hero_title")}</h1>
        <p className="sub">{t("hero_lede")}</p>
        {/* Same-page anchor to the lead form section (id="capture"). */}
        <a className="btn btn-primary" href="#capture">
          {t("hero_cta")}
        </a>
      </div>
    </section>
  );
}
