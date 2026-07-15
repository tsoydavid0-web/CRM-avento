"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

/*
 * Portugal 2026 purchase-tax math (Continente), ported verbatim from the
 * prototype. IMT is progressive by bracket; IMT Jovem fully exempts a first
 * permanent home up to €330,539 for buyers ≤35 who are (or become) PT tax
 * residents. Stamp duty (Imposto do Selo) is 0.8%. Notary/registo are ~fixed.
 * Estimate only — the notary confirms the final figure; not tax advice.
 */
type Mode = "res" | "nr";
type Bracket = readonly [cap: number, rate: number];

const B_PROPRIA: Bracket[] = [
  [106346, 0],
  [145470, 0.02],
  [198347, 0.05],
  [330539, 0.07],
  [660982, 0.08],
];
const B_SECUNDARIA: Bracket[] = [
  [106346, 0.01],
  [145470, 0.02],
  [198347, 0.05],
  [330539, 0.07],
  [633931, 0.08],
];

function layered(v: number, brackets: Bracket[]): number {
  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (v > cap) {
      tax += (cap - prev) * rate;
      prev = cap;
    } else {
      return tax + (v - prev) * rate;
    }
  }
  return tax;
}

/** IMT — habitação própria e permanente (own permanent home, no relief). */
function imtPropria(v: number): number {
  if (v > 1150853) return v * 0.075;
  if (v > 660982) return v * 0.06;
  return layered(v, B_PROPRIA);
}
/** IMT — habitação secundária / investment (non-resident). */
function imtSecundaria(v: number): number {
  if (v > 1150853) return v * 0.075;
  if (v > 633931) return v * 0.06;
  return layered(v, B_SECUNDARIA);
}
/** IMT Jovem — first permanent home, buyer ≤35. */
function imtJovem(v: number): number {
  if (v <= 330539) return 0;
  if (v <= 660982) return (v - 330539) * 0.08;
  return imtPropria(v);
}
/** Stamp duty under the IMT Jovem relief. */
function seloJovem(v: number): number {
  if (v <= 330539) return 0;
  if (v <= 660982) return (v - 330539) * 0.008;
  return v * 0.008;
}

const NOTARY = 700; // escritura + registo (standard deal)
const NOTARY_JOVEM = 300; // registo waived under full relief → notary part only
const LAWYER = 1500; // optional independent legal review (not in the total)

const SLIDER_MIN = 120000;
const SLIDER_MAX = 900000;
const PRICE_MAX = 2000000;

export function TaxCalculator() {
  const t = useTranslations("Taxes");
  const locale = useLocale();
  const [price, setPrice] = useState(300000);
  const [mode, setMode] = useState<Mode>("res");

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB"),
    [locale],
  );
  const fmt = (n: number) => `€ ${nf.format(Math.round(n))}`;

  const r = useMemo(() => {
    const v = price;
    let imt: number;
    let selo: number;
    let notary: number;
    let noteKey: string;
    let noteGood = false;

    if (mode === "res") {
      imt = imtJovem(v);
      selo = seloJovem(v);
      notary = v <= 330539 ? NOTARY_JOVEM : NOTARY;
      if (v <= 330539) {
        noteKey = "note_full";
        noteGood = true;
      } else if (v <= 660982) {
        noteKey = "note_partial";
        noteGood = true;
      } else {
        noteKey = "note_over";
      }
    } else {
      imt = imtSecundaria(v);
      selo = v * 0.008;
      notary = NOTARY;
      noteKey = "note_nr";
    }

    const costs = imt + selo + notary;
    const grand = v + costs;
    let saving = 0;
    if (mode === "res") {
      saving = imtPropria(v) + v * 0.008 - (imt + selo);
      if (saving <= 1) saving = 0;
    }
    return { imt, selo, notary, costs, grand, noteKey, noteGood, saving };
  }, [price, mode]);

  function onPriceNum(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    let v = parseInt(digits, 10);
    if (Number.isNaN(v)) v = 0;
    if (v > PRICE_MAX) v = PRICE_MAX;
    setPrice(v);
  }

  return (
    <div className="calc" id="calc">
      <div className="calc-controls">
        {/* Situation toggle */}
        <div className="seg" role="tablist" aria-label={t("seg_aria")}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "res"}
            className={cn("seg-btn", mode === "res" && "on")}
            onClick={() => setMode("res")}
          >
            <span className="seg-t">{t("seg_res_title")}</span>
            <span className="seg-s">{t("seg_res_sub")}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "nr"}
            className={cn("seg-btn", mode === "nr" && "on")}
            onClick={() => setMode("nr")}
          >
            <span className="seg-t">{t("seg_nr_title")}</span>
            <span className="seg-s">{t("seg_nr_sub")}</span>
          </button>
        </div>

        {/* Price */}
        <label className="calc-price">
          <span className="calc-price-lab">{t("price_label")}</span>
          <span className="calc-price-field">
            <span aria-hidden="true">€</span>
            <input
              type="text"
              inputMode="numeric"
              value={nf.format(price)}
              onChange={(e) => onPriceNum(e.target.value)}
              aria-label={t("price_label")}
            />
          </span>
        </label>
        <input
          type="range"
          className="calc-slider"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={5000}
          value={Math.min(Math.max(price, SLIDER_MIN), SLIDER_MAX)}
          onChange={(e) => setPrice(Number(e.target.value))}
          aria-label={t("price_label")}
        />
        <p className="calc-price-hint">{t("price_hint")}</p>
      </div>

      {/* Results */}
      <div className="calc-result">
        <p className="calc-res-lab">{t("res_costs_label")}</p>
        <p className="calc-res-big">{fmt(r.costs)}</p>

        <ul className="calc-rows">
          <li className={cn(r.imt === 0 && "zero")}>
            <span>{t("r_imt")}</span>
            <span>{fmt(r.imt)}</span>
          </li>
          <li className={cn(r.selo === 0 && "zero")}>
            <span>{t("r_selo")}</span>
            <span>{fmt(r.selo)}</span>
          </li>
          <li>
            <span>{t("r_notary")}</span>
            <span>≈ {fmt(r.notary)}</span>
          </li>
          <li className="zero">
            <span>{t("r_avento")}</span>
            <span>{fmt(0)}</span>
          </li>
          <li className="opt">
            <span>{t("r_lawyer")}</span>
            <span>≈ {fmt(LAWYER)}</span>
          </li>
        </ul>

        <p className={cn("calc-note", r.noteGood && "good")}>{t(r.noteKey)}</p>
        {r.saving > 0 && (
          <p className="calc-save">
            🎉 {t("save_prefix")} <b>{fmt(r.saving)}</b> {t("save_suffix")}
          </p>
        )}

        <div className="calc-grand">
          <span>{t("grand_label")}</span>
          <span>{fmt(r.grand)}</span>
        </div>

        <div className="dcta-links calc-links">
          <Link href={routes.taxes}>{t("calc_mortgage")} →</Link>
          <Link href={routes.contacts}>{t("calc_deal")} →</Link>
        </div>
        <p className="calc-disclaimer">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
