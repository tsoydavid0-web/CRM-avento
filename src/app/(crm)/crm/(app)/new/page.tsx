import Link from "next/link";

import { requireUser } from "@/lib/crm/auth";
import { NewLeadForm } from "./NewLeadForm";

/** Manual lead entry — for calls / walk-ins that didn't come through a channel. */
export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const { payload } = await requireUser();
  const { docs } = await payload.find({ collection: "channels", limit: 200, sort: "label", depth: 0 });
  const channels = (docs as { id: string | number; label?: string }[]).map((c) => ({
    id: c.id,
    label: c.label || "—",
  }));

  return (
    <>
      <header className="crm-topbar crm-deal-top">
        <div className="crm-deal-head">
          <Link href="/crm" className="crm-back">← К воронке</Link>
          <h1>Новый лид</h1>
        </div>
      </header>
      <div className="crm-section crm-narrow">
        <p className="crm-hint">Занеси лид вручную — например, после звонка. Он появится в воронке в колонке «Новый».</p>
        <NewLeadForm channels={channels} />
      </div>
    </>
  );
}
