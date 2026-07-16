import type { CollectionConfig } from "payload";

/**
 * Tasks — reminders/to-dos tied to a lead ("перезвонить в субботу"). Keeps deals
 * moving so nothing falls through the cracks. Distinct from Activities (which is
 * the historical timeline): a task has a due date, an assignee and a done state.
 */
export const Tasks: CollectionConfig = {
  slug: "tasks",
  labels: {
    singular: { en: "Task", ru: "Задача" },
    plural: { en: "Tasks", ru: "Задачи" },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "dueAt", "done", "assignee", "lead"],
    group: { en: "CRM", ru: "CRM" },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: { en: "Task", ru: "Задача" },
    },
    {
      type: "row",
      fields: [
        {
          name: "dueAt",
          type: "date",
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
          label: { en: "Due", ru: "Срок" },
        },
        {
          name: "done",
          type: "checkbox",
          defaultValue: false,
          admin: { width: "50%" },
          label: { en: "Done", ru: "Выполнено" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "assignee",
          type: "relationship",
          relationTo: "users",
          admin: { width: "50%" },
          label: { en: "Assignee", ru: "Ответственный" },
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
      name: "contact",
      type: "relationship",
      relationTo: "contacts",
      label: { en: "Contact", ru: "Контакт" },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Default the assignee to whoever creates the task.
        if (operation === "create" && req?.user && !data.assignee) {
          data.assignee = req.user.id;
        }
        return data;
      },
    ],
  },
};
