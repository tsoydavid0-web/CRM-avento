import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { brand, routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();

  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-in">
          <div>
            <Image
              className="logo"
              src="/brand/avento-logo-final.png"
              alt={brand.name}
              width={283}
              height={260}
            />
            <p className="amistrip">
              {t("agencyLine")}
              <br />
              {t("amiLabel")}{" "}
              {/* TODO(placeholder): real AMI licence number */}
              <span className="placeholder-tag">{t("amiTag")}</span>
            </p>
          </div>

          <div>
            <h5>{t("buyersHeading")}</h5>
            <ul>
              <li>
                <Link href={routes.buy}>{t("l_buy")}</Link>
              </li>
              <li>
                <Link href={routes.districts}>{t("l_districts")}</Link>
              </li>
              <li>
                {/* Mortgage calculator lives on the home page */}
                <a href={`/${locale}#calc`}>{t("l_calculator")}</a>
              </li>
              <li>
                <Link href={routes.taxes}>{t("l_taxes")}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h5>{t("companyHeading")}</h5>
            <ul>
              <li>
                <Link href={routes.services}>{t("l_services")}</Link>
              </li>
              <li>
                <Link href={routes.sell}>{t("l_sell")}</Link>
              </li>
              <li>
                <Link href={routes.about}>{t("l_about")}</Link>
              </li>
              <li>
                <Link href={routes.journal}>{t("l_journal")}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h5>{t("newsletterHeading")}</h5>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.86rem",
                margin: "0 0 6px",
              }}
            >
              {t("newsletterLede")}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="wrap ft-bottom">
          <span>{t("copyright")}</span>
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}
          >
            {/* TODO(placeholder): real legal pages */}
            <Link href="/privacy">{t("privacy")}</Link>
            <Link href="/cookie">{t("cookie")}</Link>
            <LocaleSwitcher variant="pill" />
          </span>
        </div>
      </div>
    </footer>
  );
}
