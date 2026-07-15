import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/home/LeadForm";
import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

const summaryCards = [
  { k: "sc1", ic: "🏠", n: "1" },
  { k: "sc2", ic: "📈", n: "2" },
  { k: "sc3", ic: "🔑", n: "3" },
  { k: "sc4", ic: "🏗️", n: "4" },
] as const;

const renoCards = ["s4_c1", "s4_c2", "s4_c3", "s4_c4"] as const;
const procCards = ["proc_1", "proc_2", "proc_3", "proc_4"] as const;

function DataTable({ rows }: { rows: string[][] }) {
  const [head, ...body] = rows;
  return (
    <div className="tbl-wrap">
      <table className="dtbl">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function generateMetadata(
  props: PageProps<"/[locale]/investors">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Investors" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function InvestorsPage(
  props: PageProps<"/[locale]/investors">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Investors" });

  const params = (key: string) => t.raw(key) as [string, string][];
  const bullets = (key: string) => t.raw(key) as string[];

  const strategies = ["rent", "flip", "own", "reno"].map((value) => ({
    value,
    label: t(`int_${value}`),
  }));

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
            <a className="btn btn-secondary" href="#strats">
              {t("hero_cta2")}
            </a>
          </div>
          <p className="quick-eyebrow">{t("quick_eyebrow")}</p>
          <div className="quick-row">
            {[1, 2, 3].map((n) => (
              <div className="quick" key={n}>
                <span className="quick-n">{t(`quick_${n}_n`)}</span>
                <span className="quick-l">{t(`quick_${n}_l`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("market_eyebrow")}</p>
          <h2 className="sec">{t("market_title")}</h2>
          <p className="sec-lede">{t("market_intro")}</p>

          <h3 className="tbl-h">{t("country_h")}</h3>
          <DataTable rows={t.raw("countryTable") as string[][]} />
          <p className="dnote">{t("country_note")}</p>

          <h3 className="tbl-h">{t("porto_h")}</h3>
          <DataTable rows={t.raw("portoTable") as string[][]} />
          <p className="dnote">{t("porto_note")}</p>
          <p className="strat-disc">{t("sources")}</p>
        </div>
      </section>

      {/* Strategy summary */}
      <section className="block" id="strats">
        <div className="wrap">
          <h2 className="sec">{t("strat_title")}</h2>
          <p className="sec-lede">{t("strat_lede")}</p>
          <div className="router">
            {summaryCards.map((c) => (
              <div className="rcard" key={c.k}>
                <span className="rnum">{c.n}</span>
                <span className="rico" aria-hidden="true">
                  {c.ic}
                </span>
                <h4>{t(`${c.k}_title`)}</h4>
                <p>{t(`${c.k}_desc`)}</p>
                <span className="rbadge">{t(`${c.k}_badge`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy 1 — rent */}
      <section className="block how">
        <div className="wrap">
          <span className="strat-num">1</span>
          <h2 className="sec">{t("s1_title")}</h2>
          <p className="strat-badge">{t("s1_badge")}</p>
          <p className="sec-lede">{t("s1_desc")}</p>
          <div className="strat-params">
            {params("s1_params").map(([k, v]) => (
              <div key={k}>
                <span className="sp-k">{k}</span>
                <span className="sp-v">{v}</span>
              </div>
            ))}
          </div>
          <DataTable rows={t.raw("rentTable") as string[][]} />
          <p className="strat-sum">{t("s1_sum")}</p>
          <p className="strat-disc">{t("s1_disc")}</p>
        </div>
      </section>

      {/* Strategy 2 — flip */}
      <section className="block">
        <div className="wrap">
          <span className="strat-num">2</span>
          <h2 className="sec">{t("s2_title")}</h2>
          <p className="strat-badge">{t("s2_badge")}</p>
          <p className="sec-lede">{t("s2_desc")}</p>
          <div className="strat-params">
            {params("s2_params").map(([k, v]) => (
              <div key={k}>
                <span className="sp-k">{k}</span>
                <span className="sp-v">{v}</span>
              </div>
            ))}
          </div>
          <DataTable rows={t.raw("flipTable") as string[][]} />
          <p className="strat-sum">{t("s2_sum")}</p>
          <p className="strat-disc">{t("s2_disc")}</p>
        </div>
      </section>

      {/* Strategy 3 — own vs rent */}
      <section className="block how">
        <div className="wrap">
          <span className="strat-num">3</span>
          <h2 className="sec">{t("s3_title")}</h2>
          <p className="strat-badge">{t("s3_badge")}</p>
          <p className="sec-lede">{t("s3_desc")}</p>
          <div className="vs-grid">
            <div className="vs-card red">
              <h4>{t("s3_rent_t")}</h4>
              <p className="vs-amt">{t("s3_rent_amt")}</p>
              <p className="vs-sub">{t("s3_rent_sub")}</p>
              <ul className="vs-list">
                {bullets("s3_rent_bullets").map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="vs-card green">
              <h4>{t("s3_buy_t")}</h4>
              <p className="vs-amt">{t("s3_buy_amt")}</p>
              <p className="vs-sub">{t("s3_buy_sub")}</p>
              <ul className="vs-list">
                {bullets("s3_buy_bullets").map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="vs-tip">{t("s3_tip")}</p>
          <p className="strat-disc">{t("s3_disc")}</p>
        </div>
      </section>

      {/* Strategy 4 — renovation */}
      <section className="block">
        <div className="wrap">
          <span className="strat-num">4</span>
          <h2 className="sec">{t("s4_title")}</h2>
          <p className="strat-badge">{t("s4_badge")}</p>
          <p className="sec-lede">{t("s4_desc")}</p>
          <div className="router">
            {renoCards.map((k) => {
              const badge = t(`${k}_b`);
              return (
                <div className="rcard" key={k}>
                  <h4>{t(`${k}_t`)}</h4>
                  <p>{t(`${k}_d`)}</p>
                  {badge && <span className="rbadge">{badge}</span>}
                </div>
              );
            })}
          </div>
          <p className="dnote">{t("s4_note")}</p>
        </div>
      </section>

      {/* Process */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("proc_eyebrow")}</p>
          <h2 className="sec">{t("proc_title")}</h2>
          <p className="sec-lede">{t("proc_lede")}</p>
          <div className="router">
            {procCards.map((k) => (
              <div className="rcard" key={k}>
                <h4>{t(`${k}_t`)}</h4>
                <p>{t(`${k}_d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead CTA */}
      <LeadForm
        source="investors"
        showCity={false}
        showBudget={false}
        showMortgage={false}
        heading={t("lead_heading")}
        lede={t("lead_lede")}
        submitLabel={t("lead_submit")}
        interestOptions={strategies}
        interestPlaceholder={t("int_placeholder")}
        interestAria={t("int_aria")}
      />
    </>
  );
}
