import Link from "next/link";
import { Avatar, byId } from "@/components/bits";
import { Scroller } from "@/components/Scroller";
import { TopBar } from "@/components/TopBar";
import { getData } from "@/lib/db";
import { shortDate, todayIndex } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Timeline" };

const DAY = 86_400_000;
const W = 44; // px per day
const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function Timeline() {
  const { people, notes, unread } = await getData();
  const map = byId(people);
  const today = todayIndex();

  // Every note runs from the day it was opened to its ship day (or to today when it has none).
  const rows = notes
    .map((n) => {
      const start = Math.floor(n.createdAt / DAY);
      const due = n.due ? Math.floor(Date.parse(`${n.due}T00:00:00Z`) / DAY) : null;
      return { note: n, start, end: Math.max(due ?? today, start), open: due === null };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const first = Math.min(today, ...rows.map((r) => r.start)) - 2;
  const last = Math.max(today, ...rows.map((r) => r.end)) + 5;
  const days = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  return (
    <div className="gantt-page">
      <TopBar active="/timeline" people={people} unread={unread} />
        <Scroller className="gantt" focus={(today - first) * W}>
          <div className="gantt-inner" style={{ width: days.length * W }}>
            <div className="gantt-head">
              {days.map((d, i) => {
                const date = new Date(d * DAY);
                const dow = date.getUTCDay();
                return (
                  <div key={d} className={`gantt-day${d === today ? " today" : ""}${dow === 0 || dow === 6 ? " off" : ""}`}>
                    {(i === 0 || date.getUTCDate() === 1) && <span className="gantt-month">{MONTHS[date.getUTCMonth()]}</span>}
                    <span>{LETTERS[dow]}</span>
                    <b>{date.getUTCDate()}</b>
                  </div>
                );
              })}
            </div>

            <div className="gantt-body">
              {days.map((d, i) => {
                const dow = new Date(d * DAY).getUTCDay();
                return dow === 6 ? <i key={d} className="gantt-weekend" style={{ left: i * W }} /> : null;
              })}
              <i className="gantt-now" style={{ left: (today - first) * W + W / 2 }} />

              {rows.map(({ note, start, end, open }) => (
                <div className="gantt-row" key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className={`gantt-bar ${note.status}${open ? " open" : ""}`}
                    style={{ left: (start - first) * W + 3, width: (end - start + 1) * W - 6 }}
                    title={`${note.title}: started ${shortDate(start * DAY)}, ${open ? "no ship day yet" : `due ${shortDate(end * DAY)}`}`}
                  >
                    <span className="avatars">
                      {note.peopleIds.slice(0, 2).map((id) => (
                        <Avatar key={id} person={map.get(id)} />
                      ))}
                    </span>
                    <span className="gantt-title">{note.title}</span>
                    <span className="gantt-dates">
                      {shortDate(start * DAY)} → {open ? "no ship day" : shortDate(end * DAY)} · {STATUS_LABEL[note.status]}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Scroller>
    </div>
  );
}
