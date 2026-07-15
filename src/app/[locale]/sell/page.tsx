import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadForm } from "@/components/home/LeadForm";
import { SellCta } from "@/components/sell/SellCta";
import { SellHero } from "@/components/sell/SellHero";
import { SellSteps } from "@/components/sell/SellSteps";

export async function generateMetadata(
  props: PageProps<"/[locale]/sell">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Sell" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function SellPage(props: PageProps<"/[locale]/sell">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Sell" });

  return (
    <>
      <SellHero />
      <LeadForm
        source="sell"
        showCity
        showPrice
        showBudget={false}
        showComment={false}
        showMortgage={false}
        heading={t("form_heading")}
        lede={t("form_lede")}
        submitLabel={t("form_submit")}
      />
      <SellSteps />
      <SellCta />
    </>
  );
}
