import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/home/LeadForm";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServicesSteps } from "@/components/services/ServicesSteps";

const interestValues = [
  "search",
  "deal",
  "rental",
  "relocation",
  "unsure",
] as const;

export async function generateMetadata(
  props: PageProps<"/[locale]/services">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Services" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function ServicesPage(
  props: PageProps<"/[locale]/services">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Services" });

  const interestOptions = interestValues.map((v) => ({
    value: v,
    label: t(`interest_${v}`),
  }));

  return (
    <>
      <ServicesHero />
      <ServicesGrid />
      <ServicesSteps />
      <LeadForm
        source="services"
        showCity={false}
        showBudget={false}
        showComment={false}
        showMortgage={false}
        heading={t("form_heading")}
        lede={t("form_lede")}
        submitLabel={t("form_submit")}
        interestOptions={interestOptions}
        interestPlaceholder={t("interest_placeholder")}
        interestAria={t("interest_aria")}
      />
    </>
  );
}
