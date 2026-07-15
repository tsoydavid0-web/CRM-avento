import { useTranslations } from "next-intl";

export function WhoWeAre() {
  const t = useTranslations("WhoWeAre");

  const stats = [
    { num: t("num1"), cap: t("cap1"), placeholder: true },
    { num: t("num2"), cap: t("cap2"), placeholder: true },
    { num: t("num3"), cap: t("cap3"), placeholder: false },
  ];

  return (
    <section
      className="block"
      id="team"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="sec">{t("title")}</h2>
        <div className="whous-grid">
          <div>
            <p className="sec-lede" style={{ marginBottom: 0 }}>
              {t("body")}
            </p>
            <div className="stats">
              {stats.map((stat, i) => (
                <div key={i} className="stat">
                  <div className="num">{stat.num}</div>
                  <div className="scap">
                    {stat.cap}{" "}
                    {stat.placeholder && (
                      <span
                        className="placeholder-tag"
                        style={{
                          color: "var(--muted)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {t("statPlaceholder")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="team-ph">
            <div className="azuc" />
            <div className="cap">{t("teamCaption")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
