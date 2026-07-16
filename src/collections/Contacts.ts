import type { CollectionConfig } from "payload";

/**
 * Contacts — the single card for a person, independent of channel.
 *
 * One human may reach us from several accounts (a WhatsApp message today, an
 * Instagram DM tomorrow). We dedupe them into one Contact by phone/email so the
 * team sees one history, while each conversation stays its own Lead thread.
 *
 * PII: `fullName`, `phone`, `email` are personal data (EU/Portugal GDPR). Keep
 * the collection minimal and record consent.
 */
export const Contacts: CollectionConfig = {
  slug: "contacts",
  labels: {
    singular: { en: "Contact", ru: "Контакт" },
    plural: { en: "Contacts", ru: "Контакты" },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin",
  },
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "phone", "email", "preferredLang", "owner"],
    group: { en: "CRM", ru: "CRM" },
  },
  fields: [
    {
      name: "fullName",
      type: "text",
      label: { en: "Name", ru: "Имя" },
    },
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          index: true,
          admin: {
            width: "50%",
            description: {
              en: "Stored normalized (E.164-ish) for dedup.",
              ru: "Хранится в нормализованном виде (E.164) для дедупликации.",
            },
          },
          label: { en: "Phone", ru: "Телефон" },
        },
        {
          name: "email",
          type: "email",
          index: true,
          admin: { width: "50%" },
          label: { en: "Email", ru: "Email" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "preferredLang",
          type: "text",
          admin: {
            width: "50%",
            description: {
              en: "Language the contact writes in (ISO code), for replies.",
              ru: "Язык общения контакта (ISO-код), для ответов.",
            },
          },
          label: { en: "Preferred language", ru: "Язык общения" },
        },
        {
          name: "owner",
          type: "relationship",
          relationTo: "users",
          admin: { width: "50%" },
          label: { en: "Owner", ru: "Ответственный" },
        },
      ],
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      label: { en: "Tags", ru: "Теги" },
    },
    /**
     * Per-channel handles (telegram id, wa phone, ig username…) used to match an
     * inbound message back to this contact when the phone alone isn't known.
     */
    {
      name: "identities",
      type: "array",
      label: { en: "Channel handles", ru: "Идентификаторы в каналах" },
      admin: {
        description: {
          en: "How this person is identified in each channel.",
          ru: "Как этот человек опознаётся в каждом канале.",
        },
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "type",
              type: "text",
              admin: { width: "40%" },
              label: { en: "Channel", ru: "Канал" },
            },
            {
              name: "value",
              type: "text",
              index: true,
              admin: { width: "60%" },
              label: { en: "Handle / id", ru: "Идентификатор" },
            },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "consent",
          type: "checkbox",
          defaultValue: false,
          admin: { width: "50%" },
          label: { en: "GDPR consent", ru: "Согласие (GDPR)" },
        },
        {
          name: "consentAt",
          type: "date",
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
          label: { en: "Consent at", ru: "Дата согласия" },
        },
      ],
    },
    {
      name: "notes",
      type: "textarea",
      label: { en: "Notes", ru: "Заметки" },
    },
  ],
};
