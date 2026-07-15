import { useTranslations } from "next-intl";

export function Reviews() {
  const t = useTranslations("Reviews");
  const items = [1, 2, 3] as const;

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="sec">{t("title")}</h2>
        <p className="sec-lede">{t("lede")}</p>
        <div className="tgrid">
          {items.map((i) => (
            <div key={i} className="tcard">
              <p>{t(`q${i}`)}</p>
              <div className="who">
                <span className="av" />
                {t(`a${i}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
