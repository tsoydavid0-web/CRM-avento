"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Mark a task done / not done. PATCHes Payload REST, session-authed. */
export function TaskToggle({ taskId, done }: { taskId: string | number; done: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(done);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setChecked(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <input
      type="checkbox"
      className="crm-check"
      checked={checked}
      disabled={busy}
      onChange={toggle}
      aria-label="Выполнено"
    />
  );
}
