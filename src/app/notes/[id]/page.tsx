import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Back, Pill, byId } from "@/components/bits";
import { CommentBox } from "@/components/dialogs";
import { Editor } from "@/components/Editor";
import { Rich } from "@/components/Rich";
import { NoteMeta } from "@/components/NoteMeta";
import { Shot } from "@/components/Shot";
import { getData } from "@/lib/db";
import { agoLabel, dueLabel } from "@/lib/format";
import { STATUS_LABEL, type Update } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { people, notes, me } = await getData();
  const note = notes.find((n) => n.id === id);
  if (!note) notFound();
  const map = byId(people);
  const due = dueLabel(note.due);

  const days: [string, Update[]][] = [];
  for (const u of note.updates) {
    const label = agoLabel(u.createdAt);
    const last = days[days.length - 1];
    if (last && last[0] === label) last[1].push(u);
    else days.push([label, [u]]);
  }

  return (
    <main className="note">
      <Back />
      <Pill status={note.status} />
      <header className="note-head">
        <h1>{note.title}</h1>
        <NoteMeta note={note} people={people} due={due} />
        {note.description && (
          <div className="lede prose">
            <Rich text={note.description} />
          </div>
        )}
      </header>

      <Editor noteId={note.id} status={note.status} />

      {days.map(([label, updates]) => (
        <section className="day" key={label}>
          <div className="day-label">{label}</div>
          <div>
            {updates.map((u) => (
              <article className="entry" key={u.id}>
                <Link href={`/people/${u.personId}`}>
                  <Avatar person={map.get(u.personId)} />
                </Link>
                <p className="entry-status">{STATUS_LABEL[u.status]}</p>
                {u.body && (
                  <div className="entry-body prose">
                    <Rich text={u.body} />
                  </div>
                )}
                {u.shots.length > 0 && (
                  <div className="strip">
                    {u.shots.map((s, i) => (
                      <Shot key={i} src={s} alt={`${note.title}, screen ${i + 1}`} />
                    ))}
                  </div>
                )}
                {u.comments.length > 0 && (
                  <div className="replies">
                    {u.comments.map((c) => (
                      <div className="reply" key={c.id}>
                        <Avatar person={map.get(c.personId)} />
                        <span className="chip blue">{c.body}</span>
                        {c.emoji && <span className="emoji">{c.emoji}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="composer">
                  <CommentBox updateId={u.id} />
                  <Avatar person={me} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { notes } = await getData();
  return { title: notes.find((n) => n.id === id)?.title ?? "Note" };
}
