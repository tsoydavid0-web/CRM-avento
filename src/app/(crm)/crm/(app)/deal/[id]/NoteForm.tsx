"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Add a note to a deal. Notes are stored as an Activity (type "note") so they
 * show up in the timeline. Posts via Payload REST, session-authed.
 */
export function NoteForm({
  leadId,
  contactId,
}: {
  leadId: string | number;
  contactId?: string | number;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      // Relationship fields expect numeric IDs (Postgres), so coerce.
      const leadRef = Number(leadId);
      const contactRef = contactId != null ? Number(contactId) : undefined;
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "note", body, lead: leadRef, contact: contactRef }),
      });
      if (!res.ok) throw new Error("failed");
      setText("");
      router.refresh();
    } catch {
      /* keep text so the user can retry */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="crm-note-form" onSubmit={submit}>
      <textarea
        className="crm-note-input"
        placeholder="Добавить заметку…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
      />
      <button className="crm-btn crm-btn-primary" type="submit" disabled={busy || !text.trim()}>
        {busy ? "…" : "Добавить заметку"}
      </button>
    </form>
  );
}
