import Link from "next/link";

import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";
import { LEAD_STATUS_OPTIONS } from "@/collections/Leads";
import { requireUser } from "@/lib/crm/auth";

/**
 * Dashboard — the first screen managers see. Answers David's questions:
 *  - how many leads arrived in a period (24h / 7d / 15d / 1 month)
 *  - which channels they came from
 *  - how many are live in each pipeline stage right now
 */
export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;
const PERIODS = [
  { key: "24h", label: "24 часа", ms: DAY },
  { key: "7d", label: "7 дней", ms: 7 * DAY },
  { key: "15d", label: "15 дней", ms: 15 * DAY },
  { key: "30d", label: "1 месяц", ms: 30 * DAY },
] as const;

const CHANNEL_LABEL: Record<string, string> = Object.fromEntries(
  CHANNEL_TYPE_OPTIONS.map((o) => [o.value, o.label.ru]),
);
const OPEN_STATUSES = new Set(["new", "in_progress", "qualified", "closing"]);

type LeadRow = { status?: string; channelType?: string; createdAt?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { payload } = await requireUser();
  const sp = await searchParams;
  const period = PERIODS.find((p) => p.key === sp.period) ?? PERIODS[1];
  const since = new Date(Date.now() - period.ms).toISOString();

  const [inPeriodRes, allRes] = await Promise.all([
    payload.find({
      collection: "leads",
      where: { createdAt: { greater_than_equal: since } },
      limit: 5000,
      depth: 0,
    }),
    payload.find({ collection: "leads", limit: 5000, depth: 0 }),
  ]);

  const inPeriod = inPeriodRes.docs as unknown as LeadRow[];
  const all = allRes.docs as unknown as LeadRow[];

  // Channel breakdown within the selected period.
  const byChannel = new Map<string, number>();
  for (const l of inPeriod) {
    const k = l.channelType || "—";
    byChannel.set(k, (byChannel.get(k) || 0) + 1);
  }
  const channelRows = [...byChannel.entries()].sort((a, b) => b[1] - a[1]);
  const channelMax = Math.max(1, ...channelRows.map(([, n]) => n));

  // Live pipeline snapshot (all leads, grouped by status).
  const byStatus = new Map<string, number>();
  for (const l of all) byStatus.set(l.status || "new", (byStatus.get(l.status || "new") || 0) + 1);
  const openTotal = all.filter((l) => OPEN_STATUSES.has(l.status || "new")).length;
  const wonTotal = byStatus.get("won") || 0;

  return (
    <>
      <header className="crm-topbar">
        <h1>Дашборд</h1>
        <span className="crm-topbar-meta">обновляется в реальном времени</span>
      </header>

      <div className="crm-section">
        {/* Period selector */}
        <div className="crm-tabs">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={`/crm/dashboard?period=${p.key}`}
              className={p.key === period.key ? "crm-tab active" : "crm-tab"}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {/* Headline numbers */}
        <div className="crm-stats">
          <div className="crm-stat">
            <div className="crm-stat-num">{inPeriod.length}</div>
            <div className="crm-stat-label">Лидов за {period.label.toLowerCase()}</div>
          </div>
          <div className="crm-stat">
            <div className="crm-stat-num">{openTotal}</div>
            <div className="crm-stat-label">В работе сейчас</div>
          </div>
          <div className="crm-stat">
            <div className="crm-stat-num">{all.length}</div>
            <div className="crm-stat-label">Всего лидов</div>
          </div>
          <div className="crm-stat">
            <div className="crm-stat-num crm-stat-good">{wonTotal}</div>
            <div className="crm-stat-label">Выиграно</div>
          </div>
        </div>

        <div className="crm-grid2">
          {/* Channel breakdown */}
          <section className="crm-panel">
            <h2 className="crm-panel-title">Откуда пришли · {period.label.toLowerCase()}</h2>
            {channelRows.length === 0 ? (
              <p className="crm-hint">За этот период лидов нет.</p>
            ) : (
              <div className="crm-bars">
                {channelRows.map(([type, n]) => (
                  <div key={type} className="crm-bar-row">
                    <span className="crm-bar-label">{CHANNEL_LABEL[type] ?? type}</span>
                    <span className="crm-bar-track">
                      <span
                        className="crm-bar-fill"
                        style={{ width: `${Math.round((n / channelMax) * 100)}%` }}
                      />
                    </span>
                    <span className="crm-bar-num">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Live pipeline */}
          <section className="crm-panel">
            <h2 className="crm-panel-title">Сейчас в воронке</h2>
            <div className="crm-pipe">
              {LEAD_STATUS_OPTIONS.map((s) => (
                <div key={s.value} className="crm-pipe-row">
                  <span className="crm-pipe-label">{s.label.ru}</span>
                  <span className="crm-pipe-num">{byStatus.get(s.value) || 0}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
