import config from "@payload-config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPayload } from "payload";

import { JournalGrid, type JournalCard } from "@/components/journal/JournalGrid";

export const dynamic = "force-dynamic";

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

export async function generateMetadata(
  props: PageProps<"/[locale]/journal">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Journal" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function JournalPage(
  props: PageProps<"/[locale]/journal">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Journal" });

  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "articles",
    locale: locale as "ru" | "en",
    where: { _status: { equals: "published" } },
    sort: "-publishedDate",
    depth: 0,
    limit: 100,
  });

  const articles: JournalCard[] = res.docs.map((d) => {
    const a = d as unknown as {
      slug: string;
      category: string;
      featured?: boolean;
      title: string;
      excerpt?: string;
      publishedDate?: string;
    };
    return {
      slug: a.slug,
      cat: a.category,
      featured: Boolean(a.featured),
      title: a.title,
      excerpt: a.excerpt ?? "",
      date: formatDate(a.publishedDate, locale),
    };
  });

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">{t("hero_eyebrow")}</p>
        <h1 className="sec">{t("hero_title")}</h1>
        <p className="sec-lede">{t("hero_lede")}</p>
        <JournalGrid articles={articles} />
      </div>
    </section>
  );
}
