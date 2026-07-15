import { useTranslations } from "next-intl";

const steps = ["request", "prep", "deal"] as const;

export function SellSteps() {
  const t = useTranslations("Sell");

  return (
    <section className="block how">
      <div className="wrap">
        <p className="eyebrow">{t("steps_eyebrow")}</p>
        <h2 className="sec">{t("steps_title")}</h2>
        <p className="sec-lede">{t("steps_lede")}</p>
        <div className="steps">
          {steps.map((k) => (
            <div key={k} className="step">
              <h5>{t(`step_${k}_title`)}</h5>
              <p>{t(`step_${k}_body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
