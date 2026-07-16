import Link from "next/link";
import type { Where } from "payload";

import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";
import { LEAD_STATUS_OPTIONS } from "@/collections/Leads";
import { requireUser } from "@/lib/crm/auth";
import { FilterBar } from "./FilterBar";
import { StatusSelect } from "./StatusSelect";

/** The pipeline board — the main CRM screen (`/crm`). Deals grouped into the
 *  columns David asked for, each card showing WHO and WHERE FROM. */
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

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; channel?: string; owner?: string }>;
}) {
  const { payload } = await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const channel = sp.channel ?? "";
  const owner = sp.owner ?? "";

  // Build the filter query from the URL.
  const and: Where[] = [];
  if (channel) and.push({ channelType: { equals: channel } });
  if (owner) and.push({ owner: { equals: Number(owner) } });
  if (q) {
    and.push({
      or: [
        { "contact.fullName": { like: q } },
        { "contact.phone": { like: q } },
        { title: { like: q } },
      ],
    });
  }
  const where: Where | undefined = and.length ? { and } : undefined;

  const [leadsRes, usersRes] = await Promise.all([
    payload.find({ collection: "leads", where, limit: 300, sort: "-createdAt", depth: 1 }),
    payload.find({ collection: "users", limit: 200, depth: 0 }),
  ]);
  const leads = leadsRes.docs as unknown as LeadDoc[];
  const users = (usersRes.docs as { id: string | number; name?: string; email?: string }[]).map((u) => ({
    id: u.id,
    label: u.name || u.email || String(u.id),
  }));

  const byStatus = new Map<string, LeadDoc[]>();
  for (const o of LEAD_STATUS_OPTIONS) byStatus.set(o.value, []);
  for (const lead of leads) {
    const bucket = byStatus.get(lead.status ?? "new") ?? byStatus.get("new")!;
    bucket.push(lead);
  }

  const filtered = Boolean(q || channel || owner);

  return (
    <>
      <header className="crm-topbar">
        <h1>Сделки</h1>
        <div className="crm-topbar-actions">
          <span className="crm-topbar-meta">{leads.length} в воронке</span>
          <Link href="/crm/new" className="crm-btn crm-btn-primary crm-btn-sm">+ Новый лид</Link>
        </div>
      </header>

      <div className="crm-filterwrap">
        <FilterBar users={users} q={q} channel={channel} owner={owner} />
      </div>

      {leads.length === 0 ? (
        <div className="crm-empty">
          <p>{filtered ? "Ничего не найдено." : "Пока нет сделок."}</p>
          <p className="crm-empty-sub">
            {filtered
              ? "Попробуй изменить поиск или сбросить фильтры."
              : "Как только придёт заявка с сайта или сообщение из мессенджера — она появится здесь, в колонке «Новый». Или заведи лид вручную кнопкой «+ Новый лид»."}
          </p>
        </div>
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
                    items.map((lead) => <DealCard key={String(lead.id)} lead={lead} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function DealCard({ lead }: { lead: LeadDoc }) {
  const contact = isObj(lead.contact) ? lead.contact : undefined;
  const channel = isObj(lead.channel) ? lead.channel : undefined;

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
      <Link href={`/crm/deal/${lead.id}`} className="crm-card-link">
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
      </Link>

      <div className="crm-card-foot">
        <time>{created}</time>
        <StatusSelect leadId={lead.id} status={lead.status ?? "new"} />
      </div>
    </article>
  );
}
