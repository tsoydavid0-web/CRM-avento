import { useTranslations } from "next-intl";

const reasons = [
  { k: "abroad", ic: "🌍" },
  { k: "premium", ic: "📸" },
  { k: "idealista", ic: "📣" },
  { k: "turnkey", ic: "🔑" },
] as const;

export function SellHero() {
  const t = useTranslations("Sell");

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
        <ul className="hero-chips">
          <li>
            <span className="dot" aria-hidden="true">
              ◆
            </span>{" "}
            {t("chip_ami")}
          </li>
          <li>
            <span className="dot" aria-hidden="true">
              ◆
            </span>{" "}
            {t("chip_local")}
          </li>
          <li>
            <span className="dot" aria-hidden="true">
              ◆
            </span>{" "}
            {t("chip_free")}
          </li>
        </ul>
        {/* Same-page anchor to the valuation form (id="capture"). */}
        <a className="btn btn-primary" href="#capture">
          {t("hero_cta")}
        </a>
      </div>
    </section>
  );
}
