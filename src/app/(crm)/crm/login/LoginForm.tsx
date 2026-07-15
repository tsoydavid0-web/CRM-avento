"use client";

import { useState } from "react";

/**
 * CRM login form. Posts to Payload's own auth endpoint (`/api/users/login`),
 * which sets the httpOnly session cookie on success. On success we hard-navigate
 * to the board so the new cookie is picked up by the server components.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Неверная почта или пароль");
        setBusy(false);
        return;
      }
      window.location.href = "/crm/dashboard";
    } catch {
      setError("Не удалось войти. Попробуйте ещё раз.");
      setBusy(false);
    }
  }

  return (
    <form className="crm-login-card" onSubmit={onSubmit}>
      <div className="crm-login-brand">Avento CRM</div>
      <p className="crm-login-sub">Вход для менеджеров</p>

      <label className="crm-field">
        <span>Почта</span>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="crm-field">
        <span>Пароль</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error && <div className="crm-login-error">{error}</div>}

      <button className="crm-btn crm-btn-primary" type="submit" disabled={busy}>
        {busy ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}
