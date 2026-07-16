import Link from "next/link";
import { notFound } from "next/navigation";

import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";
import { requireUser } from "@/lib/crm/auth";
import { StatusSelect } from "../../StatusSelect";
import { AddTask } from "../../tasks/AddTask";
import { TaskToggle } from "../../tasks/TaskToggle";
import { EditLead } from "./EditLead";
import { NoteForm } from "./NoteForm";

/** Deal detail — the full working card for one lead: contact, source,
 *  qualification, conversation and timeline. */
export const dynamic = "force-dynamic";

const CHANNEL_LABEL: Record<string, string> = Object.fromEntries(
  CHANNEL_TYPE_OPTIONS.map((o) => [o.value, o.label.ru]),
);

function obj<T>(v: unknown): T | undefined {
  return v && typeof v === "object" ? (v as T) : undefined;
}
// Impure clock read kept out of render body (react-hooks/purity).
function nowMs(): number {
  return Date.now();
}
function fmt(d?: string) {
  return d
    ? new Date(d).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { payload } = await requireUser();
  const { id } = await params;

  let lead: Record<string, unknown> | null = null;
  try {
    lead = (await payload.findByID({ collection: "leads", id, depth: 2 })) as Record<string, unknown>;
  } catch {
    lead = null;
  }
  if (!lead) notFound();

  const [messagesRes, activitiesRes, usersRes, tasksRes] = await Promise.all([
    payload.find({ collection: "messages", where: { lead: { equals: id } }, sort: "createdAt", limit: 300, depth: 0 }),
    payload.find({ collection: "activities", where: { lead: { equals: id } }, sort: "-createdAt", limit: 300, depth: 1 }),
    payload.find({ collection: "users", limit: 200, depth: 0 }),
    payload.find({ collection: "tasks", where: { lead: { equals: id } }, sort: "dueAt", limit: 100, depth: 1 }),
  ]);
  const tasks = tasksRes.docs as Record<string, unknown>[];
  const now = nowMs();
  const users = (usersRes.docs as { id: string | number; name?: string; email?: string }[]).map((u) => ({
    id: u.id,
    label: u.name || u.email || String(u.id),
  }));

  const contact = obj<Record<string, unknown>>(lead.contact);
  const channel = obj<Record<string, unknown>>(lead.channel);
  const utm = obj<Record<string, unknown>>(lead.utm);
  const contactId = (contact?.id as string | number | undefined) ?? undefined;

  const channelType = lead.channelType as string | undefined;
  const sourceName =
    (channel?.label as string) ||
    (channelType ? CHANNEL_LABEL[channelType] ?? channelType : "—");

  const name = (contact?.fullName as string) || (lead.title as string) || "Без имени";
  const messages = messagesRes.docs as Record<string, unknown>[];
  const activities = activitiesRes.docs as Record<string, unknown>[];

  return (
    <>
      <header className="crm-topbar crm-deal-top">
        <div className="crm-deal-head">
          <Link href="/crm" className="crm-back">← К воронке</Link>
          <h1>{name}</h1>
        </div>
        <StatusSelect leadId={id} status={(lead.status as string) ?? "new"} />
      </header>

      <div className="crm-deal-grid">
        {/* Left: contact + source + qualification */}
        <div className="crm-deal-col">
          <section className="crm-panel">
            <h2 className="crm-panel-title">Контакт</h2>
            <dl className="crm-kv">
              <div><dt>Имя</dt><dd>{(contact?.fullName as string) || "—"}</dd></div>
              <div><dt>Телефон</dt><dd>{(contact?.phone as string) || "—"}</dd></div>
              <div><dt>Email</dt><dd>{(contact?.email as string) || "—"}</dd></div>
              <div><dt>Язык</dt><dd>{(contact?.preferredLang as string) || "—"}</dd></div>
            </dl>
          </section>

          <section className="crm-panel">
            <h2 className="crm-panel-title">Источник</h2>
            <span className="crm-source"><span className="crm-dot" />{sourceName}</span>
            <dl className="crm-kv" style={{ marginTop: 12 }}>
              {lead.sourceDetail ? <div><dt>Детали</dt><dd>{lead.sourceDetail as string}</dd></div> : null}
              {utm?.source ? <div><dt>utm_source</dt><dd>{utm.source as string}</dd></div> : null}
              {utm?.campaign ? <div><dt>Кампания</dt><dd>{utm.campaign as string}</dd></div> : null}
              {lead.landingUrl ? <div><dt>Страница</dt><dd>{lead.landingUrl as string}</dd></div> : null}
            </dl>
          </section>

          <section className="crm-panel">
            <h2 className="crm-panel-title">Квалификация</h2>
            <EditLead
              leadId={id}
              users={users}
              owner={(obj<Record<string, unknown>>(lead.owner)?.id as string | number) ?? (lead.owner as string | number)}
              intent={lead.intent as string}
              budget={lead.budget as string}
            />
            {lead.notes ? <p className="crm-deal-notes">{lead.notes as string}</p> : null}
          </section>

          <section className="crm-panel">
            <h2 className="crm-panel-title">Задачи</h2>
            <AddTask leadId={id} contactId={contactId} compact />
            {tasks.length === 0 ? (
              <p className="crm-hint">Задач по этой сделке нет.</p>
            ) : (
              <ul className="crm-tasklist">
                {tasks.map((t) => {
                  const overdue = Boolean(t.dueAt && new Date(t.dueAt as string).getTime() < now && !t.done);
                  return (
                    <li key={String(t.id)} className={t.done ? "crm-task done" : overdue ? "crm-task overdue" : "crm-task"}>
                      <TaskToggle taskId={t.id as string | number} done={Boolean(t.done)} />
                      <div className="crm-task-main">
                        <div className="crm-task-title">{t.title as string}</div>
                        <div className="crm-task-meta">
                          <span className={overdue ? "crm-due-badge overdue" : "crm-due-badge"}>
                            {overdue ? "⏰ " : ""}
                            {t.dueAt
                              ? new Date(t.dueAt as string).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                              : "без срока"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right: conversation + timeline */}
        <div className="crm-deal-col">
          <section className="crm-panel">
            <h2 className="crm-panel-title">Переписка</h2>
            {messages.length === 0 ? (
              <p className="crm-hint">Сообщений пока нет.</p>
            ) : (
              <div className="crm-thread">
                {messages.map((m) => (
                  <div
                    key={String(m.id)}
                    className={
                      (m.direction as string) === "outbound"
                        ? "crm-msg crm-msg-out"
                        : "crm-msg crm-msg-in"
                    }
                  >
                    <div className="crm-msg-body">{(m.body as string) || "—"}</div>
                    <div className="crm-msg-time">{fmt(m.createdAt as string)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="crm-panel">
            <h2 className="crm-panel-title">История и заметки</h2>
            <NoteForm leadId={id} contactId={contactId} />
            <ul className="crm-timeline">
              {activities.map((a) => (
                <li key={String(a.id)} className="crm-tl-item">
                  <span className="crm-tl-dot" />
                  <div>
                    <div className="crm-tl-body">{(a.body as string) || (a.type as string)}</div>
                    <div className="crm-tl-time">{fmt(a.createdAt as string)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
