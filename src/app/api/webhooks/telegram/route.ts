import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ingestLead } from "@/lib/crm/ingest";
import { getPayloadClient } from "@/lib/crm/payload";

/**
 * POST /api/webhooks/telegram — inbound Telegram messages → unified inbox.
 *
 * Security: Telegram signs webhook calls with a secret you set via setWebhook's
 * `secret_token`; it echoes it back in the `X-Telegram-Bot-Api-Secret-Token`
 * header. We reject anything without the matching secret.
 *
 * Setup (later, when the bot token exists):
 *   TELEGRAM_BOT_TOKEN      — bot token from @BotFather
 *   TELEGRAM_WEBHOOK_SECRET — random string, also passed to setWebhook
 *   TELEGRAM_BOT_ID         — optional, to resolve the exact Channel record
 */

export const dynamic = "force-dynamic";

function ack() {
  // Telegram retries on non-2xx; always ack once we've safely handled (or
  // intentionally ignored) an update.
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const got = request.headers.get("x-telegram-bot-api-secret-token");
    if (got !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return ack();
  }

  const msg = update.message ?? update.edited_message;
  const text = msg?.text ?? msg?.caption;
  if (!msg?.from || !text) {
    // Non-message update (status, join, etc.) — nothing to ingest.
    return ack();
  }

  const from = msg.from;
  const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ");

  try {
    const payload = await getPayloadClient();
    await ingestLead(payload, {
      channelType: "telegram",
      channelIdentifier: process.env.TELEGRAM_BOT_ID,
      contact: {
        fullName: fullName || from.username,
        preferredLang: from.language_code,
        handleType: "telegram",
        handleValue: String(from.id),
      },
      message: {
        body: text,
        direction: "inbound",
        externalId: `tg:${msg.chat.id}:${msg.message_id}`,
      },
      lead: { sourceDetail: "telegram" },
      raw: update,
    });
  } catch {
    console.error("[telegram] ingest_failed");
    // Still ack: retrying won't fix a DB error and would loop.
  }

  return ack();
}

// ---- Minimal Telegram payload shapes (only what we read) ------------------
type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};
type TelegramMessage = {
  message_id: number;
  chat: { id: number };
  from?: TelegramUser;
  text?: string;
  caption?: string;
};
type TelegramUpdate = {
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
};
