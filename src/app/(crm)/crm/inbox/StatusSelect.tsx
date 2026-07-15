"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LEAD_STATUS_OPTIONS } from "@/collections/Leads";

/**
 * Inline status switcher on a board card. Updating a lead's status = moving it
 * to another column. We PATCH Payload's own REST endpoint (`/api/leads/:id`),
 * which is already authenticated by the admin session cookie — no extra API.
 *
 * A dropdown (not drag-and-drop) keeps v1 reliable and touch-friendly; drag can
 * come later.
 */
export function StatusSelect({
  leadId,
  status,
}: {
  leadId: string | number;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    const prev = value;
    setValue(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("update_failed");
      router.refresh();
    } catch {
      setValue(prev); // revert on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      className="crm-status-select"
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Статус лида"
    >
      {LEAD_STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label.ru}
        </option>
      ))}
    </select>
  );
}
