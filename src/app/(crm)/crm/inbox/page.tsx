import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { LEAD_STATUS_OPTIONS } from "@/collections/Leads";
import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";
import { getPayloadClient } from "@/lib/crm/payload";
import { StatusSelect } from "./StatusSelect";

/**
 * The unified inbox board (`/crm/inbox`).
 *
 * A Kanban view of every lead across every channel, in the pipeline columns
 * David asked for. Each card shows WHO and — prominently — WHERE FROM (the exact
 * connected account). Auth is Payload's admin session; unauthenticated users are
 * bounced to the admin login.
 */
export const dynamic = "force-dynamic";

type Ref<T> = T | string | number | null | undefined;
type ContactRef = Ref<{ fullName?: string; phone?: string; email?: string }>;
type ChannelRef = Ref<{ label?: string; type?: string }>;

type LeadDoc = {
  id: string | number;
  title?: string;
  status?: string;
  channelType?: string;
  sourceDetail?: string;
  budget?: string;
  intent?: string;
  createdAt?: string;
  contact?: ContactRef;
  channel?: ChannelRef;
};

const CHANNEL_LABEL: Record<string, string> = Object.fromEntries(
  CHANNEL_TYPE_OPTIONS.map((o) => [o.value, o.label.ru]),
);

function isObj<T>(v: Ref<T>): v is T {
  return typeof v === "object" && v !== null;
}

export default async function InboxPage() {
  const payload = await getPayloadClient();

  // Auth gate via the Payload admin session cookie.
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) redirect("/admin/login?redirect=/crm/inbox");

  const { docs } = await payload.find({
    collection: "leads",
    limit: 300,
    sort: "-createdAt",
    depth: 1,
  });
  const leads = docs as unknown as LeadDoc[];

  // Group leads into their pipeline column.
  const byStatus = new Map<string, LeadDoc[]>();
  for (const o of LEAD_STATUS_OPTIONS) byStatus.set(o.value, []);
  for (const lead of leads) {
    const bucket = byStatus.get(lead.status ?? "new") ?? byStatus.get("new")!;
    bucket.push(lead);
  }

  return (
    <div className="crm-shell">
      <header className="crm-topbar">
        <h1>Avento CRM — Инбокс</h1>
        <span className="crm-muted">{leads.length} лидов · {user.email}</span>
      </header>

      {leads.length === 0 ? (
        <p className="crm-empty">
          Пока нет лидов. Как только придёт заявка с сайта или сообщение из
          мессенджера — она появится здесь.
        </p>
      ) : (
        <div className="crm-board">
          {LEAD_STATUS_OPTIONS.map((col) => {
            const items = byStatus.get(col.value) ?? [];
            return (
              <section key={col.value} className="crm-col">
                <div className="crm-col-head">
                  <span>{col.label.ru}</span>
                  <span className="crm-count">{items.length}</span>
                </div>
                <div className="crm-col-body">
                  {items.length === 0 ? (
                    <div className="crm-col-empty">—</div>
                  ) : (
                    items.map((lead) => <LeadCard key={String(lead.id)} lead={lead} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadDoc }) {
  const contact = isObj(lead.contact) ? lead.contact : undefined;
  const channel = isObj(lead.channel) ? lead.channel : undefined;

  // Source label: prefer the exact account name, else the channel type.
  const sourceName =
    channel?.label ||
    (lead.channelType ? CHANNEL_LABEL[lead.channelType] ?? lead.channelType : "—");

  const name = contact?.fullName || lead.title || "Без имени";
  const created = lead.createdAt
    ? new Date(lead.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <article className="crm-card">
      <p className="crm-name">{name}</p>
      {contact?.phone && <p className="crm-line">📞 {contact.phone}</p>}
      {contact?.email && <p className="crm-line">✉️ {contact.email}</p>}
      {lead.intent && <p className="crm-line">Запрос: {lead.intent}</p>}
      {lead.budget && <p className="crm-line">Бюджет: {lead.budget}</p>}

      <span className="crm-source" title="Источник лида">
        <span className="crm-dot" />
        {sourceName}
        {lead.sourceDetail ? ` · ${lead.sourceDetail}` : ""}
      </span>

      <div className="crm-card-foot">
        <time>{created}</time>
        <StatusSelect leadId={lead.id} status={lead.status ?? "new"} />
      </div>
    </article>
  );
}
