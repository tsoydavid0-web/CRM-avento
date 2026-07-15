import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BuyHero } from "@/components/buy/BuyHero";
import { InvestPromo } from "@/components/buy/InvestPromo";
import { WhyPortugal } from "@/components/buy/WhyPortugal";
import { LeadForm } from "@/components/home/LeadForm";
import { MortgageCalculator } from "@/components/home/MortgageCalculator";
import { routes } from "@/config/site";

export async function generateMetadata(
  props: PageProps<"/[locale]/buy">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Buy" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function BuyPage(props: PageProps<"/[locale]/buy">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Buy" });

  return (
    <>
      <BuyHero />
      <LeadForm
        source="buy"
        showCity={false}
        heading={t("form_heading")}
        lede={t("form_lede")}
        successCta={{
          href: routes.investors,
          label: t("form_success_cta"),
          note: t("form_success_note"),
        }}
      />
      <InvestPromo />
      <WhyPortugal />
      <MortgageCalculator />
    </>
  );
}
