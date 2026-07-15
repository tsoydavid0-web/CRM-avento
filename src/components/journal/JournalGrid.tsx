"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const CATS = ["all", "taxes", "invest", "buying", "relocation", "life"] as const;
const ICON: Record<string, string> = {
  taxes: "🧮",
  invest: "📈",
  buying: "🔑",
  relocation: "🛂",
  life: "🌇",
};

export type JournalCard = {
  slug: string;
  cat: string;
  featured: boolean;
  title: string;
  excerpt: string;
  date: string;
};

export function JournalGrid({ articles }: { articles: JournalCard[] }) {
  const t = useTranslations("Journal");
  const [cat, setCat] = useState<string>("all");
  const list = articles.filter((a) => cat === "all" || a.cat === cat);

  return (
    <>
      <div className="jfilter" role="tablist" aria-label={t("filter_all")}>
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            className={cn("jchip", cat === c && "on")}
            onClick={() => setCat(c)}
          >
            {c === "all" ? t("filter_all") : t(`cat_${c}`)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="dnote">{t("empty")}</p>
      ) : (
        <div className="jgrid">
          {list.map((a) => (
            <Link
              key={a.slug}
              className={cn("jcard", a.featured && "feat")}
              href={`/journal/${a.slug}`}
            >
              <div className={`jcover ${a.cat}`}>
                <span className="ctag">{t(`cat_${a.cat}`)}</span>
                <span className="jcover-ic" aria-hidden="true">
                  {ICON[a.cat]}
                </span>
              </div>
              <div className="jb">
                {a.featured && (
                  <span className="feat-badge">{t("feat_badge")}</span>
                )}
                <span className="jt">{a.title}</span>
                <span className="jd">{a.excerpt}</span>
                <span className="jm">
                  <span className="jdate">{a.date}</span>
                  <span className="read-more">{t("read_more")} →</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
