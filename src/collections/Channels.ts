import type { CollectionConfig } from "payload";

/**
 * The channel types Avento can connect. Declared before the collection so its
 * `type` select can reference it. `CHANNEL_TYPE_VALUES` (a readonly tuple)
 * powers the `ChannelType` union; `CHANNEL_TYPE_OPTIONS` is a plain mutable
 * array for Payload's `options` (which expects a mutable `Option[]`).
 */
export const CHANNEL_TYPE_VALUES = [
  "site",
  "whatsapp",
  "telegram",
  "instagram",
  "tiktok",
  "x",
  "linkedin",
  "meta",
  "email",
  "manual",
] as const;

export type ChannelType = (typeof CHANNEL_TYPE_VALUES)[number];

export const CHANNEL_TYPE_OPTIONS: { label: { en: string; ru: string }; value: ChannelType }[] = [
  { label: { en: "Website", ru: "Сайт" }, value: "site" },
  { label: { en: "WhatsApp", ru: "WhatsApp" }, value: "whatsapp" },
  { label: { en: "Telegram", ru: "Telegram" }, value: "telegram" },
  { label: { en: "Instagram", ru: "Instagram" }, value: "instagram" },
  { label: { en: "TikTok", ru: "TikTok" }, value: "tiktok" },
  { label: { en: "X (Twitter)", ru: "X (Twitter)" }, value: "x" },
  { label: { en: "LinkedIn", ru: "LinkedIn" }, value: "linkedin" },
  { label: { en: "Meta Lead Ads", ru: "Meta Lead Ads" }, value: "meta" },
  { label: { en: "Email", ru: "Email" }, value: "email" },
  { label: { en: "Manual / call", ru: "Вручную / звонок" }, value: "manual" },
];

/**
 * Channels — the connected *accounts* a lead can arrive from.
 *
 * Avento runs several accounts per channel type (e.g. 2 websites, 3 Instagram
 * profiles, 1 WhatsApp number today with more later, +3 TikTok planned). We must
 * know not just the *type* of channel but *which exact account* produced a lead
 * — that is David's "знать откуда попал лид" requirement.
 *
 * So every inbound lead/message points at a Channel record. Adding a new
 * WhatsApp number or Instagram profile is data entry here, not a code change.
 *
 * `identifier` is how an inbound webhook is routed to the right Channel:
 *   - site       → domain (e.g. "avento-global.vercel.app")
 *   - whatsapp   → business phone number id / E.164
 *   - telegram   → bot id / @botname
 *   - instagram  → IG account id / @handle
 *   - tiktok     → account id / @handle
 * Secrets (tokens/keys) live in env, never here — this only stores the public id.
 */
export const Channels: CollectionConfig = {
  slug: "channels",
  labels: {
    singular: { en: "Channel", ru: "Канал" },
    plural: { en: "Channels", ru: "Каналы" },
  },
  access: {
    // Team-only. Channels carry routing config, not public data.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "type", "identifier", "active"],
    group: { en: "CRM", ru: "CRM" },
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      label: { en: "Name", ru: "Название" },
      admin: {
        description: {
          en: 'Human name, e.g. "Instagram @avento.porto" or "Site Global".',
          ru: 'Понятное имя, напр. «Instagram @avento.porto» или «Сайт Global».',
        },
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: CHANNEL_TYPE_OPTIONS,
          admin: { width: "50%" },
          label: { en: "Type", ru: "Тип" },
        },
        {
          name: "identifier",
          type: "text",
          index: true,
          admin: {
            width: "50%",
            description: {
              en: "Routing id: domain / phone / account id / @handle.",
              ru: "Идентификатор для маршрутизации: домен / телефон / id аккаунта / @handle.",
            },
          },
          label: { en: "Identifier", ru: "Идентификатор" },
        },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
      label: { en: "Active", ru: "Активен" },
    },
    {
      name: "notes",
      type: "textarea",
      label: { en: "Notes", ru: "Заметки" },
    },
  ],
};
