import Link from "next/link";

import { requireUser } from "@/lib/crm/auth";
import { AddTask } from "./AddTask";
import { TaskToggle } from "./TaskToggle";

/** Tasks / reminders across all deals — so nothing is forgotten. Overdue items
 *  are flagged; checking one off keeps the pipeline moving. */
export const dynamic = "force-dynamic";

// Keep the impure clock read out of the component render body (react-hooks/purity).
function nowMs(): number {
  return Date.now();
}

type Ref = { id?: string | number; fullName?: string; title?: string; name?: string; email?: string };
type TaskDoc = {
  id: string | number;
  title?: string;
  dueAt?: string;
  done?: boolean;
  assignee?: Ref | string | number;
  lead?: Ref | string | number;
};

function ref(v: TaskDoc["assignee"]): Ref | undefined {
  return v && typeof v === "object" ? (v as Ref) : undefined;
}
function fmtDue(d?: string) {
  return d
    ? new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "без срока";
}

export default async function TasksPage() {
  const { payload } = await requireUser();
  const now = nowMs();

  const { docs } = await payload.find({
    collection: "tasks",
    where: { done: { equals: false } },
    sort: "dueAt",
    limit: 300,
    depth: 1,
  });
  const tasks = docs as unknown as TaskDoc[];
  const overdueCount = tasks.filter((t) => t.dueAt && new Date(t.dueAt).getTime() < now).length;

  return (
    <>
      <header className="crm-topbar">
        <h1>Задачи</h1>
        <span className="crm-topbar-meta">
          {tasks.length} открыто{overdueCount > 0 ? ` · ${overdueCount} просрочено` : ""}
        </span>
      </header>

      <div className="crm-section crm-narrow">
        <AddTask />

        {tasks.length === 0 ? (
          <div className="crm-empty">
            <p>Открытых задач нет.</p>
            <p className="crm-empty-sub">Добавь напоминание выше или прямо в карточке сделки.</p>
          </div>
        ) : (
          <ul className="crm-tasklist">
            {tasks.map((t) => {
              const lead = ref(t.lead);
              const assignee = ref(t.assignee);
              const overdue = Boolean(t.dueAt && new Date(t.dueAt).getTime() < now);
              return (
                <li key={String(t.id)} className={overdue ? "crm-task overdue" : "crm-task"}>
                  <TaskToggle taskId={t.id} done={Boolean(t.done)} />
                  <div className="crm-task-main">
                    <div className="crm-task-title">{t.title}</div>
                    <div className="crm-task-meta">
                      <span className={overdue ? "crm-due-badge overdue" : "crm-due-badge"}>
                        {overdue ? "⏰ " : ""}{fmtDue(t.dueAt)}
                      </span>
                      {assignee && <span>· {assignee.name || assignee.email}</span>}
                      {lead && (
                        <Link href={`/crm/deal/${lead.id}`} className="crm-task-lead">
                          · {lead.title || "сделка"}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
