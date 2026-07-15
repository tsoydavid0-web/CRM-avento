"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type Field = "price" | "down" | "years" | "rate";

const bounds: Record<Field, { min: number; max: number; step: number }> = {
  price: { min: 120000, max: 900000, step: 5000 },
  down: { min: 10, max: 60, step: 1 },
  years: { min: 5, max: 40, step: 1 },
  rate: { min: 2, max: 7, step: 0.1 },
};

export function MortgageCalculator() {
  const t = useTranslations("Calc");
  const locale = useLocale();

  const [price, setPrice] = useState(350000);
  const [down, setDown] = useState(30);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(3.6);

  const money = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const rateFmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [locale],
  );
  const fmtMoney = (n: number) => `€ ${money.format(Math.round(n))}`;

  const { monthly, loan, downSum } = useMemo(() => {
    const loanAmount = price * (1 - down / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    const m = r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -n)) : loanAmount / n;
    return { monthly: m, loan: loanAmount, downSum: (price * down) / 100 };
  }, [price, down, years, rate]);

  const setters: Record<Field, (v: number) => void> = {
    price: setPrice,
    down: setDown,
    years: setYears,
    rate: setRate,
  };
  const values: Record<Field, number> = { price, down, years, rate };

  return (
    <section className="block" id="calc">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="sec">{t("title")}</h2>
        <p className="sec-lede">{t("lede")}</p>

        <div className="calc">
          <div className="controls">
            <div className="field">
              <label htmlFor="calc-price">
                {t("priceLabel")} <span>{fmtMoney(price)}</span>
              </label>
              <RangeInput id="calc-price" field="price" value={values} set={setters} />
            </div>
            <div className="field">
              <label htmlFor="calc-down">
                {t("downLabel")} <span>{down}%</span>
              </label>
              <RangeInput id="calc-down" field="down" value={values} set={setters} />
            </div>
            <div className="field">
              <label htmlFor="calc-years">
                {t("yearsLabel")} <span>{t("yearsValue", { years })}</span>
              </label>
              <RangeInput id="calc-years" field="years" value={values} set={setters} />
            </div>
            <div className="field">
              <label htmlFor="calc-rate">
                {t("rateLabel")} <span>{rateFmt.format(rate)}%</span>
              </label>
              <RangeInput id="calc-rate" field="rate" value={values} set={setters} />
            </div>
          </div>

          <div className="result">
            <div className="lbl">{t("monthlyLabel")}</div>
            <div className="big">{fmtMoney(monthly)}</div>
            <div className="row">
              <span>{t("loanLabel")}</span>
              <b>{fmtMoney(loan)}</b>
            </div>
            <div className="row">
              <span>{t("downSumLabel")}</span>
              <b>{fmtMoney(downSum)}</b>
            </div>
            <div className="bridge">
              <a href="#capture">{t("bridge1")}</a>
              <a href="#capture">{t("bridge2")}</a>
            </div>
            <div className="disc">{t("disclaimer")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RangeInput({
  id,
  field,
  value,
  set,
}: {
  id: string;
  field: Field;
  value: Record<Field, number>;
  set: Record<Field, (v: number) => void>;
}) {
  const b = bounds[field];
  return (
    <input
      id={id}
      type="range"
      min={b.min}
      max={b.max}
      step={b.step}
      value={value[field]}
      onChange={(e) => set[field](Number(e.target.value))}
    />
  );
}
