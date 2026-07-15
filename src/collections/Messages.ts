import type { CollectionConfig } from "payload";

import { CHANNEL_TYPE_OPTIONS } from "./Channels";

/**
 * Messages — the unified inbox thread across every channel.
 *
 * Each row is one message (in or out) tied to a Contact + Lead + the exact
 * Channel account. `externalId` is the channel's own message id and is used to
 * make webhook delivery idempotent (a redelivered webhook must not create a
 * duplicate row).
 */
export const Messages: CollectionConfig = {
  slug: "messages",
  labels: {
    singular: { en: "Message", ru: "Сообщение" },
    plural: { en: "Messages", ru: "Сообщения" },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: "preview",
    defaultColumns: ["preview", "direction", "channelType", "contact", "createdAt"],
    group: { en: "CRM", ru: "CRM" },
  },
  fields: [
    {
      // Short read-only label for admin lists; derived from body on save.
      name: "preview",
      type: "text",
      admin: { readOnly: true, hidden: true },
    },
    {
      type: "row",
      fields: [
        {
          name: "direction",
          type: "select",
          required: true,
          options: [
            { label: { en: "Inbound", ru: "Входящее" }, value: "inbound" },
            { label: { en: "Outbound", ru: "Исходящее" }, value: "outbound" },
          ],
          admin: { width: "50%" },
          label: { en: "Direction", ru: "Направление" },
        },
        {
          name: "channelType",
          type: "select",
          options: CHANNEL_TYPE_OPTIONS,
          admin: { width: "50%" },
          label: { en: "Channel type", ru: "Тип канала" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "contact",
          type: "relationship",
          relationTo: "contacts",
          admin: { width: "50%" },
          label: { en: "Contact", ru: "Контакт" },
        },
        {
          name: "lead",
          type: "relationship",
          relationTo: "leads",
          admin: { width: "50%" },
          label: { en: "Lead", ru: "Лид" },
        },
      ],
    },
    {
      name: "channel",
      type: "relationship",
      relationTo: "channels",
      label: { en: "Source account", ru: "Аккаунт-источник" },
    },
    {
      name: "body",
      type: "textarea",
      label: { en: "Message", ru: "Сообщение" },
    },
    {
      name: "attachments",
      type: "array",
      label: { en: "Attachments", ru: "Вложения" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "url", type: "text", admin: { width: "70%" }, label: { en: "URL", ru: "URL" } },
            { name: "kind", type: "text", admin: { width: "30%" }, label: { en: "Kind", ru: "Тип" } },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "author",
          type: "select",
          defaultValue: "contact",
          options: [
            { label: { en: "Contact", ru: "Контакт" }, value: "contact" },
            { label: { en: "Team member", ru: "Менеджер" }, value: "user" },
            { label: { en: "AI", ru: "ИИ" }, value: "ai" },
          ],
          admin: { width: "50%" },
          label: { en: "Author", ru: "Автор" },
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: { en: "Sent", ru: "Отправлено" }, value: "sent" },
            { label: { en: "Delivered", ru: "Доставлено" }, value: "delivered" },
            { label: { en: "Read", ru: "Прочитано" }, value: "read" },
            { label: { en: "Failed", ru: "Ошибка" }, value: "failed" },
          ],
          admin: { width: "50%" },
          label: { en: "Status", ru: "Статус" },
        },
      ],
    },
    {
      // Channel's own message id — the idempotency key for inbound webhooks.
      name: "externalId",
      type: "text",
      index: true,
      admin: { position: "sidebar" },
      label: { en: "External id", ru: "Внешний id" },
    },
    {
      name: "raw",
      type: "json",
      admin: { position: "sidebar" },
      label: { en: "Raw payload", ru: "Сырые данные" },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Keep a short preview for admin list views without exposing the full body.
        if (data && typeof data.body === "string") {
          data.preview = data.body.slice(0, 80);
        }
        return data;
      },
    ],
  },
};
