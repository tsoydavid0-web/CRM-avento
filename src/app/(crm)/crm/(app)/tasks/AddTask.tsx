"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Add a task/reminder. Used on the deal card (with a leadId) and on the Tasks
 *  page (standalone). Posts to Payload REST; the assignee defaults to the
 *  creator server-side. */
export function AddTask({
  leadId,
  contactId,
  compact,
}: {
  leadId?: string | number;
  contactId?: string | number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
          lead: leadId != null ? Number(leadId) : undefined,
          contact: contactId != null ? Number(contactId) : undefined,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setTitle("");
      setDueAt("");
      router.refresh();
    } catch {
      /* keep input for retry */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={compact ? "crm-taskadd crm-taskadd-compact" : "crm-taskadd"} onSubmit={submit}>
      <input
        className="crm-input"
        placeholder="Что сделать? (напр. перезвонить)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="crm-input crm-due"
        type="datetime-local"
        value={dueAt}
        onChange={(e) => setDueAt(e.target.value)}
        aria-label="Срок"
      />
      <button className="crm-btn crm-btn-primary" type="submit" disabled={busy || !title.trim()}>
        {busy ? "…" : "Добавить"}
      </button>
    </form>
  );
}
