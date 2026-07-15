"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Link } from "@/i18n/navigation";

/**
 * District cards as a left/right swipe carousel (native CSS scroll-snap for the
 * swipe/drag; the arrow buttons scroll by one card). Curated character only —
 * NO prices and NO short-let (AL) labels in the overview (David's rule); prices
 * and AL zoning live in each district long-read.
 *
 * `s` = marker positions (0–100%) on the three character axes below. Text is
 * pulled from the `Districts` namespace by slug so RU/EN stay in the JSON.
 */
const DISTRICTS = [
  { slug: "foz", s: [15, 20, 95] },
  { slug: "cedofeita", s: [85, 35, 60] },
  { slug: "bonfim", s: [60, 80, 35] },
  { slug: "boavista", s: [55, 30, 75] },
  { slug: "campanha", s: [40, 95, 10] },
  { slug: "matosinhos", s: [50, 60, 45] },
  { slug: "maia", s: [25, 55, 30] },
] as const;

/** Shared character axes (low ↔ high) rendered on every card. */
const SCALES = [
  ["sc1_lo", "sc1_hi"],
  ["sc2_lo", "sc2_hi"],
  ["sc3_lo", "sc3_hi"],
] as const;

export function DistrictsCarousel() {
  const t = useTranslations("Districts");
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".dcard");
    const step = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className="dcarousel">
      <div className="dcar-head">
        <p className="dcar-hint">{t("swipe_hint")}</p>
        <div className="dcar-nav">
          <button
            type="button"
            className="dnav-btn"
            aria-label={t("prev")}
            onClick={() => scrollByCard(-1)}
          >
            ←
          </button>
          <button
            type="button"
            className="dnav-btn"
            aria-label={t("next")}
            onClick={() => scrollByCard(1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="dtrack" ref={trackRef}>
        {DISTRICTS.map((d) => (
          <article key={d.slug} className="dcard">
            <div className="dtile" aria-hidden="true" />
            <div className="dbody">
              <h3 className="dn">{t(`d_${d.slug}_name`)}</h3>
              <p className="known">{t(`d_${d.slug}_known`)}</p>
              <p className="forwho">{t(`d_${d.slug}_forwho`)}</p>

              <div className="dscales">
                {SCALES.map(([lo, hi], i) => (
                  <div className="dscale" key={lo}>
                    <span className="dsc-lab">{t(lo)}</span>
                    <span className="dsc-track">
                      <span className="dsc-mk" style={{ left: `${d.s[i]}%` }} />
                    </span>
                    <span className="dsc-lab dsc-hi">{t(hi)}</span>
                  </div>
                ))}
              </div>

              <div className="dpc">
                <p className="dpc-h dpc-pro">{t("pros")}</p>
                <ul>
                  <li>{t(`d_${d.slug}_pro1`)}</li>
                  <li>{t(`d_${d.slug}_pro2`)}</li>
                </ul>
                <p className="dpc-h dpc-con">{t("cons")}</p>
                <ul>
                  <li>{t(`d_${d.slug}_con`)}</li>
                </ul>
              </div>
            </div>
            <div className="dcta">
              <Link href={`/districts/${d.slug}`}>{t("card_more")} →</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
