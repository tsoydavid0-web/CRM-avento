"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LEAD_STATUS_OPTIONS } from "@/collections/Leads";

/**
 * Inline status switcher on a deal card. Changing the status moves the deal to
 * another pipeline column. Writes go through Payload's own REST endpoint
 * (`/api/leads/:id`), authenticated by the session cookie.
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
      setValue(prev);
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
      aria-label="Статус сделки"
    >
      {LEAD_STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label.ru}
        </option>
      ))}
    </select>
  );
}
