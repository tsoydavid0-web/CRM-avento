import type { CollectionConfig } from "payload";

import { CHANNEL_TYPE_OPTIONS } from "./Channels";

/** Board columns. Order here is the intended left-to-right pipeline order. */
export const LEAD_STATUS_VALUES = [
  "new",
  "in_progress",
  "qualified",
  "closing",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

export const LEAD_STATUS_OPTIONS: { label: { en: string; ru: string }; value: LeadStatus }[] = [
  { label: { en: "New", ru: "Новый" }, value: "new" },
  { label: { en: "In conversation", ru: "Начали разговор" }, value: "in_progress" },
  { label: { en: "Qualified", ru: "Квалифицирован" }, value: "qualified" },
  { label: { en: "Closing", ru: "Этап закрытия" }, value: "closing" },
  { label: { en: "Won", ru: "Выиграно" }, value: "won" },
  { label: { en: "Lost", ru: "Проиграно" }, value: "lost" },
];

/**
 * Leads — one enquiry / deal, the card that moves across the Kanban board.
 *
 * Statuses are the board columns David asked for:
 *   new → in_progress → qualified → closing → won / lost
 *
 * Source attribution is first-class (David's key requirement): every lead points
 * at the exact `channel` account it came from, keeps a denormalized
 * `channelType`, plus campaign/UTM/landing/referrer and the raw source payload.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: {
    singular: { en: "Lead", ru: "Лид" },
    plural: { en: "Leads", ru: "Лиды" },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "channelType", "channel", "owner", "createdAt"],
    group: { en: "CRM", ru: "CRM" },
  },
  fields: [
    {
      // A readable label for the board card. Auto-filled from contact/channel on
      // create if left blank (see beforeValidate).
      name: "title",
      type: "text",
      label: { en: "Title", ru: "Заголовок" },
      admin: {
        description: {
          en: "Auto-filled from the contact + channel if left blank.",
          ru: "Заполнится автоматически из контакта и канала, если пусто.",
        },
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          options: LEAD_STATUS_OPTIONS,
          admin: { width: "50%" },
          label: { en: "Status", ru: "Статус" },
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
      name: "contact",
      type: "relationship",
      relationTo: "contacts",
      required: true,
      label: { en: "Contact", ru: "Контакт" },
    },
    // ---- Source attribution (знать откуда попал лид) ----------------------
    {
      type: "row",
      fields: [
        {
          name: "channel",
          type: "relationship",
          relationTo: "channels",
          admin: {
            width: "50%",
            description: {
              en: "The exact connected account this lead came from.",
              ru: "Конкретный подключённый аккаунт-источник лида.",
            },
          },
          label: { en: "Source account", ru: "Аккаунт-источник" },
        },
        {
          // Denormalized type for fast filtering / board grouping even before
          // the channel relation is populated.
          name: "channelType",
          type: "select",
          options: CHANNEL_TYPE_OPTIONS,
          admin: { width: "50%" },
          label: { en: "Channel type", ru: "Тип канала" },
        },
      ],
    },
    {
      name: "sourceDetail",
      type: "text",
      admin: {
        description: {
          en: "Campaign / post / ad set / form that produced the lead.",
          ru: "Кампания / пост / группа объявлений / форма — источник лида.",
        },
      },
      label: { en: "Source detail", ru: "Детали источника" },
    },
    {
      name: "utm",
      type: "group",
      label: { en: "UTM", ru: "UTM" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "source", type: "text", admin: { width: "33%" }, label: "utm_source" },
            { name: "medium", type: "text", admin: { width: "33%" }, label: "utm_medium" },
            { name: "campaign", type: "text", admin: { width: "34%" }, label: "utm_campaign" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "content", type: "text", admin: { width: "50%" }, label: "utm_content" },
            { name: "term", type: "text", admin: { width: "50%" }, label: "utm_term" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "landingUrl",
          type: "text",
          admin: { width: "50%" },
          label: { en: "Landing URL", ru: "Страница входа" },
        },
        {
          name: "referrer",
          type: "text",
          admin: { width: "50%" },
          label: { en: "Referrer", ru: "Реферер" },
        },
      ],
    },
    // ---- Qualification ----------------------------------------------------
    {
      type: "row",
      fields: [
        {
          name: "intent",
          type: "select",
          options: [
            { label: { en: "Buy", ru: "Покупка" }, value: "buy" },
            { label: { en: "Sell", ru: "Продажа" }, value: "sell" },
            { label: { en: "Rent", ru: "Аренда" }, value: "rent" },
            { label: { en: "Invest", ru: "Инвестиции" }, value: "invest" },
            { label: { en: "Relocation / residency", ru: "Релокация / ВНЖ" }, value: "relocation" },
            { label: { en: "Other", ru: "Другое" }, value: "other" },
          ],
          admin: { width: "50%" },
          label: { en: "Intent", ru: "Запрос" },
        },
        {
          name: "budget",
          type: "text",
          admin: { width: "50%" },
          label: { en: "Budget", ru: "Бюджет" },
        },
      ],
    },
    {
      name: "notes",
      type: "textarea",
      label: { en: "Notes", ru: "Заметки" },
    },
    /**
     * Full raw payload from the source (form body, webhook JSON). Kept for
     * debugging and future re-processing; never rendered to the public.
     */
    {
      name: "raw",
      type: "json",
      admin: {
        position: "sidebar",
        description: { en: "Raw source payload.", ru: "Сырые данные источника." },
      },
      label: { en: "Raw payload", ru: "Сырые данные" },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Give the board card a readable title when none was provided.
        if (data && !data.title) {
          const type = data.channelType ? String(data.channelType) : "lead";
          data.title = `New ${type} lead`;
        }
        return data;
      },
    ],
  },
};
