import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { leadSchema, type LeadInput } from "@/lib/validation";
import { isHoneypotTriggered } from "@/lib/security/honeypot";
import { getClientIp, rateLimit } from "@/lib/security/rateLimit";
import { getPayloadClient } from "@/lib/crm/payload";
import { ingestLead, type IngestInput } from "@/lib/crm/ingest";

/**
 * POST /api/lead — public lead intake for the homepage form.
 *
 * Pipeline (fail closed, cheapest checks first):
 *   1. Method / content-type guard
 *   2. Rate limit by client IP            -> 429
 *   3. Honeypot                            -> 200 (silently dropped, no hint to bots)
 *   4. Zod validation (trust boundary)     -> 400 with field-level error codes
 *   5. Deliver notification (Resend stub)  -> 200 ok
 *
 * PII: `name` + `phone` are personal data (GDPR). They are never logged in the
 * clear here; only non-identifying events are logged.
 */

// Route handlers run on the Node runtime by default; the in-memory rate limiter
// lives per-instance. Not cached (POST is never cached), but be explicit.
export const dynamic = "force-dynamic";

// Abuse limits: 5 submissions per minute per IP is generous for a human filling
// one form, tight enough to blunt scripted spam.
const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

// Reject oversized bodies before parsing (defense against memory abuse).
const MAX_BODY_BYTES = 16 * 1024;

function json(body: unknown, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: NextRequest) {
  // 1. Content-type guard — we only accept JSON from our own form.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }

  // 2. Rate limit.
  const ip = getClientIp(request);
  const limit = rateLimit(`lead:${ip}`, RATE_LIMIT);
  if (!limit.success) {
    return json({ ok: false, error: "rate_limited" }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
      "X-RateLimit-Limit": String(limit.limit),
      "X-RateLimit-Remaining": String(limit.remaining),
    });
  }

  // Reject oversized bodies early, before buffering them into memory.
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  // Parse body defensively (size cap + malformed JSON -> 400, never 500).
  let raw: unknown;
  try {
    const text = await request.text();
    // Defense in depth: content-length can be absent (chunked) or spoofed.
    if (text.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: "payload_too_large" }, 413);
    }
    raw = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return json({ ok: false, error: "invalid_body" }, 400);
  }
  const body = raw as Record<string, unknown>;

  // 3. Honeypot — runs BEFORE validation. If tripped, respond exactly like a
  //    success so bots get no signal and don't adapt. Nothing is delivered.
  if (isHoneypotTriggered(body.company)) {
    // Non-PII log only. No name/phone.
    console.info("[lead] dropped: honeypot");
    return json({ ok: true }, 200);
  }

  // 4. Validation — the trust boundary. Only parsed data proceeds.
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    // Return machine-readable field codes for the client to localize.
    // Never echo submitted values back (avoids reflecting attacker input).
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return json({ ok: false, error: "validation_failed", fields: fieldErrors }, 400);
  }

  // 5. Persist to the CRM (source of truth). The exact site account is resolved
  //    from the request host so multiple websites map to distinct Channels.
  const host = request.headers.get("host") ?? undefined;
  const referrer = request.headers.get("referer") ?? undefined;
  try {
    const payload = await getPayloadClient();
    await ingestLead(payload, buildIngestInput(parsed.data, { host, referrer }));
  } catch {
    // Do not leak internals. Log a non-PII marker only.
    console.error("[lead] persist_failed");
    return json({ ok: false, error: "persist_failed" }, 502);
  }

  // 6. Best-effort notification. Never fails the request — the lead is already
  //    safely stored; email is a convenience on top.
  try {
    await deliverLead(parsed.data);
  } catch {
    console.error("[lead] notify_failed");
  }

  return json({ ok: true }, 200);
}

/** Map the validated public-form payload onto the shared CRM ingest shape. */
function buildIngestInput(
  lead: LeadInput,
  meta: { host?: string; referrer?: string },
): IngestInput {
  // Fold the optional qualifiers into a readable note for the team.
  const noteParts: string[] = [];
  if (lead.city) noteParts.push(`City: ${lead.city}`);
  if (lead.price) noteParts.push(`Property value: ${lead.price}`);
  if (lead.interest) noteParts.push(`Interest: ${lead.interest}`);
  if (lead.mortgage) noteParts.push("Wants mortgage help");
  if (lead.comment) noteParts.push(lead.comment);

  return {
    channelType: "site",
    channelIdentifier: meta.host,
    contact: {
      fullName: lead.name,
      phone: lead.phone,
    },
    consent: lead.consent,
    lead: {
      budget: lead.budget,
      sourceDetail: lead.source,
      landingUrl: lead.landingUrl,
      referrer: meta.referrer,
      notes: noteParts.length ? noteParts.join("\n") : undefined,
      utm: {
        source: lead.utm_source,
        medium: lead.utm_medium,
        campaign: lead.utm_campaign,
        content: lead.utm_content,
        term: lead.utm_term,
      },
    },
    raw: lead,
  };
}

/**
 * Forward the validated lead to the sales inbox.
 *
 * TODO(devops/security): wire up Resend.
 *   - RESEND_API_KEY   — provider key (server-only env, NEVER NEXT_PUBLIC_*)
 *   - LEAD_NOTIFY_TO   — destination inbox
 *   - LEAD_NOTIFY_FROM — verified sender
 * All read from `process.env` at call time; no secret is ever committed.
 *
 * Until configured this is a no-op that logs a NON-PII marker so the form works
 * end-to-end in the prototype without dropping data silently in prod (missing
 * config throws so the caller returns 502 rather than pretending success).
 */
async function deliverLead(lead: LeadInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM;

  if (!apiKey || !to || !from) {
    // Review/preview deploys can opt into stubbed delivery with LEAD_ALLOW_STUB=1
    // so the form shows success for QA. NEVER set this on the real production
    // env — without it, unconfigured delivery fails loudly instead of silently
    // dropping a real lead.
    const allowStub = process.env.LEAD_ALLOW_STUB === "1";
    if (process.env.NODE_ENV === "production" && !allowStub) {
      throw new Error("lead delivery not configured");
    }
    // Dev, or a review deploy with the flag: acknowledge without emailing.
    // Log only non-PII shape.
    console.info(
      `[lead] received (delivery stubbed) hasCity=${Boolean(lead.city)} mortgage=${lead.mortgage}`,
    );
    return;
  }

  // TODO: replace with real Resend call, e.g.
  //   const { Resend } = await import("resend");
  //   await new Resend(apiKey).emails.send({ from, to, subject: "New lead", text: renderLead(lead) });
  // Keep PII out of logs; only the provider receives name/phone.
  throw new Error("Resend integration not implemented yet");
}
