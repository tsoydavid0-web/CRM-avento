import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";
import { ingestLead, type IngestInput } from "@/lib/crm/ingest";
import { getPayloadClient } from "@/lib/crm/payload";
import { getClientIp, rateLimit } from "@/lib/security/rateLimit";

/**
 * POST /api/intake — the generic, authenticated ingestion endpoint.
 *
 * External systems (the 2 marketing websites, and later any integration that
 * doesn't have a dedicated webhook) normalize their payload to this shape and
 * post it here. Everything funnels through the same `ingestLead` write path.
 *
 * Auth: a shared secret in the `x-intake-key` header must equal INTAKE_API_KEY.
 * In production the key is REQUIRED (fail closed); in dev an unset key is
 * allowed so the endpoint is testable locally.
 */

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 30, windowMs: 60_000 };
const MAX_BODY_BYTES = 32 * 1024;

const CHANNEL_TYPES = CHANNEL_TYPE_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const str = (max: number) => z.string().trim().max(max).optional();

const intakeSchema = z.object({
  channelType: z.enum(CHANNEL_TYPES),
  channelIdentifier: str(200),
  contact: z.object({
    fullName: str(120),
    phone: str(40),
    email: z.string().trim().email().max(200).optional(),
    preferredLang: str(10),
    handleType: str(40),
    handleValue: str(200),
  }),
  message: z
    .object({
      body: str(8000),
      direction: z.enum(["inbound", "outbound"]).optional(),
      externalId: str(200),
      attachments: z
        .array(z.object({ url: z.string().max(1000), kind: str(40) }))
        .max(20)
        .optional(),
    })
    .optional(),
  lead: z
    .object({
      title: str(200),
      intent: str(40),
      budget: str(100),
      sourceDetail: str(200),
      landingUrl: str(500),
      referrer: str(500),
      notes: str(4000),
      utm: z
        .object({
          source: str(200),
          medium: str(200),
          campaign: str(200),
          content: str(200),
          term: str(200),
        })
        .optional(),
    })
    .optional(),
  consent: z.boolean().optional(),
});

function json(body: unknown, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

/** Constant-time-ish key check; fail closed in production. */
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.INTAKE_API_KEY;
  if (!expected) {
    // No key configured: allow only outside production so local dev works.
    return process.env.NODE_ENV !== "production";
  }
  const provided = request.headers.get("x-intake-key") ?? "";
  return provided.length === expected.length && provided === expected;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`intake:${ip}`, RATE_LIMIT);
  if (!limit.success) {
    return json({ ok: false, error: "rate_limited" }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  if (!isAuthorized(request)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: "payload_too_large" }, 413);
    }
    raw = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const parsed = intakeSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return json({ ok: false, error: "validation_failed", fields: fieldErrors }, 400);
  }

  try {
    const payload = await getPayloadClient();
    const result = await ingestLead(payload, {
      ...parsed.data,
      raw: parsed.data,
    } as IngestInput);
    return json({ ok: true, leadId: result.leadId, deduped: result.deduped }, 200);
  } catch {
    console.error("[intake] persist_failed");
    return json({ ok: false, error: "persist_failed" }, 502);
  }
}
