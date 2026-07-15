import config from "@payload-config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPayload } from "payload";

import { getSiteSettings } from "@/lib/site-settings";

// Reads from the database at request time, so this page can't be static.
export const dynamic = "force-dynamic";

const DISTRICT_LABEL: Record<string, string> = {
  foz: "Foz do Douro",
  cedofeita: "Cedofeita / Centro",
  bonfim: "Bonfim",
  boavista: "Boavista",
  campanha: "Campanhã",
  matosinhos: "Matosinhos",
  maia: "Maia",
  gaia: "Vila Nova de Gaia",
  gondomar: "Gondomar",
  other: "—",
};

type PropDoc = {
  id: number | string;
  title: string;
  slug: string;
  district: string;
  typology?: string | null;
  price: number;
  area?: number | null;
  featured?: boolean | null;
  cover?:
    | { url?: string | null; alt?: string | null; sizes?: { card?: { url?: string | null } } }
    | number
    | null;
};

export async function generateMetadata(
  props: PageProps<"/[locale]/properties">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  return { title: t("meta_title"), description: t("meta_description") };
}

export default async function CatalogPage(
  props: PageProps<"/[locale]/properties">,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Catalog is admin-controlled; when switched off the page doesn't exist.
  const { showCatalog } = await getSiteSettings();
  if (!showCatalog) notFound();

  const t = await getTranslations({ locale, namespace: "Catalog" });

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "properties",
    locale: locale as "ru" | "en",
    where: { status: { equals: "available" } },
    sort: "-featured",
    depth: 1,
    limit: 48,
  });
  const docs = result.docs as unknown as PropDoc[];
  const nf = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB");

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="sec">{t("title")}</h1>
        <p className="sec-lede">{t("lede")}</p>

        {docs.length === 0 ? (
          <p className="dnote">{t("empty")}</p>
        ) : (
          <div className="prop-grid">
            {docs.map((p) => {
              const cover =
                p.cover && typeof p.cover === "object" ? p.cover : null;
              const img = cover?.sizes?.card?.url ?? cover?.url ?? null;
              return (
                <article key={p.id} className="prop-card">
                  <div className="prop-cover">
                    {img ? (
                      // Property photos come from the CMS (Vercel Blob) — a plain
                      // <img> keeps this simple; sizes are pre-generated.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={cover?.alt ?? ""} loading="lazy" />
                    ) : (
                      <span className="prop-ph" aria-hidden="true">
                        🏙️
                      </span>
                    )}
                    {p.featured ? (
                      <span className="prop-badge">{t("featured")}</span>
                    ) : null}
                  </div>
                  <div className="prop-body">
                    <span className="prop-district">
                      {DISTRICT_LABEL[p.district] ?? p.district}
                      {p.typology ? ` · ${p.typology}` : ""}
                    </span>
                    <h3 className="prop-title">{p.title}</h3>
                    <div className="prop-meta">
                      <span className="prop-price">€ {nf.format(p.price)}</span>
                      {p.area ? (
                        <span className="prop-area">{p.area} m²</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
