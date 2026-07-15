import config from "@payload-config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPayload } from "payload";

import { ArticleBody } from "@/components/journal/ArticleBody";
import { routes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = {
  taxes: "🧮",
  invest: "📈",
  buying: "🔑",
  relocation: "🛂",
  life: "🌇",
};

type ArticleDoc = {
  title: string;
  category: string;
  excerpt?: string | null;
  publishedDate?: string | null;
  body?: unknown;
  cover?:
    | { url?: string | null; alt?: string | null; sizes?: { hero?: { url?: string | null } } }
    | number
    | null;
};

function formatDate(d: string | null | undefined, locale: string) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(d));
  } catch {
    return "";
  }
}

async function getArticle(slug: string, locale: string) {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "articles",
    locale: locale as "ru" | "en",
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
    },
    depth: 2,
    limit: 1,
  });
  return (res.docs[0] as unknown as ArticleDoc) ?? null;
}

export async function generateMetadata(
  props: PageProps<"/[locale]/journal/[slug]">,
): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const t = await getTranslations({ locale, namespace: "Journal" });
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return {
    title: `${article.title}${t("art_meta_suffix")}`,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage(
  props: PageProps<"/[locale]/journal/[slug]">,
) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Journal" });

  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const date = formatDate(article.publishedDate, locale);
  const cover =
    article.cover && typeof article.cover === "object" ? article.cover : null;
  const coverUrl = cover?.sizes?.hero?.url ?? cover?.url ?? null;

  return (
    <>
      {/* Hero */}
      <section className="block buy-hero">
        <div className="wrap lr-narrow">
          <p className="eyebrow">
            <span aria-hidden="true">{ICON[article.category]} </span>
            {t(`cat_${article.category}`)}
          </p>
          <h1>{article.title}</h1>
          {date && <p className="art-date">{date}</p>}
          {article.excerpt && <p className="sub">{article.excerpt}</p>}
        </div>
      </section>

      {coverUrl && (
        <section className="block">
          <div className="wrap lr-narrow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="art-cover"
              src={coverUrl}
              alt={cover?.alt ?? article.title}
            />
          </div>
        </section>
      )}

      {/* Body */}
      <section className="block">
        <div className="wrap lr-narrow">
          <ArticleBody data={article.body} />
        </div>
      </section>

      {/* CTA */}
      <section className="block">
        <div className="wrap">
          <div className="invest-card">
            <h2 className="sec">{t("art_cta_h")}</h2>
            <p className="sec-lede">{t("art_cta_d")}</p>
            <div className="dcta-links">
              <Link href={routes.contacts}>{t("art_cta_btn")} →</Link>
              <Link href={routes.journal}>{t("art_back")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
