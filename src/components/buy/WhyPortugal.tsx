import { useTranslations } from "next-intl";

const reasons = [
  { k: "market", ic: "📈" },
  { k: "rent", ic: "💶" },
  { k: "eu", ic: "🇪🇺" },
  { k: "ocean", ic: "🌊" },
  { k: "rules", ic: "🔒" },
  { k: "side", ic: "🤝" },
] as const;

export function WhyPortugal() {
  const t = useTranslations("Buy");

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">{t("why_eyebrow")}</p>
        <h2 className="sec">{t("why_title")}</h2>
        <p className="sec-lede">{t("why_lede")}</p>
        <div className="router">
          {reasons.map((r) => (
            <div key={r.k} className="rcard">
              <span className="rico" aria-hidden="true">
                {r.ic}
              </span>
              <h4>{t(`why_${r.k}_title`)}</h4>
              <p>{t(`why_${r.k}_body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
