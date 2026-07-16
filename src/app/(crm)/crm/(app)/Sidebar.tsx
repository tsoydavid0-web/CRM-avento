"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** Left navigation for the CRM app — AmoCRM/Bitrix-style. Highlights the active
 *  section and handles logout via Payload's auth endpoint. */
const NAV = [
  { href: "/crm/dashboard", label: "Дашборд", icon: "📊", exact: false },
  { href: "/crm", label: "Сделки", icon: "🗂️", exact: true },
  { href: "/crm/contacts", label: "Контакты", icon: "👤", exact: false },
  { href: "/crm/channels", label: "Каналы", icon: "📡", exact: false },
  { href: "/crm/team", label: "Команда", icon: "👥", exact: false, adminOnly: true },
];

export function Sidebar({ email, isAdmin }: { email?: string | null; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch {
      /* ignore — navigate away regardless */
    }
    window.location.href = "/crm/login";
  }

  return (
    <aside className="crm-sidebar">
      <div className="crm-logo">Avento CRM</div>
      <nav className="crm-nav">
        {NAV.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "crm-nav-item active" : "crm-nav-item"}
            >
              <span className="crm-nav-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="crm-sidebar-foot">
        {email && <div className="crm-user" title={email}>{email}</div>}
        <button className="crm-logout" onClick={logout} disabled={busy}>
          Выйти
        </button>
      </div>
    </aside>
  );
}
