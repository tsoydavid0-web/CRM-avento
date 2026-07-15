import { useTranslations } from "next-intl";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="hero">
      <div className="photo">
        <Image
          src="/brand/hero-main.jpg"
          alt={t("photoAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="overlay" />
      <div className="wrap hero-in">
        <p className="kick">{t("kick")}</p>
        <h1>{t("title")}</h1>
        <p className="sub">{t("subtitle")}</p>
        <div className="cta">
          <a className="btn btn-primary" href="#capture">
            {t("ctaPrimary")}
          </a>
          <a
            className="btn btn-ghost"
            href="#calc"
            style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }}
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
