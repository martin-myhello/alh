import "server-only";
import { neon } from "@neondatabase/serverless";
import { buildSeed } from "./seed";
import type { Comment, Data, Note, Rows, Status, Update } from "./types";

/**
 * Data access. Uses Neon Postgres when DATABASE_URL is set; otherwise falls
 * back to an in-memory copy of the seed so the app runs with zero setup.
 */

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const sql = url ? neon(url) : null;

const g = globalThis as unknown as { __alhMemory?: Rows };
function memory(): Rows {
  if (!g.__alhMemory) g.__alhMemory = buildSeed();
  return g.__alhMemory;
}

type Raw = Record<string, unknown>;
const shots = (v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : typeof v === "string" ? JSON.parse(v) : [];

async function loadRows(): Promise<Rows> {
  if (!sql) return memory();
  // One HTTP round trip for all five reads.
  const [people, notes, notePeople, updates, comments] = (await sql.transaction([
    sql`select * from people order by sort`,
    sql`select * from notes`,
    sql`select * from note_people order by sort`,
    sql`select * from updates`,
    sql`select * from comments`,
  ])) as Raw[][];

  return {
    people: people.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      bio: p.bio as string,
      github: p.github as string,
      avatar: p.avatar as string,
      away: (p.away as string) ?? null,
      sort: Number(p.sort),
    })),
    notes: notes.map((n) => ({
      id: n.id as string,
      title: n.title as string,
      description: n.description as string,
      status: n.status as Status,
      tag: n.tag as string,
      pr: n.pr === null ? null : Number(n.pr),
      proto: Boolean(n.proto),
      due: (n.due as string) ?? null,
      shots: shots(n.shots),
      createdAt: Number(n.created_at),
    })),
    notePeople: notePeople.map((r) => ({
      noteId: r.note_id as string,
      personId: r.person_id as string,
      sort: Number(r.sort),
    })),
    updates: updates.map((u) => ({
      id: u.id as string,
      noteId: u.note_id as string,
      personId: u.person_id as string,
      status: u.status as Status,
      body: u.body as string,
      shots: shots(u.shots),
      createdAt: Number(u.created_at),
    })),
    comments: comments.map((c) => ({
      id: c.id as string,
      updateId: c.update_id as string,
      personId: c.person_id as string,
      body: c.body as string,
      emoji: (c.emoji as string) ?? null,
      createdAt: Number(c.created_at),
    })),
  };
}

export async function getData(): Promise<Data> {
  const rows = await loadRows();

  const commentsByUpdate = new Map<string, Comment[]>();
  for (const c of [...rows.comments].sort((a, b) => a.createdAt - b.createdAt)) {
    const list = commentsByUpdate.get(c.updateId) ?? [];
    list.push(c);
    commentsByUpdate.set(c.updateId, list);
  }

  const updatesByNote = new Map<string, Update[]>();
  for (const u of [...rows.updates].sort((a, b) => b.createdAt - a.createdAt)) {
    const list = updatesByNote.get(u.noteId) ?? [];
    list.push({ ...u, comments: commentsByUpdate.get(u.id) ?? [] });
    updatesByNote.set(u.noteId, list);
  }

  const notes: Note[] = rows.notes.map((n) => {
    const updates = updatesByNote.get(n.id) ?? [];
    return {
      ...n,
      updates,
      peopleIds: rows.notePeople
        .filter((r) => r.noteId === n.id)
        .sort((a, b) => a.sort - b.sort)
        .map((r) => r.personId),
      updatedAt: updates[0]?.createdAt ?? n.createdAt,
      commentCount: updates.reduce((sum, u) => sum + u.comments.length, 0),
    };
  });
  notes.sort((a, b) => b.updatedAt - a.updatedAt);

  return { people: [...rows.people].sort((a, b) => a.sort - b.sort), notes };
}

const id = () => crypto.randomUUID().slice(0, 8);

function slug(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "note"}-${id().slice(0, 4)}`;
}

export async function insertNote(input: {
  title: string;
  description: string;
  status: Status;
  tag: string;
  due: string | null;
  people: string[];
  by: string;
}): Promise<string> {
  const noteId = slug(input.title);
  const now = Date.now();
  const updateId = `${noteId}-${id()}`;
  const body = "Opened this note";

  if (!sql) {
    const m = memory();
    m.notes.push({
      id: noteId,
      title: input.title,
      description: input.description,
      status: input.status,
      tag: input.tag,
      pr: null,
      proto: false,
      due: input.due,
      shots: [],
      createdAt: now,
    });
    input.people.forEach((p, i) => m.notePeople.push({ noteId, personId: p, sort: i }));
    m.updates.push({
      id: updateId,
      noteId,
      personId: input.by,
      status: input.status,
      body,
      shots: [],
      createdAt: now,
    });
    return noteId;
  }

  await sql.transaction([
    sql`insert into notes (id, title, description, status, tag, due, created_at)
        values (${noteId}, ${input.title}, ${input.description}, ${input.status}, ${input.tag}, ${input.due}, ${now})`,
    ...input.people.map(
      (p, i) =>
        sql`insert into note_people (note_id, person_id, sort) values (${noteId}, ${p}, ${i})`,
    ),
    sql`insert into updates (id, note_id, person_id, status, body, created_at)
        values (${updateId}, ${noteId}, ${input.by}, ${input.status}, ${body}, ${now})`,
  ]);
  return noteId;
}

export async function insertUpdate(input: {
  noteId: string;
  by: string;
  status: Status;
  body: string;
}) {
  const now = Date.now();
  const updateId = `${input.noteId}-${id()}`;

  if (!sql) {
    const m = memory();
    const note = m.notes.find((n) => n.id === input.noteId);
    if (!note) return;
    note.status = input.status;
    m.updates.push({
      id: updateId,
      noteId: input.noteId,
      personId: input.by,
      status: input.status,
      body: input.body,
      shots: [],
      createdAt: now,
    });
    return;
  }

  await sql.transaction([
    sql`insert into updates (id, note_id, person_id, status, body, created_at)
        values (${updateId}, ${input.noteId}, ${input.by}, ${input.status}, ${input.body}, ${now})`,
    sql`update notes set status = ${input.status} where id = ${input.noteId}`,
  ]);
}

export async function insertComment(input: {
  updateId: string;
  by: string;
  body: string;
  emoji: string | null;
}) {
  const now = Date.now();
  const commentId = `${input.updateId}-${id()}`;

  if (!sql) {
    const m = memory();
    if (!m.updates.some((u) => u.id === input.updateId)) return;
    m.comments.push({
      id: commentId,
      updateId: input.updateId,
      personId: input.by,
      body: input.body,
      emoji: input.emoji,
      createdAt: now,
    });
    return;
  }

  await sql`insert into comments (id, update_id, person_id, body, emoji, created_at)
            values (${commentId}, ${input.updateId}, ${input.by}, ${input.body}, ${input.emoji}, ${now})`;
}
