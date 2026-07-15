import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/home/LeadForm";
import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

const timeline = ["t1", "t2", "t3", "t4", "t5"] as const;
const roleItems = ["a1", "a2", "a3"] as const;
const ruleCards = [
  { k: "r1", tone: "red" },
  { k: "r2", tone: "amber" },
  { k: "r3", tone: "green" },
  { k: "r4", tone: "red" },
] as const;

export async function generateMetadata(
  props: PageProps<"/[locale]/relocation">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Relocation" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function RelocationPage(
  props: PageProps<"/[locale]/relocation">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Relocation" });

  const options = ["d7", "d8", "unsure"].map((value) => ({
    value,
    label: t(`int_${value}`),
  }));

  const visaCard = (key: "d7" | "d8") => (
    <div className="visa-card">
      <span className="visa-ic" aria-hidden="true">
        {t(`${key}_ic`)}
      </span>
      <h3 className="visa-name">{t(`${key}_name`)}</h3>
      <p className="visa-tag">{t(`${key}_tag`)}</p>
      <p className="visa-who">{t(`${key}_who`)}</p>
      <p className="visa-amt">{t(`${key}_amount`)}</p>
      <p className="visa-amt-note">{t(`${key}_amount_note`)}</p>
      <ul className="lr-list">
        {(t.raw(`${key}_reqs`) as string[]).map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {/* Hero */}
      <section className="block buy-hero">
        <div className="wrap">
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h1>{t("hero_title")}</h1>
          <p className="sub">{t("hero_lede")}</p>
          <div className="hero-ctas">
            <Link className="btn btn-primary" href={routes.contacts}>
              {t("hero_cta1")}
            </Link>
            <a className="btn btn-secondary" href="#visas">
              {t("hero_cta2")}
            </a>
          </div>
          <p className="warn-note">{t("hero_warn")}</p>
        </div>
      </section>

      {/* D7 vs D8 */}
      <section className="block how" id="visas">
        <div className="wrap">
          <p className="eyebrow">{t("visa_eyebrow")}</p>
          <h2 className="sec">{t("visa_title")}</h2>
          <p className="sec-lede">{t("visa_lede")}</p>
          <div className="visa-grid">
            {visaCard("d7")}
            {visaCard("d8")}
          </div>
          <p className="vs-tip">{t("visa_tip")}</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="block">
        <div className="wrap">
          <p className="eyebrow">{t("tl_eyebrow")}</p>
          <h2 className="sec">{t("tl_title")}</h2>
          <p className="sec-lede">{t("tl_lede")}</p>
          <ol className="tline">
            {timeline.map((s, i) => (
              <li className={`tstep${s === "t5" ? " gold" : ""}`} key={s}>
                <span className="tstep-n" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="tstep-body">
                  <h4>{t(`${s}_h`)}</h4>
                  <p>{t(`${s}_d`)}</p>
                </div>
                <span className="tstep-m">{t(`${s}_m`)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 2026 rules */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("rules_eyebrow")}</p>
          <h2 className="sec">{t("rules_title")}</h2>
          <p className="sec-lede">{t("rules_lede")}</p>
          <div className="router">
            {ruleCards.map(({ k, tone }) => (
              <div className="rcard" key={k}>
                <span className={`rule-label ${tone}`}>{t(`${k}_label`)}</span>
                <h4>{t(`${k}_title`)}</h4>
                <p>{t(`${k}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avento's role */}
      <section className="block">
        <div className="wrap">
          <p className="eyebrow">{t("role_eyebrow")}</p>
          <h2 className="sec">{t("role_title")}</h2>
          <p className="sec-lede">{t("role_lede")}</p>
          <div className="router">
            {roleItems.map((k) => (
              <div className="rcard" key={k}>
                <h4>{t(`${k}_t`)}</h4>
                <p>{t(`${k}_d`)}</p>
              </div>
            ))}
          </div>
          <div className="invest-card reloc-cta">
            <h3 className="sec">{t("role_cta_h")}</h3>
            <p className="sec-lede">{t("role_cta_d")}</p>
            <a className="btn btn-primary" href="#capture">
              {t("role_cta_btn")}
            </a>
          </div>
        </div>
      </section>

      {/* Lead CTA */}
      <LeadForm
        source="relocation"
        showCity={false}
        showBudget={false}
        showMortgage={false}
        heading={t("lead_heading")}
        lede={t("lead_lede")}
        submitLabel={t("lead_submit")}
        interestOptions={options}
        interestPlaceholder={t("int_placeholder")}
        interestAria={t("int_aria")}
      />

      <section className="block reloc-disc-wrap">
        <div className="wrap">
          <p className="strat-disc">{t("disclaimer")}</p>
        </div>
      </section>
    </>
  );
}
