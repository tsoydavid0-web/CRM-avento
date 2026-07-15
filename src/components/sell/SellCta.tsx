import { useTranslations } from "next-intl";

export function SellCta() {
  const t = useTranslations("Sell");

  return (
    <section className="block">
      <div className="wrap">
        <div className="invest-card">
          <h2 className="sec">{t("cta_title")}</h2>
          <p className="sec-lede">{t("cta_lede")}</p>
          <a className="btn btn-primary" href="#capture">
            {t("cta_btn")}
          </a>
        </div>
      </div>
    </section>
  );
}
