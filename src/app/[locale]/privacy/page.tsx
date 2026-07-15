import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

const sections = [
  "data",
  "use",
  "basis",
  "retention",
  "rights",
  "cookies",
  "contact",
] as const;

export async function generateMetadata(
  props: PageProps<"/[locale]/privacy">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function PrivacyPage(
  props: PageProps<"/[locale]/privacy">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <section className="block">
      <div className="wrap legal-doc">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="legal-updated">{t("updated")}</p>
        <div className="legal-note">{t("disclaimer")}</div>
        <p className="legal-lede">{t("intro")}</p>
        {sections.map((s) => (
          <div key={s} className="legal-sec">
            <h2>{t(`s_${s}_title`)}</h2>
            <p>{t(`s_${s}_body`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
