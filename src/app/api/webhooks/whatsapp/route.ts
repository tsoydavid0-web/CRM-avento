import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ingestLead } from "@/lib/crm/ingest";
import { getPayloadClient } from "@/lib/crm/payload";

/**
 * WhatsApp webhook → unified inbox.
 *
 * We target the WhatsApp Cloud API payload shape, which the chosen aggregator
 * (360dialog passes it through unchanged) and later a direct Meta integration
 * both speak — so this code survives the planned aggregator → Meta migration.
 *
 * GET  — verification handshake (Meta/360dialog send hub.challenge on setup).
 * POST — inbound messages. `value.metadata.phone_number_id` tells us WHICH
 *        WhatsApp number received it, so multiple numbers map to distinct
 *        Channel records.
 *
 * Setup (later):
 *   WHATSAPP_VERIFY_TOKEN — string you also enter in the provider dashboard
 *   WHATSAPP_APP_SECRET   — optional, to verify X-Hub-Signature-256
 */

export const dynamic = "force-dynamic";

/** Verification handshake. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge") ?? "";
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && expected && token === expected) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

function ack() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  let body: WhatsAppWebhook;
  try {
    body = (await request.json()) as WhatsAppWebhook;
  } catch {
    return ack();
  }

  const payload = await getPayloadClient().catch(() => null);
  if (!payload) return ack();

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      const profileName = value?.contacts?.[0]?.profile?.name;

      for (const message of value?.messages ?? []) {
        const text =
          message.text?.body ??
          message.button?.text ??
          message.interactive?.list_reply?.title ??
          message.interactive?.button_reply?.title;
        if (!text) continue;

        try {
          await ingestLead(payload, {
            channelType: "whatsapp",
            channelIdentifier: phoneNumberId,
            contact: {
              fullName: profileName,
              phone: message.from,
              handleType: "whatsapp",
              handleValue: message.from,
            },
            message: {
              body: text,
              direction: "inbound",
              externalId: `wa:${message.id}`,
            },
            lead: { sourceDetail: "whatsapp" },
            raw: message,
          });
        } catch {
          console.error("[whatsapp] ingest_failed");
        }
      }
    }
  }

  return ack();
}

// ---- Minimal WhatsApp Cloud API payload shapes (only what we read) --------
type WaText = { body?: string };
type WaMessage = {
  id: string;
  from: string;
  text?: WaText;
  button?: { text?: string };
  interactive?: {
    list_reply?: { title?: string };
    button_reply?: { title?: string };
  };
};
type WaValue = {
  metadata?: { phone_number_id?: string };
  contacts?: { profile?: { name?: string } }[];
  messages?: WaMessage[];
};
type WaChange = { value?: WaValue };
type WaEntry = { changes?: WaChange[] };
type WhatsAppWebhook = { entry?: WaEntry[] };
