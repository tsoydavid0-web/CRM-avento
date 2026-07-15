import type { CollectionConfig } from "payload";

/** Porto districts we cover — kept in sync with the site's districts guide. */
const DISTRICT_OPTIONS = [
  { label: "Foz do Douro", value: "foz" },
  { label: "Cedofeita / Centro", value: "cedofeita" },
  { label: "Bonfim", value: "bonfim" },
  { label: "Boavista", value: "boavista" },
  { label: "Campanhã", value: "campanha" },
  { label: "Matosinhos", value: "matosinhos" },
  { label: "Maia", value: "maia" },
  { label: "Vila Nova de Gaia", value: "gaia" },
  { label: "Gondomar", value: "gondomar" },
  { label: { en: "Other", ru: "Другой" }, value: "other" },
];

/**
 * Property listings — the catalog managed from /admin and rendered on the site.
 * Text fields are `localized` (RU + EN) to match the bilingual front end.
 * David's requirement: a real database of objects, editable in the admin.
 */
export const Properties: CollectionConfig = {
  slug: "properties",
  labels: {
    singular: { en: "Property", ru: "Объект" },
    plural: { en: "Properties", ru: "Объекты" },
  },
  access: {
    // Public can read only published listings; the whole record is editable
    // by logged-in team members.
    read: ({ req: { user } }) =>
      user ? true : { status: { equals: "available" } },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "district", "price", "typology", "status"],
    group: { en: "Catalog", ru: "Каталог" },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { en: "Title", ru: "Название" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "URL id, e.g. foz-t2-ocean-view",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "available",
          options: [
            { label: { en: "Available", ru: "В продаже" }, value: "available" },
            { label: { en: "Reserved", ru: "Бронь" }, value: "reserved" },
            { label: { en: "Sold", ru: "Продан" }, value: "sold" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "dealType",
          type: "select",
          defaultValue: "residence",
          options: [
            { label: { en: "To live in", ru: "Для жизни" }, value: "residence" },
            { label: { en: "Investment", ru: "Инвестиция" }, value: "investment" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "district",
          type: "select",
          required: true,
          options: DISTRICT_OPTIONS,
          admin: { width: "50%" },
          label: { en: "District", ru: "Район" },
        },
        {
          name: "typology",
          type: "select",
          options: ["T0", "T1", "T2", "T3", "T4", "T5+"].map((v) => ({
            label: v,
            value: v,
          })),
          admin: { width: "50%" },
          label: { en: "Typology", ru: "Комнатность" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
          admin: { width: "50%", step: 1000, description: "EUR" },
          label: { en: "Price (€)", ru: "Цена (€)" },
        },
        {
          name: "area",
          type: "number",
          min: 0,
          admin: { width: "50%", description: "m²" },
          label: { en: "Area (m²)", ru: "Площадь (м²)" },
        },
      ],
    },
    {
      name: "address",
      type: "text",
      localized: true,
      label: { en: "Address / location", ru: "Адрес / локация" },
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      label: { en: "Description", ru: "Описание" },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: { en: "Cover photo", ru: "Обложка" },
    },
    {
      name: "gallery",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: { en: "Gallery", ru: "Галерея" },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
      label: { en: "Featured", ru: "Рекомендуемый" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
      label: { en: "Published at", ru: "Дата публикации" },
    },
  ],
};
