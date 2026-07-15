import type { Payload, Where } from "payload";

import type { ChannelType } from "@/collections/Channels";
import { normalizePhone } from "./phone";

/**
 * The single write path every channel uses.
 *
 * Site form, Telegram webhook, WhatsApp webhook (and later Instagram, Meta Lead
 * Ads…) all normalize their payload into `IngestInput` and call `ingestLead`.
 * That guarantees a contact is deduped, a lead is attributed to the exact source
 * account, an inbox message is recorded, and the timeline gets an event —
 * consistently, from one place.
 */

export type UtmInput = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type IngestInput = {
  /** Channel type (site / whatsapp / telegram / instagram …). */
  channelType: ChannelType;
  /**
   * Public id used to resolve WHICH connected account this is (domain / phone /
   * @handle / account id). Lets us tell apart 2 sites or 3 Instagram profiles.
   */
  channelIdentifier?: string;

  contact: {
    fullName?: string;
    phone?: string;
    email?: string;
    preferredLang?: string;
    /** Per-channel handle (telegram id, wa phone, ig username) for matching. */
    handleType?: string;
    handleValue?: string;
  };

  /** Optional first inbound message to drop into the inbox. */
  message?: {
    body?: string;
    direction?: "inbound" | "outbound";
    externalId?: string;
    attachments?: { url: string; kind?: string }[];
  };

  lead?: {
    title?: string;
    intent?: string;
    budget?: string;
    sourceDetail?: string;
    utm?: UtmInput;
    landingUrl?: string;
    referrer?: string;
    notes?: string;
  };

  /** GDPR consent captured at this touchpoint. */
  consent?: boolean;

  /** Full raw source payload, stored for debugging / re-processing. */
  raw?: unknown;
};

export type IngestResult = {
  contactId: string | number;
  leadId: string | number;
  messageId?: string | number;
  deduped: boolean;
};

/**
 * Resolve the exact Channel record for an inbound event. Prefers an exact
 * (type + identifier) match, then falls back to any active channel of that type,
 * then null. Returns the channel id or null.
 */
async function resolveChannelId(
  payload: Payload,
  channelType: ChannelType,
  identifier?: string,
): Promise<string | number | null> {
  if (identifier) {
    const exact = await payload.find({
      collection: "channels",
      where: {
        and: [
          { type: { equals: channelType } },
          { identifier: { equals: identifier } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    if (exact.docs[0]) return exact.docs[0].id;
  }

  const byType = await payload.find({
    collection: "channels",
    where: {
      and: [{ type: { equals: channelType } }, { active: { equals: true } }],
    },
    limit: 1,
    depth: 0,
  });
  return byType.docs[0]?.id ?? null;
}

/**
 * Find an existing contact by normalized phone → email → channel handle, or
 * create a new one. Fills in any fields that were previously blank; never
 * overwrites existing data.
 */
async function upsertContact(
  payload: Payload,
  input: IngestInput["contact"],
  consent?: boolean,
): Promise<{ id: string | number; deduped: boolean }> {
  const phone = normalizePhone(input.phone);
  const email = input.email?.trim().toLowerCase() || undefined;

  // Build an OR match across the identifiers we have.
  const or: Where[] = [];
  if (phone) or.push({ phone: { equals: phone } });
  if (email) or.push({ email: { equals: email } });
  if (input.handleValue) or.push({ "identities.value": { equals: input.handleValue } });

  let existing;
  if (or.length > 0) {
    const found = await payload.find({
      collection: "contacts",
      where: { or },
      limit: 1,
      depth: 0,
    });
    existing = found.docs[0];
  }

  if (existing) {
    // Fill blanks only — do not clobber curated data.
    const patch: Record<string, unknown> = {};
    if (!existing.fullName && input.fullName) patch.fullName = input.fullName;
    if (!existing.phone && phone) patch.phone = phone;
    if (!existing.email && email) patch.email = email;
    if (!existing.preferredLang && input.preferredLang)
      patch.preferredLang = input.preferredLang;
    if (consent && !existing.consent) {
      patch.consent = true;
      patch.consentAt = new Date().toISOString();
    }
    // Add the channel handle if it's new.
    if (input.handleValue) {
      const identities = Array.isArray(existing.identities) ? existing.identities : [];
      const has = identities.some(
        (i: { value?: string }) => i?.value === input.handleValue,
      );
      if (!has) {
        patch.identities = [
          ...identities,
          { type: input.handleType, value: input.handleValue },
        ];
      }
    }
    if (Object.keys(patch).length > 0) {
      await payload.update({ collection: "contacts", id: existing.id, data: patch });
    }
    return { id: existing.id, deduped: true };
  }

  const created = await payload.create({
    collection: "contacts",
    data: {
      fullName: input.fullName,
      phone: phone ?? undefined,
      email,
      preferredLang: input.preferredLang,
      consent: Boolean(consent),
      consentAt: consent ? new Date().toISOString() : undefined,
      identities: input.handleValue
        ? [{ type: input.handleType, value: input.handleValue }]
        : undefined,
    },
  });
  return { id: created.id, deduped: false };
}

/**
 * Main entry point. Idempotent on `message.externalId`: if a message with that
 * id already exists we skip creating duplicates (webhook redelivery safe).
 */
export async function ingestLead(
  payload: Payload,
  input: IngestInput,
): Promise<IngestResult> {
  // Idempotency guard for redelivered channel webhooks.
  if (input.message?.externalId) {
    const dup = await payload.find({
      collection: "messages",
      where: { externalId: { equals: input.message.externalId } },
      limit: 1,
      depth: 0,
    });
    const existingMsg = dup.docs[0];
    if (existingMsg) {
      return {
        contactId: (existingMsg.contact as { id?: string | number })?.id ?? existingMsg.contact,
        leadId: (existingMsg.lead as { id?: string | number })?.id ?? existingMsg.lead,
        messageId: existingMsg.id,
        deduped: true,
      } as IngestResult;
    }
  }

  const channelId = await resolveChannelId(
    payload,
    input.channelType,
    input.channelIdentifier,
  );

  const { id: contactId, deduped } = await upsertContact(
    payload,
    input.contact,
    input.consent,
  );

  const lead = await payload.create({
    collection: "leads",
    data: {
      title: input.lead?.title,
      status: "new",
      contact: contactId,
      channel: channelId ?? undefined,
      channelType: input.channelType,
      sourceDetail: input.lead?.sourceDetail,
      utm: input.lead?.utm,
      landingUrl: input.lead?.landingUrl,
      referrer: input.lead?.referrer,
      intent: input.lead?.intent,
      budget: input.lead?.budget,
      notes: input.lead?.notes,
      raw: input.raw ?? undefined,
    },
  });

  let messageId: string | number | undefined;
  if (input.message?.body || input.message?.attachments?.length) {
    const msg = await payload.create({
      collection: "messages",
      data: {
        direction: input.message.direction ?? "inbound",
        channelType: input.channelType,
        channel: channelId ?? undefined,
        contact: contactId,
        lead: lead.id,
        body: input.message.body,
        attachments: input.message.attachments,
        author: "contact",
        externalId: input.message.externalId,
        raw: input.raw ?? undefined,
      },
    });
    messageId = msg.id;
  }

  // Timeline event for the new lead.
  await payload.create({
    collection: "activities",
    data: {
      type: "system",
      lead: lead.id,
      contact: contactId,
      body: `Lead created from ${input.channelType}`,
    },
  });

  return { contactId, leadId: lead.id, messageId, deduped };
}
