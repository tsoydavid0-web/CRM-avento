import { useTranslations } from "next-intl";

import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

const strategies = ["rent", "flip", "own", "reno"] as const;

export function InvestPromo() {
  const t = useTranslations("Buy");

  return (
    <section className="block">
      <div className="wrap">
        <div className="invest-card">
          <p className="eyebrow">{t("invest_eyebrow")}</p>
          <h2 className="sec">{t("invest_title")}</h2>
          <div className="strats">
            {strategies.map((k) => (
              <span key={k}>{t(`invest_${k}`)}</span>
            ))}
          </div>
          <p className="sec-lede">{t("invest_lede")}</p>
          <Link className="btn btn-secondary" href={routes.investors}>
            {t("invest_cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
