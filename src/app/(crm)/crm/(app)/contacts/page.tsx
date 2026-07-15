import { requireUser } from "@/lib/crm/auth";

/** Contacts list — one card per person, deduped across channels. */
export const dynamic = "force-dynamic";

type ContactDoc = {
  id: string | number;
  fullName?: string;
  phone?: string;
  email?: string;
  preferredLang?: string;
  createdAt?: string;
};

export default async function ContactsPage() {
  const { payload } = await requireUser();

  const { docs } = await payload.find({
    collection: "contacts",
    limit: 300,
    sort: "-createdAt",
    depth: 0,
  });
  const contacts = docs as unknown as ContactDoc[];

  return (
    <>
      <header className="crm-topbar">
        <h1>Контакты</h1>
        <span className="crm-topbar-meta">{contacts.length} всего</span>
      </header>

      {contacts.length === 0 ? (
        <div className="crm-empty">
          <p>Контактов пока нет.</p>
          <p className="crm-empty-sub">
            Контакт создаётся автоматически с первой заявкой и объединяет все
            обращения одного человека.
          </p>
        </div>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Язык</th>
                <th>Добавлен</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={String(c.id)}>
                  <td>{c.fullName || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.preferredLang || "—"}</td>
                  <td>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("ru-RU")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
