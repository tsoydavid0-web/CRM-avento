import { requireUser } from "@/lib/crm/auth";
import { AddUser } from "./AddUser";

/** Team management — the admin creates accounts for colleagues and sets roles.
 *  New members sign in at /crm/login with the credentials created here. */
export const dynamic = "force-dynamic";

type UserDoc = {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
};

export default async function TeamPage() {
  const { payload, user } = await requireUser();
  const isAdmin = (user as { role?: string }).role === "admin";

  const { docs } = await payload.find({ collection: "users", limit: 200, sort: "email", depth: 0 });
  const users = docs as unknown as UserDoc[];

  return (
    <>
      <header className="crm-topbar">
        <h1>Команда</h1>
        <span className="crm-topbar-meta">{users.length} чел.</span>
      </header>

      <div className="crm-section">
        {isAdmin ? (
          <>
            <p className="crm-hint">
              Создай аккаунт коллеге — он войдёт на странице входа со своей почтой и
              паролем. «Агент» видит и ведёт сделки; «Админ» ещё и управляет командой.
            </p>
            <AddUser />
          </>
        ) : (
          <p className="crm-hint">Управлять аккаунтами может только администратор.</p>
        )}

        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Почта</th>
                <th>Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={String(u.id)}>
                  <td>{u.name || "—"}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={u.role === "admin" ? "crm-badge crm-badge-admin" : "crm-badge crm-badge-agent"}>
                      {u.role === "admin" ? "Админ" : "Агент"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
