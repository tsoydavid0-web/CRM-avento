"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

// Keys the API can return under `fields` (see src/lib/validation.ts).
type FieldName = "name" | "phone" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;

const budgetOptions = ["lt250", "250to400", "400to600", "gt600"] as const;

/** Server error codes (zod `message`s) this form surfaces inline. */
const KNOWN_ERROR_CODES = new Set([
  "name_required",
  "name_too_long",
  "name_invalid",
  "phone_required",
  "phone_too_long",
  "phone_invalid",
  "consent_required",
]);

interface LeadFormProps {
  /** Lead attribution; validated server-side (leadSchema enum). Omit on home. */
  source?:
    | "home"
    | "buy"
    | "sell"
    | "services"
    | "contacts"
    | "taxes"
    | "investors"
    | "relocation";
  /** Optional qualifier fields — toggled per page. */
  showCity?: boolean;
  showBudget?: boolean;
  showComment?: boolean;
  showMortgage?: boolean;
  /** Approx. property value field (Sell page). */
  showPrice?: boolean;
  /** Interest dropdown (Services page). When set, renders a <select name="interest">. */
  interestOptions?: readonly { value: string; label: string }[];
  interestPlaceholder?: string;
  interestAria?: string;
  /** Override heading/lede/submit (default: `Lead` namespace). */
  heading?: string;
  lede?: string;
  submitLabel?: string;
  /** Override the comment textarea placeholder (e.g. Contacts → "Message"). */
  commentPlaceholder?: string;
  /** Optional CTA rendered after a successful submit (e.g. Buy → investors). */
  successCta?: { href: string; label: string; note?: string };
}

/**
 * Lead-capture form, shared across pages. Posts JSON to `/api/lead` (route +
 * validation owned by the security engineer). Field-name contract: name, phone,
 * city, price, budget, comment, mortgage, required GDPR `consent`, optional
 * `source`, hidden honeypot `company`.
 */
export function LeadForm({
  source,
  showCity = true,
  showBudget = true,
  showComment = true,
  showMortgage = true,
  showPrice = false,
  interestOptions,
  interestPlaceholder,
  interestAria,
  heading,
  lede,
  submitLabel,
  commentPlaceholder,
  successCta,
}: LeadFormProps = {}) {
  const t = useTranslations("Lead");
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      price: String(data.get("price") ?? "").trim(),
      budget: String(data.get("budget") ?? ""),
      comment: String(data.get("comment") ?? "").trim(),
      mortgage: data.get("mortgage") === "on",
      interest: String(data.get("interest") ?? ""),
      consent: data.get("consent") === "on", // GDPR: required true (server-enforced)
      company: String(data.get("company") ?? ""), // honeypot (must stay empty)
      ...(source ? { source } : {}),
    };

    setStatus("submitting");
    setFieldErrors({});
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // Surface field-level codes (name/phone/consent) inline when the API
        // sends them; always keep the generic banner as a fallback.
        const body: unknown = await res.json().catch(() => null);
        const fields =
          body && typeof body === "object" && "fields" in body
            ? (body as { fields?: Record<string, string> }).fields
            : undefined;
        if (fields) {
          const next: FieldErrors = {};
          for (const key of ["name", "phone", "consent"] as const) {
            const code = fields[key];
            if (code && KNOWN_ERROR_CODES.has(code)) next[key] = code;
          }
          setFieldErrors(next);
        }
        throw new Error(`Request failed: ${res.status}`);
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="block" id="capture">
      <div className="wrap">
        <div className="capture">
          <h2>{heading ?? t("heading")}</h2>
          <p>{lede ?? t("lede")}</p>

          <form className="cform" onSubmit={onSubmit} noValidate>
            {/* Honeypot: hidden from users, catches naive bots. */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="lead-company">{t("company_aria")}</label>
              <input
                id="lead-company"
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="cfield">
              <input
                type="text"
                name="name"
                placeholder={t("name_placeholder")}
                aria-label={t("name_aria")}
                aria-invalid={fieldErrors.name ? "true" : undefined}
                aria-describedby={fieldErrors.name ? "lead-name-err" : undefined}
                className={cn(fieldErrors.name && "invalid")}
                autoComplete="name"
                required
              />
              {fieldErrors.name && (
                <p id="lead-name-err" className="ferr" role="alert">
                  {t(`err_${fieldErrors.name}`)}
                </p>
              )}
            </div>
            <div className="cfield">
              <input
                type="tel"
                name="phone"
                placeholder={t("phone_placeholder")}
                aria-label={t("phone_aria")}
                aria-invalid={fieldErrors.phone ? "true" : undefined}
                aria-describedby={fieldErrors.phone ? "lead-phone-err" : undefined}
                className={cn(fieldErrors.phone && "invalid")}
                autoComplete="tel"
                required
              />
              {fieldErrors.phone && (
                <p id="lead-phone-err" className="ferr" role="alert">
                  {t(`err_${fieldErrors.phone}`)}
                </p>
              )}
            </div>

            {showCity && (
              <input
                type="text"
                name="city"
                placeholder={t("city_placeholder")}
                aria-label={t("city_aria")}
                autoComplete="address-level2"
              />
            )}
            {showPrice && (
              <input
                type="text"
                name="price"
                placeholder={t("price_placeholder")}
                aria-label={t("price_aria")}
                inputMode="numeric"
              />
            )}
            {interestOptions && interestOptions.length > 0 && (
              <select name="interest" aria-label={interestAria} defaultValue="">
                <option value="">{interestPlaceholder}</option>
                {interestOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            {showBudget && (
              <select name="budget" aria-label={t("budget_aria")} defaultValue="">
                <option value="">{t("budget_placeholder")}</option>
                {budgetOptions.map((code) => (
                  <option key={code} value={code}>
                    {t(`budget_${code}`)}
                  </option>
                ))}
              </select>
            )}

            {showComment && (
              <textarea
                name="comment"
                placeholder={commentPlaceholder ?? t("comment_placeholder")}
                aria-label={t("comment_aria")}
                rows={3}
              />
            )}

            {showMortgage && (
              <div className="full">
                <label className="toggle">
                  <input type="checkbox" name="mortgage" />
                  <span className="track" aria-hidden="true" />
                  <span>{t("mortgage_label")}</span>
                </label>
              </div>
            )}

            {/* GDPR consent — required; server rejects a lead without it. */}
            <div className="full consent">
              <label>
                <input
                  type="checkbox"
                  name="consent"
                  aria-invalid={fieldErrors.consent ? "true" : undefined}
                  aria-describedby={
                    fieldErrors.consent ? "lead-consent-err" : undefined
                  }
                />
                <span>
                  {t("consent_text")}{" "}
                  <Link href="/privacy">{t("consent_link")}</Link>
                </span>
              </label>
              {fieldErrors.consent && (
                <p id="lead-consent-err" className="ferr" role="alert">
                  {t(`err_${fieldErrors.consent}`)}
                </p>
              )}
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={status === "submitting"}
            >
              {status === "submitting"
                ? t("submitting")
                : (submitLabel ?? t("submit"))}
            </button>

            <p
              className={cn(
                "form-status",
                status === "success" && "ok",
                status === "error" && "err",
              )}
              role="status"
              aria-live="polite"
            >
              {status === "success" && t("success")}
              {status === "error" && t("error")}
            </p>
            {status === "success" && successCta && (
              <p className="success-cta full">
                {successCta.note ? `${successCta.note} ` : null}
                <Link href={successCta.href}>{successCta.label}</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
