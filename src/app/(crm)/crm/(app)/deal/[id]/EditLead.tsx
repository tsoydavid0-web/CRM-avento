"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserOpt = { id: string | number; label: string };

const INTENTS = [
  { value: "", label: "—" },
  { value: "buy", label: "Покупка" },
  { value: "sell", label: "Продажа" },
  { value: "rent", label: "Аренда" },
  { value: "invest", label: "Инвестиции" },
  { value: "relocation", label: "Релокация / ВНЖ" },
  { value: "other", label: "Другое" },
];

/** Edit the working fields of a deal: owner, intent, budget. Saves via Payload
 *  REST (`PATCH /api/leads/:id`). */
export function EditLead({
  leadId,
  users,
  owner,
  intent,
  budget,
}: {
  leadId: string | number;
  users: UserOpt[];
  owner?: string | number | null;
  intent?: string;
  budget?: string;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    owner: owner != null ? String(owner) : "",
    intent: intent ?? "",
    budget: budget ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(k: string, v: string) {
    setF((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: f.owner ? Number(f.owner) : null,
          intent: f.intent || null,
          budget: f.budget || null,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setSaved(true);
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="crm-edit">
      <label className="crm-field"><span>Ответственный</span>
        <select value={f.owner} onChange={(e) => set("owner", e.target.value)}>
          <option value="">— не назначен —</option>
          {users.map((u) => <option key={String(u.id)} value={String(u.id)}>{u.label}</option>)}
        </select>
      </label>
      <div className="crm-form-row">
        <label className="crm-field"><span>Запрос</span>
          <select value={f.intent} onChange={(e) => set("intent", e.target.value)}>
            {INTENTS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </label>
        <label className="crm-field"><span>Бюджет</span>
          <input value={f.budget} onChange={(e) => set("budget", e.target.value)} placeholder="€…" />
        </label>
      </div>
      <div className="crm-edit-foot">
        <button className="crm-btn crm-btn-primary" onClick={save} disabled={busy} type="button">
          {busy ? "…" : "Сохранить"}
        </button>
        {saved && <span className="crm-ok">Сохранено ✓</span>}
      </div>
    </div>
  );
}
