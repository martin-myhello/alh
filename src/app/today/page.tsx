import Link from "next/link";
import { Avatar, NoteRow, byId } from "@/components/bits";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { agoLabel, dueLabel, longDate, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today" };

export default async function Today() {
  const { people, notes } = await getData();
  const map = byId(people);
  const today = todayISO();

  const shipping = notes.filter((n) => n.due === today && n.status !== "shipped");
  const moved = notes.filter((n) => agoLabel(n.updatedAt) === "Today");
  const late = notes.filter((n) => n.due && n.due < today && n.status !== "shipped");
  const away = people.filter((p) => p.away);

  const focus = people
    .map((p) => ({
      person: p,
      note: notes.find((n) => n.peopleIds[0] === p.id && (n.status === "cooking" || n.status === "testing")),
    }))
    .filter((f) => f.note);

  return (
    <>
      <TopBar active="/today" people={people} />
      <main className="column">
        <h1 className="page-title">{longDate()}</h1>
        <p className="page-sub">
          {shipping.length} to ship today, {moved.length} moved so far
          {late.length > 0 && `, ${late.length} running late`}
        </p>

        <h2 className="section">Shipping today</h2>
        <div className="rows">
          {shipping.map((n) => (
            <NoteRow key={n.id} note={n} people={map} sub={n.updates[0]?.body} />
          ))}
          {shipping.length === 0 && <p className="empty">Nothing is due today</p>}
        </div>

        {late.length > 0 && (
          <>
            <h2 className="section">Running late</h2>
            <div className="rows">
              {late.map((n) => (
                <NoteRow key={n.id} note={n} people={map} when={dueLabel(n.due)} sub={n.updates[0]?.body} />
              ))}
            </div>
          </>
        )}

        <h2 className="section">Moved today</h2>
        <div className="rows">
          {moved.map((n) => (
            <NoteRow key={n.id} note={n} people={map} sub={n.updates[0]?.body} />
          ))}
          {moved.length === 0 && <p className="empty">Quiet so far</p>}
        </div>

        <h2 className="section">Who is on what</h2>
        <div className="rows">
          {focus.map(({ person, note }) => (
            <Link key={person.id} className="row" href={`/notes/${note!.id}`}>
              <Avatar person={person} />
              <span className="row-main">
                <div className="row-title">{person.name}</div>
                <div className="row-sub">{note!.title}</div>
              </span>
              <span className="when">{dueLabel(note!.due)}</span>
            </Link>
          ))}
        </div>

        {away.length > 0 && (
          <>
            <h2 className="section">Heads up</h2>
            <div className="rows">
              {away.map((p) => (
                <Link key={p.id} className="row" href={`/people/${p.id}`}>
                  <Avatar person={p} />
                  <span className="row-main">
                    <div className="row-title">{p.name}</div>
                  </span>
                  <span className="away" style={{ margin: 0, height: 28, minWidth: 0, borderRadius: 14, padding: "0 12px" }}>
                    {p.away}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
