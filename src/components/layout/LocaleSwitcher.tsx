"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Variant = "pill" | "block";

/**
 * Switches the active locale in the URL while preserving the current path.
 * `pill` matches the header top-bar (.lang); `block` matches the mega-menu
 * (.mlang).
 */
export function LocaleSwitcher({ variant = "pill" }: { variant?: Variant }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale || isPending) return;
    startTransition(() => {
      // `pathname` is locale-stripped; next-intl re-adds the target prefix.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className={variant === "pill" ? "lang" : "mlang"}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          className={cn(l === locale && "on")}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => switchTo(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
