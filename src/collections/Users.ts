import type { CollectionConfig } from "payload";

/**
 * Admin users (Avento team). `auth: true` gives Payload email/password login,
 * sessions and the `/admin` gate. Keep this collection small — it is the
 * authentication boundary for the whole admin panel.
 */
const isAdmin = (user: unknown) => (user as { role?: string } | null)?.role === "admin";

export const Users: CollectionConfig = {
  slug: "users",
  // Brute-force protection: lock the account for 10 min after 5 failed logins.
  // Cookies are same-origin only and Secure in production.
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  access: {
    // Any signed-in team member can see the team; only admins manage accounts
    // and only admins can reach the raw Payload `/admin` panel.
    // (Creating the very first user is special-cased by Payload and still works.)
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => isAdmin(user),
    update: ({ req: { user } }) => isAdmin(user),
    delete: ({ req: { user } }) => isAdmin(user),
    admin: ({ req: { user } }) => isAdmin(user),
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Enforce a minimum password length server-side (the client check is
        // bypassable). `password` is only present on create / password change.
        const pw = (data as { password?: string } | undefined)?.password;
        if (pw && pw.length < 8) {
          throw new Error("Пароль должен быть не короче 8 символов");
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: { en: "Name", ru: "Имя" },
    },
    {
      // Role for access-control (agents vs admins).
      name: "role",
      type: "select",
      defaultValue: "agent",
      // Only admins may change a role — otherwise an agent allowed to edit their
      // own profile could self-promote. Stays admin-only regardless of
      // collection-level access changes.
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
      options: [
        { label: { en: "Admin", ru: "Админ" }, value: "admin" },
        { label: { en: "Agent", ru: "Агент" }, value: "agent" },
      ],
      label: { en: "Role", ru: "Роль" },
    },
  ],
};
