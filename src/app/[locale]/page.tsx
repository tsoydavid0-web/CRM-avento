import { setRequestLocale } from "next-intl/server";

import { Districts } from "@/components/home/Districts";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { HowWeWork } from "@/components/home/HowWeWork";
import { Journal } from "@/components/home/Journal";
import { LeadForm } from "@/components/home/LeadForm";
import { MortgageCalculator } from "@/components/home/MortgageCalculator";
import { Reviews } from "@/components/home/Reviews";
import { TrustBar } from "@/components/home/TrustBar";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { WhoWeHelp } from "@/components/home/WhoWeHelp";

export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustBar />
      <WhoWeHelp />
      <Districts />
      <MortgageCalculator />
      <HowWeWork />
      <Faq />
      <WhoWeAre />
      <Reviews />
      <Journal />
      <LeadForm />
    </>
  );
}
