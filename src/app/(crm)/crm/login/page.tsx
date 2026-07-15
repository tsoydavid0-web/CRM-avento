import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/crm/auth";
import { LoginForm } from "./LoginForm";

/** CRM login screen. Already-authenticated users skip straight to the board. */
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { user } = await getSessionUser();
  if (user) redirect("/crm/dashboard");

  return (
    <div className="crm-login-shell">
      <LoginForm />
    </div>
  );
}
