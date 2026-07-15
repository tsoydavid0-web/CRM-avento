import { z } from "zod";

/**
 * Validation schema for the public lead form (LeadForm -> POST /api/lead).
 *
 * Security notes:
 * - This is a trust boundary: every field coming from the browser is treated as
 *   hostile until it passes this schema. Nothing downstream (email, Payload, DB)
 *   should ever receive un-parsed input.
 * - `name` + `phone` are PII (Portugal / EU GDPR). Keep collection minimal and
 *   never log the parsed values in the clear.
 * - `name` / `phone` reject CR/LF to prevent email header injection when the
 *   lead is later forwarded via Resend/SMTP.
 */

// Max lengths keep payloads small and blunt abuse (oversized bodies, log flooding).
const NAME_MAX = 100;
const PHONE_MAX = 32;
const CITY_MAX = 100;
const BUDGET_MAX = 100;
const COMMENT_MAX = 2000;
// Attribution metadata caps (UTM values / landing URL). Kept generous but bounded.
const UTM_MAX = 200;
const URL_MAX = 500;

/** Only +, digits and common human separators are allowed in a phone number. */
const PHONE_ALLOWED = /^[+()\d\s.\-]+$/;
/** CR/LF anywhere in a single-line field is a header-injection / abuse signal. */
const CONTROL_CHARS = /[\r\n\t\0]/;

/**
 * Lead-source attribution (which form produced the lead). This is low-trust
 * metadata set by our own forms — the homepage sends nothing / `"home"`, the
 * Buy page sends `"buy"`. Modelled as a strict allowlist (deny-by-default): the
 * only values that can ever reach a downstream sink (email/log) are these
 * compile-time constants, so `source` can never carry an injection payload,
 * CR/LF, or oversized junk. Absent/empty is allowed. ANY new lead-producing
 * form MUST add its value here — an unknown `source` is rejected, not stored.
 */
const SOURCE_VALUES = [
  "home",
  "buy",
  "sell",
  "services",
  "contacts",
  "taxes",
  "investors",
  "relocation",
] as const;

/**
 * An optional free-text field: treats "" / whitespace-only as "not provided"
 * (browsers send empty strings for untouched optional inputs) and enforces a
 * length cap on anything real.
 */
const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );

export const leadSchema = z.object({
  // Required identity fields (PII).
  name: z
    .string()
    .trim()
    .min(1, { message: "name_required" })
    .max(NAME_MAX, { message: "name_too_long" })
    .refine((v) => !CONTROL_CHARS.test(v), { message: "name_invalid" }),

  phone: z
    .string()
    .trim()
    .min(1, { message: "phone_required" })
    .max(PHONE_MAX, { message: "phone_too_long" })
    .refine((v) => !CONTROL_CHARS.test(v), { message: "phone_invalid" })
    .refine((v) => PHONE_ALLOWED.test(v), { message: "phone_invalid" })
    .refine(
      (v) => {
        const digits = v.replace(/\D/g, "").length;
        return digits >= 6 && digits <= 15; // loose E.164-ish bounds
      },
      { message: "phone_invalid" },
    ),

  /**
   * GDPR consent (Portugal / EU). The user must explicitly agree to the
   * processing of their PII before we accept a lead — strictly `true` (the
   * checkbox), with no truthy/string coercion. Absent or `false` is rejected,
   * so a lead is never processed or stored without a recorded consent.
   */
  consent: z.literal(true, { message: "consent_required" }),

  // Optional lead qualifiers.
  city: optionalText(CITY_MAX),
  budget: optionalText(BUDGET_MAX),
  // Approx. property value (Sell page valuation form) — free-ish text.
  price: optionalText(BUDGET_MAX),
  // Interest / topic (Services page dropdown) — free-ish text.
  interest: optionalText(BUDGET_MAX),
  comment: optionalText(COMMENT_MAX),

  // Checkbox. Absent/undefined is treated as false; strictly boolean otherwise
  // (no string coercion — "false" must never become true).
  mortgage: z.boolean().optional().default(false),

  /**
   * Which form produced this lead (attribution only). Optional: absent or "" is
   * treated as "not provided". A light preprocess trims + lowercases so trivial
   * formatting differences ("Buy", " buy ") don't drop a real lead, but the
   * value must still be one of the allowlisted `SOURCE_VALUES` — anything else
   * (unknown tag, oversized string, embedded CR/LF) fails the enum and is
   * rejected. `source` is NOT part of the rate-limit key, so it can't be used to
   * fragment buckets and bypass the limit.
   */
  source: z.preprocess((value) => {
    // null (a common JSON "no value") is treated as absent so it never drops a
    // valid lead; other non-strings fall through and fail the enum (reject).
    if (value === null) return undefined;
    if (typeof value !== "string") return value;
    const normalized = value.trim().toLowerCase();
    return normalized === "" ? undefined : normalized;
  }, z.enum(SOURCE_VALUES).optional()),

  /**
   * Attribution metadata (source tracking — "знать откуда попал лид"). Set by
   * our own forms from the URL query / referrer; low-trust free text, bounded
   * and CR/LF-safe via `optionalText`. Absent is fine.
   */
  utm_source: optionalText(UTM_MAX),
  utm_medium: optionalText(UTM_MAX),
  utm_campaign: optionalText(UTM_MAX),
  utm_content: optionalText(UTM_MAX),
  utm_term: optionalText(UTM_MAX),
  landingUrl: optionalText(URL_MAX),

  /**
   * Honeypot. Real users never see or fill this hidden field, so it must be
   * empty. Kept in the schema so the field is known/allowed, but the anti-bot
   * decision lives in `src/lib/security/honeypot.ts` and runs BEFORE this parse
   * so we never leak validation hints to bots.
   */
  company: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
