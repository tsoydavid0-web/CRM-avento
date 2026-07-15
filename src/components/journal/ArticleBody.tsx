import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";

type MediaDoc = {
  url?: string | null;
  alt?: string | null;
  sizes?: {
    card?: { url?: string | null };
    hero?: { url?: string | null };
  };
};

/**
 * Renders the Lexical article body. Inline photos use the per-image `size`
 * chosen in the editor (small / medium / full) — mapped to the generated Media
 * sizes and constrained by CSS (see .art-img in globals.css).
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const value = node.value as MediaDoc | number | null | undefined;
    if (!value || typeof value !== "object") return null;
    const size =
      (node.fields as { size?: string } | undefined)?.size ?? "full";
    const url =
      size === "small"
        ? (value.sizes?.card?.url ?? value.url)
        : size === "medium"
          ? (value.sizes?.hero?.url ?? value.url)
          : value.url;
    if (!url) return null;
    return (
      <figure className={`art-img art-img--${size}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={value.alt ?? ""} loading="lazy" />
      </figure>
    );
  },
});

export function ArticleBody({ data }: { data: unknown }) {
  if (!data) return null;
  return (
    <div className="lr-prose art-prose">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RichText data={data as any} converters={converters} />
    </div>
  );
}
