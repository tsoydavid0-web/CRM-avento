import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";

/** Journal categories — kept in sync with the site's category filter/labels. */
const CATEGORY_OPTIONS = [
  { label: { en: "Taxes", ru: "Налоги" }, value: "taxes" },
  { label: { en: "Investing", ru: "Инвестиции" }, value: "invest" },
  { label: { en: "Buying", ru: "Покупка" }, value: "buying" },
  { label: { en: "Relocation & Visas", ru: "Переезд и ВНЖ" }, value: "relocation" },
  { label: { en: "Living in Porto", ru: "Жизнь в Порту" }, value: "life" },
];

/**
 * Journal / blog articles — fully editable from the admin (David's request).
 * Localized RU/EN. The rich-text body supports inline photos with a per-image
 * size (small / medium / full width). Drafts let you save before publishing;
 * the public site only shows published articles.
 */
export const Articles: CollectionConfig = {
  slug: "articles",
  labels: {
    singular: { en: "Article", ru: "Статья" },
    plural: { en: "Articles", ru: "Статьи" },
  },
  versions: { drafts: true },
  access: {
    // Public sees published only; logged-in team sees drafts too.
    read: ({ req: { user } }) =>
      user ? true : { _status: { equals: "published" } },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedDate", "_status"],
    group: { en: "Journal", ru: "Журнал" },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { en: "Title", ru: "Заголовок" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "URL id, e.g. property-taxes-2026",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: CATEGORY_OPTIONS,
      admin: { position: "sidebar" },
      label: { en: "Category", ru: "Категория" },
    },
    {
      name: "publishedDate",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
      label: { en: "Date", ru: "Дата" },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
      label: { en: "Featured", ru: "Рекомендуемая" },
    },
    {
      name: "excerpt",
      type: "textarea",
      localized: true,
      label: { en: "Excerpt (card + SEO)", ru: "Краткое описание (карточка + SEO)" },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: { en: "Cover photo", ru: "Обложка" },
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      label: { en: "Article body", ru: "Текст статьи" },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
          BlocksFeature({ blocks: [] }),
          // Inline photos with a per-image display size.
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: "size",
                    type: "select",
                    defaultValue: "full",
                    label: { en: "Display size", ru: "Размер на странице" },
                    options: [
                      { label: { en: "Small", ru: "Маленькая" }, value: "small" },
                      { label: { en: "Medium", ru: "Средняя" }, value: "medium" },
                      { label: { en: "Full width", ru: "Во всю ширину" }, value: "full" },
                    ],
                  },
                ],
              },
            },
          }),
        ],
      }),
    },
  ],
};
