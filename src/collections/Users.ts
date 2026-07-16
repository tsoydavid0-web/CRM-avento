import type { CollectionConfig } from "payload";

/**
 * Admin users (Avento team). `auth: true` gives Payload email/password login,
 * sessions and the `/admin` gate. Keep this collection small — it is the
 * authentication boundary for the whole admin panel.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    // Any signed-in team member can see the team; only admins manage accounts.
    // (Creating the very first user is special-cased by Payload and still works.)
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin",
    update: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin",
    delete: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
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
