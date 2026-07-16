"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ChannelOpt = { id: string | number; label: string };

const INTENTS = [
  { value: "", label: "— запрос —" },
  { value: "buy", label: "Покупка" },
  { value: "sell", label: "Продажа" },
  { value: "rent", label: "Аренда" },
  { value: "invest", label: "Инвестиции" },
  { value: "relocation", label: "Релокация / ВНЖ" },
  { value: "other", label: "Другое" },
];

export function NewLeadForm({ channels }: { channels: ChannelOpt[] }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", channelId: "", intent: "", budget: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.name.trim() && !f.phone.trim()) {
      setError("Укажите имя или телефон");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/crm/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      router.push(`/crm/deal/${data.leadId}`);
    } catch {
      setError("Не удалось создать лид");
      setBusy(false);
    }
  }

  return (
    <form className="crm-form" onSubmit={submit}>
      <label className="crm-field"><span>Имя</span>
        <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Имя клиента" />
      </label>
      <div className="crm-form-row">
        <label className="crm-field"><span>Телефон</span>
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+351…" />
        </label>
        <label className="crm-field"><span>Email</span>
          <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="email@…" />
        </label>
      </div>
      <div className="crm-form-row">
        <label className="crm-field"><span>Источник</span>
          <select value={f.channelId} onChange={(e) => set("channelId", e.target.value)}>
            <option value="">Вручную / звонок</option>
            {channels.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="crm-field"><span>Запрос</span>
          <select value={f.intent} onChange={(e) => set("intent", e.target.value)}>
            {INTENTS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </label>
      </div>
      <label className="crm-field"><span>Бюджет</span>
        <input value={f.budget} onChange={(e) => set("budget", e.target.value)} placeholder="€350 000" />
      </label>
      <label className="crm-field"><span>Заметка</span>
        <textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Что известно о клиенте" />
      </label>

      {error && <div className="crm-login-error">{error}</div>}
      <div className="crm-form-actions">
        <button className="crm-btn crm-btn-primary" type="submit" disabled={busy}>
          {busy ? "Создаём…" : "Создать лид"}
        </button>
      </div>
    </form>
  );
}
