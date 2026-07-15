import { useTranslations } from "next-intl";

import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

const services = [
  { k: "s1", ic: "🔎", link: null },
  { k: "s2", ic: "📝", link: routes.taxes },
  { k: "s3", ic: "🔑", link: null },
  { k: "s4", ic: "🛂", link: routes.relocation },
] as const;

export function ServicesGrid() {
  const t = useTranslations("Services");

  return (
    <section className="block how">
      <div className="wrap">
        <p className="eyebrow">{t("grid_eyebrow")}</p>
        <h2 className="sec">{t("grid_title")}</h2>
        <p className="sec-lede">{t("grid_lede")}</p>
        <div className="router">
          {services.map((s, i) => (
            <div key={s.k} className="rcard svc-card">
              <div className="svc-top">
                <span className="svc-n">{i + 1}</span>
                <span className="svc-ic" aria-hidden="true">
                  {s.ic}
                </span>
              </div>
              <h4>{t(`${s.k}_title`)}</h4>
              <ul>
                <li>{t(`${s.k}_b1`)}</li>
                <li>{t(`${s.k}_b2`)}</li>
                <li>{t(`${s.k}_b3`)}</li>
              </ul>
              {s.link && <Link href={s.link}>{t(`${s.k}_link`)}</Link>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
