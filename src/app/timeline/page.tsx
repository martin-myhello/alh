import { NoteRow, byId } from "@/components/bits";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { timelineLabel, todayISO } from "@/lib/format";
import type { Note } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Timeline" };

export default async function Timeline() {
  const { people, notes } = await getData();
  const map = byId(people);
  const today = todayISO();

  const days = new Map<string, Note[]>();
  for (const n of notes.filter((n) => n.due).sort((a, b) => a.due!.localeCompare(b.due!)))
    days.set(n.due!, [...(days.get(n.due!) ?? []), n]);
  if (!days.has(today)) days.set(today, []);
  const ordered = [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
  const shipped = notes.filter((n) => n.status === "shipped").length;

  return (
    <>
      <TopBar active="/timeline" people={people} />
      <main className="column">
        <h1 className="page-title">Timeline</h1>
        <p className="page-sub">
          {shipped} of {notes.length} shipped, by the day each note lands
        </p>
        <div style={{ marginTop: 18 }}>
          {ordered.map(([day, list]) => (
            <section key={day} id={day === today ? "today" : undefined} className={`tl-day${day === today ? " today" : ""}`}>
              <div className="day-label">{timelineLabel(day)}</div>
              <div className="rows">
                {list.map((n) => (
                  <NoteRow key={n.id} note={n} people={map} sub={n.tag} />
                ))}
                {list.length === 0 && <p className="empty" style={{ padding: "18px 0" }}>Nothing lands today</p>}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
