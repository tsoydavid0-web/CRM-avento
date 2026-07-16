"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Create a team account. Posts to Payload's `/api/users` (admin-only on the
 * server). The new person then logs in at /crm/login with these credentials.
 */
export function AddUser() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!email.trim() || password.length < 8) {
      setError("Укажите почту и пароль (минимум 8 символов)");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (!res.ok) {
        setError(res.status === 403 ? "Только админ может создавать аккаунты" : "Не удалось создать аккаунт (возможно, почта занята)");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setRole("agent");
      setOk(true);
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="crm-userform" onSubmit={submit}>
      <input className="crm-input" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="crm-input" type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="crm-input" type="password" placeholder="Пароль (мин. 8)" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select className="crm-input" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="agent">Агент</option>
        <option value="admin">Админ</option>
      </select>
      <button className="crm-btn crm-btn-primary" type="submit" disabled={busy}>
        {busy ? "…" : "Создать аккаунт"}
      </button>
      {error && <span className="crm-login-error">{error}</span>}
      {ok && <span className="crm-ok">Аккаунт создан ✓</span>}
    </form>
  );
}
