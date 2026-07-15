import { useTranslations } from "next-intl";

import { Accordion, type AccordionItem } from "@/components/ui/Accordion";

export function Faq() {
  const t = useTranslations("Faq");

  const items: AccordionItem[] = [
    {
      id: "cost",
      title: t("q1"),
      content: (
        <>
          {t("a1")}
          <br />
          <a className="btn btn-secondary" href="#calc">
            {t("a1_cta")}
          </a>
        </>
      ),
    },
    { id: "mortgage", title: t("q2"), content: t("a2") },
    { id: "visa", title: t("q3"), content: t("a3") },
    { id: "goldenvisa", title: t("q4"), content: t("a4") },
    { id: "payments", title: t("q5"), content: t("a5") },
  ];

  return (
    <section className="block" id="faq">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="sec">{t("title")}</h2>
        <p className="sec-lede">{t("lede")}</p>
        <Accordion items={items} />
      </div>
    </section>
  );
}
