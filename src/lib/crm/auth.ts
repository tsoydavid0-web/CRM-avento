import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { getPayloadClient } from "./payload";

/**
 * CRM auth helpers. The CRM app has its OWN login (`/crm/login`) — managers never
 * see the Payload `/admin`. Under the hood we still use Payload's user auth
 * (email/password + the `payload-token` cookie), just with our own UI.
 */

export async function getSessionUser() {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await nextHeaders() });
  return { payload, user };
}

/** Use at the top of any protected CRM page/layout. Redirects to login if out. */
export async function requireUser() {
  const { payload, user } = await getSessionUser();
  if (!user) redirect("/crm/login");
  return { payload, user };
}
