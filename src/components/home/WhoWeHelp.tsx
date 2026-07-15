import { useTranslations } from "next-intl";

import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function WhoWeHelp() {
  const t = useTranslations("WhoWeHelp");

  const cards = [
    { key: "investor", href: routes.investors },
    { key: "mover", href: routes.relocation },
    { key: "live", href: routes.buy },
  ] as const;

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="sec">{t("title")}</h2>
        <p className="sec-lede">{t("lede")}</p>
        <div className="router">
          {cards.map((card) => (
            <div key={card.key} className="rcard">
              <h4>{t(`${card.key}_title`)}</h4>
              <p>{t(`${card.key}_body`)}</p>
              <Link href={card.href}>{t(`${card.key}_cta`)}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
