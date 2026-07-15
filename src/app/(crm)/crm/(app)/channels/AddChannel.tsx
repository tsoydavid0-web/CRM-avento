"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";

/**
 * Add a connected source account (a website, a WhatsApp number, one of the
 * Instagram profiles…). Writes via Payload REST (`/api/channels`), session-authed.
 */
export function AddChannel() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [type, setType] = useState("site");
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, type, identifier, active: true }),
      });
      if (!res.ok) throw new Error("create_failed");
      setLabel("");
      setIdentifier("");
      router.refresh();
    } catch {
      setError("Не удалось добавить канал");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="crm-addbar" onSubmit={onSubmit}>
      <input
        className="crm-input"
        placeholder="Название (напр. Instagram @avento.porto)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
      />
      <select
        className="crm-input"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        {CHANNEL_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label.ru}
          </option>
        ))}
      </select>
      <input
        className="crm-input"
        placeholder="Идентификатор (домен / телефон / @handle)"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <button className="crm-btn crm-btn-primary" type="submit" disabled={busy}>
        {busy ? "…" : "Добавить"}
      </button>
      {error && <span className="crm-login-error">{error}</span>}
    </form>
  );
}
