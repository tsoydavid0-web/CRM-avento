import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { districtSlugs, routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

// Only the known districts are valid; any other slug 404s (no on-demand render).
export const dynamicParams = false;

export function generateStaticParams() {
  return districtSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/[locale]/districts/[slug]">,
): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const t = await getTranslations({ locale, namespace: "Districts" });
  const name = t(`d_${slug}_name`);
  return {
    title: t("lr_meta_title", { name }),
    description: t("lr_meta_desc", { name }),
  };
}

/**
 * District long-read (`/districts/[slug]`). Layout is final; the body is a
 * placeholder draft (David: "создай страницу и текст-заглушку") — the header,
 * "who for", pros and cons are real (shared with the overview carousel), the
 * essay sections are stubs to be replaced with final copy. Prices and short-let
 * (AL) rules belong HERE, not in the overview.
 */
export default async function DistrictLongRead(
  props: PageProps<"/[locale]/districts/[slug]">,
) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Districts" });
  const name = t(`d_${slug}_name`);

  return (
    <>
      {/* Hero */}
      <section className="block buy-hero">
        <div className="wrap">
          <p className="eyebrow">{t("lr_eyebrow")}</p>
          <h1>{name}</h1>
          <p className="sub">{t(`d_${slug}_known`)}</p>
          <p className="forwho lr-forwho">{t(`d_${slug}_forwho`)}</p>
          <div className="photo-slot cover" role="img" aria-label={name}>
            <span className="ps-ic" aria-hidden="true">
              🏙️
            </span>
            <span className="ps-lab">{t("lr_photo_lab")}</span>
            <span className="ps-hint">{t("lr_photo_hint")}</span>
          </div>
        </div>
      </section>

      {/* Body (placeholder draft) */}
      <section className="block">
        <div className="wrap lr-narrow">
          <p className="lr-ph-note">✍️ {t("lr_draft_note")}</p>

          <h2 className="sec">{t("lr_intro_h")}</h2>
          <div className="lr-prose">
            <p>{t("lr_intro_p1", { name })}</p>
            <p>{t("lr_intro_p2")}</p>
          </div>

          <h2 className="sec">{t("lr_vibe_h")}</h2>
          <div className="lr-prose">
            <p>{t("lr_ph_body")}</p>
          </div>

          <h2 className="sec">{t("lr_who_h")}</h2>
          <div className="lr-prose">
            <p>{t("lr_ph_body")}</p>
          </div>

          <h2 className="sec">{t("lr_price_h")}</h2>
          <div className="lr-prose">
            <p>{t("lr_price_ph")}</p>
          </div>

          {/* Pros / cons — real, shared with the overview card. */}
          <div className="lr-pc">
            <div>
              <p className="dpc-h dpc-pro">{t("pros")}</p>
              <ul className="lr-list">
                <li>{t(`d_${slug}_pro1`)}</li>
                <li>{t(`d_${slug}_pro2`)}</li>
              </ul>
            </div>
            <div>
              <p className="dpc-h dpc-con">{t("cons")}</p>
              <ul className="lr-list">
                <li>{t(`d_${slug}_con`)}</li>
              </ul>
            </div>
          </div>

          <h2 className="sec">{t("lr_al_h")}</h2>
          <div className="lr-prose">
            <p>{t("lr_al_ph")}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="block">
        <div className="wrap">
          <div className="invest-card">
            <h2 className="sec">{t("lr_cta_h", { name })}</h2>
            <p className="sec-lede">{t("lr_cta_lede")}</p>
            <div className="dcta-links">
              <Link href={routes.contacts}>{t("lr_cta_btn")} →</Link>
              <Link href={routes.districts}>{t("lr_back")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
