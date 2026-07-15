import { CHANNEL_TYPE_OPTIONS } from "@/collections/Channels";
import { requireUser } from "@/lib/crm/auth";
import { AddChannel } from "./AddChannel";

/** Connected source accounts. This is what makes "знать откуда пришёл лид"
 *  precise — 2 sites, several WhatsApp numbers, 3 Instagram profiles, etc. */
export const dynamic = "force-dynamic";

type ChannelDoc = {
  id: string | number;
  label?: string;
  type?: string;
  identifier?: string;
  active?: boolean;
};

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  CHANNEL_TYPE_OPTIONS.map((o) => [o.value, o.label.ru]),
);

export default async function ChannelsPage() {
  const { payload } = await requireUser();

  const { docs } = await payload.find({
    collection: "channels",
    limit: 200,
    sort: "type",
    depth: 0,
  });
  const channels = docs as unknown as ChannelDoc[];

  return (
    <>
      <header className="crm-topbar">
        <h1>Каналы</h1>
        <span className="crm-topbar-meta">{channels.length} подключено</span>
      </header>

      <div className="crm-section">
        <p className="crm-hint">
          Каждый источник заявок — отдельная запись. Так у каждого лида виден
          точный аккаунт-источник (какой сайт, какой из инстаграмов и т.д.).
        </p>

        <AddChannel />

        {channels.length === 0 ? (
          <div className="crm-empty">
            <p>Каналов пока нет.</p>
            <p className="crm-empty-sub">
              Добавьте свои источники: 2 сайта, WhatsApp, Telegram, Instagram…
            </p>
          </div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Идентификатор</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={String(c.id)}>
                    <td>{c.label || "—"}</td>
                    <td>{c.type ? TYPE_LABEL[c.type] ?? c.type : "—"}</td>
                    <td>{c.identifier || "—"}</td>
                    <td>
                      <span
                        className={
                          c.active ? "crm-badge crm-badge-on" : "crm-badge crm-badge-off"
                        }
                      >
                        {c.active ? "Активен" : "Выключен"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
