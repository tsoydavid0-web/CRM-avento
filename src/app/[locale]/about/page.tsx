import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

const values = [
  { k: "transp", ic: "🔍" },
  { k: "buyer", ic: "🤝" },
  { k: "porto", ic: "📍" },
  { k: "honesty", ic: "✓" },
] as const;
const team = ["founder", "sourcing", "deal", "rental"] as const;
const stats = ["years", "deals", "ami"] as const;

export async function generateMetadata(
  props: PageProps<"/[locale]/about">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function AboutPage(props: PageProps<"/[locale]/about">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <>
      {/* Hero + team photo */}
      <section className="block buy-hero">
        <div className="wrap">
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h1>{t("hero_title")}</h1>
          <p className="sub">{t("hero_lede")}</p>
          <a className="btn btn-primary" href="#team">
            {t("hero_cta")}
          </a>
          <div
            className="photo-slot cover"
            role="img"
            aria-label={t("teamphoto_lab")}
          >
            <span className="ps-ic" aria-hidden="true">
              📸
            </span>
            <span className="ps-lab">{t("teamphoto_lab")}</span>
            <span className="ps-hint">{t("teamphoto_hint")}</span>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="block">
        <div className="wrap lr-narrow">
          <p className="eyebrow">{t("approach_eyebrow")}</p>
          <h2 className="sec">{t("approach_title")}</h2>
          <div className="lr-prose">
            <p>{t("approach_p1")}</p>
            <p>{t("approach_p2")}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("values_eyebrow")}</p>
          <h2 className="sec">{t("values_title")}</h2>
          <p className="sec-lede">{t("values_lede")}</p>
          <div className="router">
            {values.map((v) => (
              <div key={v.k} className="rcard">
                <span className="rico" aria-hidden="true">
                  {v.ic}
                </span>
                <h4>{t(`val_${v.k}_title`)}</h4>
                <p>{t(`val_${v.k}_body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="block" id="team">
        <div className="wrap">
          <p className="eyebrow">{t("team_eyebrow")}</p>
          <h2 className="sec">{t("team_title")}</h2>
          <p className="sec-lede">{t("team_lede")}</p>
          <div className="router">
            {team.map((m) => (
              <div key={m} className="rcard member-card">
                <div className="member-av" aria-hidden="true">
                  👤
                </div>
                <span className="member-name">{t("member_name_ph")}</span>
                <span className="member-role">{t(`member_${m}_role`)}</span>
                <p>{t(`member_${m}_body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("trust_eyebrow")}</p>
          <h2 className="sec">{t("trust_title")}</h2>
          <div className="whous-grid">
            <div>
              <p className="sec-lede">{t("trust_body")}</p>
              <div className="stats">
                {stats.map((s) => (
                  <div key={s} className="stat">
                    <span className="num">{t(`stat_${s}_num`)}</span>
                    <span className="scap">
                      {t(`stat_${s}_cap`)}{" "}
                      <span className="placeholder-tag">{t("ph")}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="team-ph">
              <div className="azuc" aria-hidden="true" />
              <span className="cap">{t("officephoto_cap")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="block">
        <div className="wrap">
          <div className="invest-card">
            <h2 className="sec">{t("cta_title")}</h2>
            <p className="sec-lede">{t("cta_lede")}</p>
            <Link className="btn btn-primary" href={routes.contacts}>
              {t("cta_btn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
