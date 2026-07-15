import type { GlobalConfig } from "payload";

/**
 * Site-wide switches editable from the admin. `showCatalog` toggles the public
 * property catalog (its page + the "Listings" nav link) on and off. Default off
 * — the catalog stays hidden until the team is ready to publish objects.
 */
export const SiteSettings: GlobalConfig = {
  slug: "settings",
  label: { en: "Site settings", ru: "Настройки сайта" },
  admin: { group: { en: "Catalog", ru: "Каталог" } },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "showCatalog",
      type: "checkbox",
      defaultValue: false,
      label: {
        en: "Show the property catalog on the site",
        ru: "Показывать каталог объектов на сайте",
      },
      admin: {
        description:
          "Off — the catalog page and its navigation link are hidden from visitors.",
      },
    },
  ],
};
