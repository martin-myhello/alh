import Link from "next/link";
import { dueLabel, plain } from "@/lib/format";
import { STATUS_LABEL, type Note, type Person, type Status } from "@/lib/types";
import { Icon } from "./Icon";
import { Stack } from "./Stack";

export function Avatar({ person, size = 24 }: { person: Person | undefined; size?: 24 | 68 }) {
  return (
    <span
      className={`avatar s${size}`}
      style={person ? { backgroundImage: `url(${person.avatar})` } : undefined}
      role="img"
      aria-label={person?.name ?? "Someone"}
      title={person?.name}
    />
  );
}

export function Pill({ status }: { status: Status }) {
  return <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Back({ href = "/" }: { href?: string }) {
  return (
    <Link className="back" href={href}>
      ← Back
    </Link>
  );
}

export function Tabs({
  base,
  tabs,
  active,
  params = {},
  children,
}: {
  base: string;
  tabs: [key: string, label: string][];
  active: string;
  params?: Record<string, string | undefined>;
  children?: React.ReactNode;
}) {
  const href = (key: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (key !== tabs[0][0]) q.set("tab", key);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <nav className="tabs" aria-label="Views">
      {tabs.map(([key, label]) => (
        <Link key={key} href={href(key)} aria-current={key === active ? "true" : undefined} scroll={false}>
          {label}
        </Link>
      ))}
      {children}
    </nav>
  );
}

export function NoteCard({ note, people }: { note: Note; people: Map<string, Person> }) {
  const due = dueLabel(note.due);
  const shots = note.shots.slice(0, 3);
  return (
    <article className={`card${shots.length ? "" : " bare"}`}>
      <Link className="card-cover" href={`/notes/${note.id}`} aria-label={note.title} />
      <div className="card-head">
        <div>
          <h2 className="card-title">{note.title}</h2>
          {note.description && <p className="card-desc">{plain(note.description)}</p>}
        </div>
        <Pill status={note.status} />
      </div>
      {shots.length > 0 && <Stack shots={shots} href={`/notes/${note.id}`} />}
      <div className="card-foot">
        <span className="meta">
          <Icon name="msgs" />
          {note.commentCount}
        </span>
        {note.prUrl && (
          <a className="meta link" href={note.prUrl} target="_blank" rel="noreferrer">
            <Icon name="pr" />
            PR
          </a>
        )}
        {note.protoUrl && (
          <a className="meta link opt" href={note.protoUrl} target="_blank" rel="noreferrer">
            <Icon name="play" />
            Proto
          </a>
        )}
        {due && (
          <span className="meta">
            <Icon name="timeline" />
            {due}
          </span>
        )}
        <span className="avatars">
          {note.peopleIds.map((id) => (
            <Avatar key={id} person={people.get(id)} />
          ))}
        </span>
      </div>
    </article>
  );
}

export function NoteRow({
  note,
  people,
  sub,
  when,
}: {
  note: Note;
  people: Map<string, Person>;
  sub?: string;
  when?: string | null;
}) {
  return (
    <Link className="row" href={`/notes/${note.id}`}>
      <span className="avatars">
        {note.peopleIds.slice(0, 2).map((id) => (
          <Avatar key={id} person={people.get(id)} />
        ))}
      </span>
      <span className="row-main">
        <div className="row-title">{note.title}</div>
        {sub && <div className="row-sub">{sub}</div>}
      </span>
      {when && <span className="when">{when}</span>}
      <Pill status={note.status} />
    </Link>
  );
}

export const byId = (people: Person[]) => new Map(people.map((p) => [p.id, p]));
