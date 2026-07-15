import { useTranslations } from "next-intl";

const reasons = [
  { k: "market", ic: "📈" },
  { k: "eu", ic: "🇪🇺" },
  { k: "rent", ic: "💶" },
  { k: "side", ic: "🤝" },
] as const;

export function BuyHero() {
  const t = useTranslations("Buy");

  return (
    <section className="block buy-hero">
      <div className="wrap">
        <p className="eyebrow">{t("hero_eyebrow")}</p>
        <h1>{t("hero_title")}</h1>
        <p className="sub">{t("hero_lede")}</p>
        <ul className="buy-reasons">
          {reasons.map((r) => (
            <li key={r.k}>
              <span className="ic" aria-hidden="true">
                {r.ic}
              </span>
              <span>{t(`hero_r_${r.k}`)}</span>
            </li>
          ))}
        </ul>
        {/* Same-page anchor to the lead form section (id="capture"). */}
        <a className="btn btn-primary" href="#capture">
          {t("hero_cta")}
        </a>
      </div>
    </section>
  );
}
