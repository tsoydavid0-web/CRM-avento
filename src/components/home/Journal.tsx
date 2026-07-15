import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function Journal() {
  const t = useTranslations("Journal");

  const articles = ["a1", "a2", "a3"] as const;

  const items: AccordionItem[] = articles.map((a) => ({
    id: a,
    tag: t(`${a}_tag`),
    title: t(`${a}_title`),
    date: t(`${a}_date`),
    content: (
      <>
        {t(`${a}_summary`)}
        <br />
        <Link className="btn btn-secondary" href={routes.journal}>
          {t("read")}
        </Link>
      </>
    ),
  }));

  return (
    <section
      className="block"
      id="journal"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="wrap">
        <div className="why-now">
          {t.rich("whyNow", {
            b: (chunks: ReactNode) => <b>{chunks}</b>,
          })}
        </div>
        <div className="head-row">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="sec">{t("title")}</h2>
            <p className="sec-lede">{t("lede")}</p>
          </div>
          <Link className="btn btn-secondary" href={routes.journal}>
            {t("all")}
          </Link>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
