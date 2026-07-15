import { useTranslations } from "next-intl";

import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function HowWeWork() {
  const t = useTranslations("HowWeWork");
  const services = ["search", "turnkey", "rental", "relocation"] as const;
  const steps = ["intro", "viewings", "reservation", "deal", "keys"] as const;

  return (
    <section className="block how" id="how">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="sec">{t("title")}</h2>
        <p className="sec-lede">{t("lede")}</p>

        <div className="services">
          {services.map((s) => (
            <div key={s} className="svc">
              <h4>{t(`svc_${s}_title`)}</h4>
              <p>{t(`svc_${s}_body`)}</p>
            </div>
          ))}
        </div>

        <div className="steps">
          {steps.map((s) => (
            <div key={s} className="step">
              <h5>{t(`step_${s}_title`)}</h5>
              <p>{t(`step_${s}_body`)}</p>
            </div>
          ))}
        </div>

        <div className="tax-teaser">
          <span>{t("taxTeaser")}</span>
          <Link href={routes.taxes}>{t("taxLink")}</Link>
        </div>
      </div>
    </section>
  );
}
