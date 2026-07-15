import type { CollectionConfig } from "payload";

/**
 * Admin users (Avento team). `auth: true` gives Payload email/password login,
 * sessions and the `/admin` gate. Keep this collection small — it is the
 * authentication boundary for the whole admin panel.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: { en: "Name", ru: "Имя" },
    },
    {
      // Role for future access-control (agents vs admins). Every logged-in user
      // still has full CRM access today; this field lets us tighten it later
      // without a migration scramble.
      name: "role",
      type: "select",
      defaultValue: "agent",
      options: [
        { label: { en: "Admin", ru: "Админ" }, value: "admin" },
        { label: { en: "Agent", ru: "Агент" }, value: "agent" },
      ],
      label: { en: "Role", ru: "Роль" },
    },
  ],
};
