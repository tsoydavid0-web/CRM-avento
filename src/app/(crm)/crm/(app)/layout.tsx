import type { ReactNode } from "react";

import { requireUser } from "@/lib/crm/auth";
import { Sidebar } from "./Sidebar";

/**
 * Shell for all authenticated CRM screens (board, contacts, channels). Gates
 * access (redirects to /crm/login if signed out) and renders the persistent
 * sidebar. The login page lives OUTSIDE this group, so it has no sidebar.
 */
export default async function CrmAppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();

  return (
    <div className="crm-app">
      <Sidebar email={user.email} />
      <div className="crm-content">{children}</div>
    </div>
  );
}
