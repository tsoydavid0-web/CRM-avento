import type { CollectionConfig } from "payload";

/**
 * Activities — the timeline on a contact / lead: status changes, notes, calls,
 * scheduled calls and automated system events. This is the audit trail the team
 * reads to see what happened, and later what the AI agent did.
 */
export const Activities: CollectionConfig = {
  slug: "activities",
  labels: {
    singular: { en: "Activity", ru: "Событие" },
    plural: { en: "Activities", ru: "События" },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: "type",
    defaultColumns: ["type", "lead", "contact", "actor", "createdAt"],
    group: { en: "CRM", ru: "CRM" },
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          defaultValue: "note",
          options: [
            { label: { en: "Note", ru: "Заметка" }, value: "note" },
            { label: { en: "Status change", ru: "Смена статуса" }, value: "status_change" },
            { label: { en: "Call", ru: "Звонок" }, value: "call" },
            { label: { en: "Call scheduled", ru: "Назначен колл" }, value: "call_scheduled" },
            { label: { en: "Message", ru: "Сообщение" }, value: "message" },
            { label: { en: "System", ru: "Система" }, value: "system" },
          ],
          admin: { width: "50%" },
          label: { en: "Type", ru: "Тип" },
        },
        {
          name: "actor",
          type: "relationship",
          relationTo: "users",
          admin: { width: "50%" },
          label: { en: "By", ru: "Кто" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "lead",
          type: "relationship",
          relationTo: "leads",
          admin: { width: "50%" },
          label: { en: "Lead", ru: "Лид" },
        },
        {
          name: "contact",
          type: "relationship",
          relationTo: "contacts",
          admin: { width: "50%" },
          label: { en: "Contact", ru: "Контакт" },
        },
      ],
    },
    {
      name: "body",
      type: "textarea",
      label: { en: "Details", ru: "Детали" },
    },
    {
      name: "meta",
      type: "json",
      admin: { position: "sidebar" },
      label: { en: "Meta", ru: "Мета" },
    },
  ],
};
