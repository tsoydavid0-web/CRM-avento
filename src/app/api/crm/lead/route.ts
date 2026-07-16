import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ingestLead } from "@/lib/crm/ingest";
import { getPayloadClient } from "@/lib/crm/payload";
import { getClientIp, rateLimit } from "@/lib/security/rateLimit";

const RATE_LIMIT = { limit: 60, windowMs: 60_000 };
const MAX_BODY_BYTES = 16 * 1024;

/**
 * POST /api/crm/lead — create a lead by hand from inside the CRM (e.g. a phone
 * call). Authenticated (team session) only; reuses the shared ingest path so the
 * contact is deduped and a timeline entry is written, just like channel leads.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  // Per-user rate limit — blunts a compromised session spamming lead creation.
  const limit = rateLimit(`crmlead:${user.id ?? getClientIp(request)}`, RATE_LIMIT);
  if (!limit.success) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!name && !phone) {
    return NextResponse.json({ ok: false, error: "name_or_phone_required" }, { status: 400 });
  }

  // If a source account was chosen, inherit its type; otherwise mark as manual.
  let channelType = "manual";
  let channelIdentifier: string | undefined;
  if (body.channelId) {
    try {
      const ch = await payload.findByID({ collection: "channels", id: Number(body.channelId), depth: 0 });
      if (ch?.type) channelType = ch.type as string;
      channelIdentifier = (ch?.identifier as string) || undefined;
    } catch {
      /* fall back to manual */
    }
  }

  try {
    const res = await ingestLead(payload, {
      channelType: channelType as never,
      channelIdentifier,
      contact: { fullName: name || undefined, phone: phone || undefined, email: email || undefined },
      lead: {
        title: name || phone || "Новый лид",
        intent: body.intent ? String(body.intent) : undefined,
        budget: body.budget ? String(body.budget) : undefined,
        sourceDetail: body.channelId ? undefined : "Ручной ввод",
        notes: body.notes ? String(body.notes) : undefined,
      },
      // No GDPR consent for manual entries — the lawful basis for a phone/walk-in
      // lead is legitimate interest, not consent. Recording a false consent would
      // itself be a data-accuracy problem. Only the public form stamps consent.
    });
    return NextResponse.json({ ok: true, leadId: res.leadId }, { status: 200 });
  } catch {
    console.error("[crm/lead] create_failed");
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 500 });
  }
}
