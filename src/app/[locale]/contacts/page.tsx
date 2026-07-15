import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/home/LeadForm";

const channels = [
  { k: "whatsapp", ic: "💬" },
  { k: "telegram", ic: "✈️" },
  { k: "email", ic: "✉️" },
  { k: "phone", ic: "📞" },
] as const;

export async function generateMetadata(
  props: PageProps<"/[locale]/contacts">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Contacts" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function ContactsPage(
  props: PageProps<"/[locale]/contacts">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Contacts" });

  return (
    <>
      {/* Hero */}
      <section className="block buy-hero">
        <div className="wrap">
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h1>{t("hero_title")}</h1>
          <p className="sub">{t("hero_lede")}</p>
        </div>
      </section>

      {/* Channels */}
      <section className="block how">
        <div className="wrap">
          <p className="eyebrow">{t("chan_eyebrow")}</p>
          <h2 className="sec">{t("chan_title")}</h2>
          <p className="sec-lede">
            {t("chan_note")}{" "}
            <span className="placeholder-tag">{t("chan_note_ph")}</span>
          </p>
          <div className="router">
            {channels.map((c) => (
              <a key={c.k} className="rcard chan-card" href="#">
                <span className="rico" aria-hidden="true">
                  {c.ic}
                </span>
                <h4>{t(`chan_${c.k}_name`)}</h4>
                <p>{t(`chan_${c.k}_val`)}</p>
                <span className="chan-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </div>
          <div className="socials" aria-hidden="true">
            <span>📷</span>
            <span>👍</span>
            <span>▶️</span>
          </div>
          <p className="chan-foot">
            {t("chan_foot")}{" "}
            <span className="placeholder-tag">{t("ami_ph")}</span>
          </p>
        </div>
      </section>

      {/* Message form */}
      <LeadForm
        source="contacts"
        showCity={false}
        showBudget={false}
        showMortgage={false}
        heading={t("form_heading")}
        lede={t("form_lede")}
        submitLabel={t("form_submit")}
        commentPlaceholder={t("form_message")}
      />

      {/* Office */}
      <section className="block">
        <div className="wrap">
          <p className="eyebrow">{t("office_eyebrow")}</p>
          <h2 className="sec">{t("office_title")}</h2>
          <div className="whous-grid">
            <div>
              <p className="sec-lede">{t("office_body")}</p>
              <p className="office-note">
                {t("office_note")}{" "}
                <span className="placeholder-tag">{t("office_note_ph")}</span>
              </p>
            </div>
            <div
              className="photo-slot cover"
              role="img"
              aria-label={t("map_lab")}
            >
              <span className="ps-ic" aria-hidden="true">
                🗺️
              </span>
              <span className="ps-lab">{t("map_lab")}</span>
              <span className="ps-hint">{t("map_hint")}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
