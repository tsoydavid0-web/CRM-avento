/**
 * Loose phone normalization for contact dedup.
 *
 * We are NOT trying to be libphonenumber — just to produce a stable key so the
 * same person from two channels collapses into one Contact. Strategy:
 *   - strip everything but digits (and a leading +)
 *   - "00…" international prefix → "+…"
 *   - otherwise prefix a "+" (best effort; local-format numbers without a
 *     country code can't be perfectly resolved and that's acceptable here)
 * Returns null when there aren't enough digits to be a real phone.
 */
export function normalizePhone(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  const hadPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");

  if (!hadPlus && digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length < 6 || digits.length > 15) return null;

  return `+${digits}`;
}
