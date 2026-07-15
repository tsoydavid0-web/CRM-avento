import { useTranslations } from "next-intl";

const steps = ["intro", "viewings", "reserve", "closing", "keys"] as const;
const chips = ["chip1", "chip2", "chip3", "chip4"] as const;

export function ServicesSteps() {
  const t = useTranslations("Services");

  return (
    <section className="block">
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
        <ul className="hero-chips" style={{ marginTop: "30px" }}>
          {chips.map((c) => (
            <li key={c}>
              <span className="dot" aria-hidden="true">
                ◆
              </span>{" "}
              {t(c)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
