import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/home/LeadForm";
import { TaxCalculator } from "@/components/taxes/TaxCalculator";
import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

const costCards = [
  { slug: "imt", ic: "🏛️" },
  { slug: "selo", ic: "📄" },
  { slug: "notary", ic: "✍️" },
  { slug: "lawyer", ic: "⚖️" },
  { slug: "avento", ic: "🤝" },
] as const;

const annualCards = ["imi", "aimi", "rent"] as const;
const mvCards = ["res", "nr", "reduce"] as const;
const jovemReqs = [1, 2, 3, 4, 5] as const;
const jovemBands = [1, 2, 3] as const;
const faqItems = [1, 2, 3, 4, 5, 6] as const;

export async function generateMetadata(
  props: PageProps<"/[locale]/taxes">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Taxes" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function TaxesPage(props: PageProps<"/[locale]/taxes">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Taxes" });

  const situations = ["res35", "nonres", "relocation", "exploring"].map(
    (value) => ({ value, label: t(`sit_${value}`) }),
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
            <a className="btn btn-primary" href="#calc">
              {t("hero_cta_calc")}
            </a>
            <Link className="btn btn-secondary" href={routes.contacts}>
              {t("hero_cta_consult")}
            </Link>
          </div>
          <ul className="hero-chips">
            <li>
              <span className="dot" aria-hidden="true">
                📊
              </span>{" "}
              {t("hero_source")}
            </li>
          </ul>
          <div className="quick-row">
            <div className="quick">
              <span className="quick-n">{t("quick_1_n")}</span>
              <span className="quick-l">{t("quick_1_l")}</span>
            </div>
            <div className="quick">
              <span className="quick-n">{t("quick_2_n")}</span>
              <span className="quick-l">{t("quick_2_l")}</span>
            </div>
            <div className="quick">
              <span className="quick-n">{t("quick_3_n")}</span>
              <span className="quick-l">{t("quick_3_l")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* One-off purchase costs */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("costs_eyebrow")}</p>
          <h2 className="sec">{t("costs_title")}</h2>
          <p className="sec-lede">{t("costs_lede")}</p>
          <div className="cost-grid">
            {costCards.map((c) => (
              <div className="cost-card" key={c.slug}>
                <span className="cost-ic" aria-hidden="true">
                  {c.ic}
                </span>
                <div className="cost-top">
                  <h4>{t(`cost_${c.slug}_title`)}</h4>
                  <span className="cost-amt">{t(`cost_${c.slug}_amt`)}</span>
                </div>
                <p className="cost-desc">{t(`cost_${c.slug}_desc`)}</p>
                <span className="cost-who">{t(`cost_${c.slug}_who`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="block">
        <div className="wrap">
          <p className="eyebrow">{t("calc_eyebrow")}</p>
          <h2 className="sec">{t("calc_title")}</h2>
          <p className="sec-lede">{t("calc_lede")}</p>
          <TaxCalculator />
        </div>
      </section>

      {/* IMT Jovem relief */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("jovem_eyebrow")}</p>
          <h2 className="sec">{t("jovem_title")}</h2>
          <div className="lr-narrow">
            <div className="lr-prose">
              <p>{t("jovem_lede")}</p>
            </div>
          </div>
          <div className="router">
            <div className="rcard">
              <h4>{t("jovem_req_h")}</h4>
              <ul className="lr-list">
                {jovemReqs.map((n) => (
                  <li key={n}>{t(`jovem_req_${n}`)}</li>
                ))}
              </ul>
            </div>
            <div className="rcard">
              <h4>{t("jovem_save_h")}</h4>
              <ul className="band-list">
                {jovemBands.map((n) => (
                  <li key={n}>
                    <span className="band-k">{t(`jovem_band_${n}_k`)}</span>
                    <span className="band-v">{t(`jovem_band_${n}_v`)}</span>
                  </li>
                ))}
              </ul>
              <p className="band-ex">{t("jovem_example")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Annual ownership taxes */}
      <section className="block">
        <div className="wrap">
          <p className="eyebrow">{t("annual_eyebrow")}</p>
          <h2 className="sec">{t("annual_title")}</h2>
          <p className="sec-lede">{t("annual_lede")}</p>
          <div className="router">
            {annualCards.map((slug) => (
              <div className="rcard" key={slug}>
                <h4>{t(`an_${slug}_title`)}</h4>
                <span className="cost-amt">{t(`an_${slug}_amt`)}</span>
                <p>{t(`an_${slug}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capital gains (mais-valias) */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("mv_eyebrow")}</p>
          <h2 className="sec">{t("mv_title")}</h2>
          <p className="sec-lede">{t("mv_lede")}</p>
          <div className="router">
            {mvCards.map((slug) => (
              <div className="rcard" key={slug}>
                <h4>{t(`mv_${slug}_title`)}</h4>
                <p>{t(`mv_${slug}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="block">
        <div className="wrap lr-narrow">
          <p className="eyebrow">{t("faq_eyebrow")}</p>
          <h2 className="sec">{t("faq_title")}</h2>
          <div className="faq">
            {faqItems.map((n) => (
              <details className="faq-item" key={n}>
                <summary className="faq-q">{t(`faq_q${n}`)}</summary>
                <div className="faq-a">
                  <p>{t(`faq_a${n}`)}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Lead CTA */}
      <LeadForm
        source="taxes"
        showCity={false}
        showBudget={false}
        showMortgage={false}
        heading={t("lead_heading")}
        lede={t("lead_lede")}
        submitLabel={t("lead_submit")}
        interestOptions={situations}
        interestPlaceholder={t("sit_placeholder")}
        interestAria={t("sit_aria")}
      />
    </>
  );
}
