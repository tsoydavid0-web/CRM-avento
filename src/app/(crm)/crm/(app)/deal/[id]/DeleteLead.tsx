"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Delete button on the deal detail page. Two-step inline confirm rather than
 * a native confirm() popup — this is a destructive, irreversible action, and
 * `Leads.access.delete` (admin-only) is the real gate; a non-admin sees the
 * button but gets a clear inline error instead of a silent 403.
 */
export function DeleteLead({ leadId }: { leadId: string | number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) {
        setError(
          res.status === 403
            ? "Нет прав на удаление — нужна роль администратора."
            : "Не удалось удалить. Попробуйте ещё раз.",
        );
        setBusy(false);
        return;
      }
      router.push("/crm");
      router.refresh();
    } catch {
      setError("Не удалось удалить. Попробуйте ещё раз.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="crm-btn crm-btn-sm crm-btn-ghost crm-btn-danger"
        onClick={() => setConfirming(true)}
      >
        Удалить
      </button>
    );
  }

  return (
    <span className="crm-delete-confirm">
      <span className="crm-delete-confirm-text">Точно удалить?</span>
      <button
        type="button"
        className="crm-btn crm-btn-sm crm-btn-danger-solid"
        onClick={onDelete}
        disabled={busy}
      >
        {busy ? "Удаляю…" : "Да, удалить"}
      </button>
      <button
        type="button"
        className="crm-btn crm-btn-sm crm-btn-ghost"
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
        disabled={busy}
      >
        Отмена
      </button>
      {error && <span className="crm-delete-error">{error}</span>}
    </span>
  );
}
