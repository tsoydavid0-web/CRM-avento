"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

/**
 * Footer newsletter capture. Subscription wiring (email provider) is not built
 * yet — this shows an optimistic success state and is a stub until connected.
 */
export function NewsletterForm() {
  const t = useTranslations("Footer");
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(integration): POST to the newsletter provider once available.
    setDone(true);
    e.currentTarget.reset();
  }

  return (
    <>
      <form className="news" onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          placeholder={t("newsletterPlaceholder")}
          aria-label={t("newsletterAria")}
          required
        />
        <button type="submit">{t("newsletterButton")}</button>
      </form>
      {done && (
        <p
          role="status"
          style={{
            color: "var(--good)",
            fontSize: "0.82rem",
            margin: "8px 0 0",
          }}
        >
          {t("newsletterSuccess")}
        </p>
      )}
    </>
  );
}
