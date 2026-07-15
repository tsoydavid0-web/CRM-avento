import { useTranslations } from "next-intl";

import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function Districts() {
  const t = useTranslations("Districts");
  const items = [1, 2, 3, 4, 5] as const;

  return (
    <section
      className="block"
      id="districts"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="wrap">
        <div className="head-row">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="sec">{t("title")}</h2>
            <p className="sec-lede">{t("lede")}</p>
          </div>
          <Link className="btn btn-secondary" href={routes.districts}>
            {t("all")}
          </Link>
        </div>
        <div className="districts">
          {items.map((i) => (
            <div key={i} className="dcard">
              <div className="dtile" />
              <div className="dbody">
                <div className="dn">{t(`d${i}_name`)}</div>
                <div className="dm">{t(`d${i}_meta`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
