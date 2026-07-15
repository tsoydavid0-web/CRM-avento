/**
 * Honeypot anti-bot check.
 *
 * The lead form renders a hidden field named `company` (visually hidden +
 * aria-hidden + autocomplete="off"). Humans never fill it. Naive bots that
 * auto-fill every input will populate it, so any non-empty value is a strong
 * bot signal.
 *
 * This is a first, zero-friction layer. When spam grows, add a real CAPTCHA
 * (see SECURITY.md) — the honeypot stays as a cheap pre-filter.
 */

/**
 * Returns `true` when the honeypot indicates a bot.
 *
 * - empty / whitespace-only string -> human (false)
 * - null / undefined / missing     -> human (false)
 * - any non-empty string           -> bot (true)
 * - any non-string, non-nullish     -> bot (true) — a hidden text field should
 *   only ever be an empty string, so anything else is tampering.
 */
export function isHoneypotTriggered(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}
