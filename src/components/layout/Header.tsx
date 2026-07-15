"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import {
  brand,
  guidesNav,
  primaryNav,
  routes,
  type NavItem,
} from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** `showCatalog` is admin-controlled (Site settings → Show catalog). */
export function Header({ showCatalog = false }: { showCatalog?: boolean }) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  // Prepend the catalog link only when the catalog is enabled in the admin.
  const sections: NavItem[] = showCatalog
    ? [{ key: "catalog", href: routes.catalog }, ...primaryNav]
    : primaryNav;

  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll + close on Escape while the mega-menu is open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <Link href={routes.home} aria-label={t("logoAria")} onClick={close}>
            <Image
              className="logo"
              src="/brand/avento-logo-final.png"
              alt={brand.name}
              width={283}
              height={260}
              priority
            />
          </Link>

          <button
            className={cn("burger", open && "open")}
            type="button"
            aria-label={t("menuLabel")}
            aria-expanded={open}
            aria-controls="mnav"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="menu" aria-label={t("menuLabel")}>
            {sections.map((item) => (
              <Link key={item.key} className="mi" href={item.href}>
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="nav-right">
            <LocaleSwitcher variant="pill" />
            <Link className="btn btn-primary consult" href={routes.contacts}>
              {t("consultation")}
            </Link>
          </div>
        </div>
      </header>

      <div className={cn("mnav", open && "open")} id="mnav">
        <div className="mega">
          <div className="mcol">
            <div className="mh">{t("sectionsHeading")}</div>
            {sections.map((item) => (
              <Link key={item.key} href={item.href} onClick={close}>
                {t(item.key)}
              </Link>
            ))}
          </div>
          <div className="mcol">
            <div className="mh">{t("guidesHeading")}</div>
            {guidesNav.map((item) => (
              <Link key={item.key} href={item.href} onClick={close}>
                {t(item.key)}
              </Link>
            ))}
          </div>
          <div className="mpromo">
            <div className="mphoto" role="img" aria-label={t("promoAria")} />
            <Link className="mcap" href={routes.contacts} onClick={close}>
              {t("promoCta")}
            </Link>
            <LocaleSwitcher variant="block" />
          </div>
        </div>
      </div>

      <div
        className={cn("mnav-ov", open && "open")}
        onClick={close}
        aria-hidden="true"
      />
    </>
  );
}
