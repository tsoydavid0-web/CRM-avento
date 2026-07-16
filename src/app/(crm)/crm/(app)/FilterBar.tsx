"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";

type UserOpt = { id: string | number; label: string };

/** Search + filter controls for the board. Reflects state in the URL query so
 *  the server component can filter the leads it fetches. */
export function FilterBar({
  users,
  q = "",
  channel = "",
  owner = "",
}: {
  users: UserOpt[];
  q?: string;
  channel?: string;
  owner?: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(q);

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { q: text, channel, owner, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    router.push(qs ? `/crm?${qs}` : "/crm");
  }

  const active = Boolean(q || channel || owner);

  return (
    <form
      className="crm-filterbar"
      onSubmit={(e) => {
        e.preventDefault();
        apply({});
      }}
    >
      <input
        className="crm-input crm-search"
        placeholder="Поиск: имя, телефон…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select className="crm-input" value={channel} onChange={(e) => apply({ channel: e.target.value })}>
        <option value="">Все каналы</option>
        {CHANNEL_TYPE_OPTIONS.map((c) => (
          <option key={c.value} value={c.value}>{c.label.ru}</option>
        ))}
      </select>
      <select className="crm-input" value={owner} onChange={(e) => apply({ owner: e.target.value })}>
        <option value="">Все ответственные</option>
        {users.map((u) => <option key={String(u.id)} value={String(u.id)}>{u.label}</option>)}
      </select>
      <button className="crm-btn crm-btn-primary" type="submit">Найти</button>
      {active && (
        <button className="crm-btn crm-btn-ghost" type="button" onClick={() => { setText(""); router.push("/crm"); }}>
          Сбросить
        </button>
      )}
    </form>
  );
}
