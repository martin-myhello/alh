import "server-only";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import {
  ME,
  type Comment,
  type Data,
  type Note,
  type Notification,
  type NotificationKind,
  type Person,
  type Status,
  type Update,
} from "./types";

/** Data access, on Neon Postgres. Run `pnpm db:seed` once to create and fill the tables. */

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local`, then `pnpm db:seed`.");
const sql = neon(url);

type Raw = Record<string, unknown>;
const list = (v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : typeof v === "string" ? JSON.parse(v) : [];
const id = () => crypto.randomUUID().slice(0, 8);

export const ME_COOKIE = "alh_me";

/** Who you are in the demo: the person picked on a profile page, Michael otherwise. */
export async function getMeId(): Promise<string> {
  return (await cookies()).get(ME_COOKIE)?.value || ME;
}

export async function getData(): Promise<Data> {
  const wanted = await getMeId();

  // One HTTP round trip for every read.
  const [p, n, np, u, c, nt] = (await sql.transaction([
    sql`select * from people order by sort`,
    sql`select * from notes`,
    sql`select * from note_people order by sort`,
    sql`select * from updates order by created_at desc`,
    sql`select * from comments order by created_at`,
    sql`select * from notifications where person_id = ${wanted} order by created_at desc limit 80`,
  ])) as Raw[][];

  const people: Person[] = p.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    bio: r.bio as string,
    github: r.github as string,
    avatar: r.avatar as string,
    away: (r.away as string) ?? null,
    sort: Number(r.sort),
  }));

  const commentsByUpdate = new Map<string, Comment[]>();
  for (const r of c) {
    const comment: Comment = {
      id: r.id as string,
      updateId: r.update_id as string,
      personId: r.person_id as string,
      body: r.body as string,
      emoji: (r.emoji as string) ?? null,
      createdAt: Number(r.created_at),
    };
    commentsByUpdate.set(comment.updateId, [...(commentsByUpdate.get(comment.updateId) ?? []), comment]);
  }

  const updatesByNote = new Map<string, Update[]>();
  for (const r of u) {
    const update: Update = {
      id: r.id as string,
      noteId: r.note_id as string,
      personId: r.person_id as string,
      status: r.status as Status,
      body: r.body as string,
      shots: list(r.shots),
      createdAt: Number(r.created_at),
      comments: commentsByUpdate.get(r.id as string) ?? [],
    };
    updatesByNote.set(update.noteId, [...(updatesByNote.get(update.noteId) ?? []), update]);
  }

  const notes: Note[] = n.map((r) => {
    const updates = updatesByNote.get(r.id as string) ?? [];
    return {
      id: r.id as string,
      title: r.title as string,
      description: r.description as string,
      status: r.status as Status,
      tag: r.tag as string,
      prUrl: (r.pr_url as string) ?? null,
      protoUrl: (r.proto_url as string) ?? null,
      due: (r.due as string) ?? null,
      shots: list(r.shots),
      createdAt: Number(r.created_at),
      updates,
      peopleIds: np.filter((x) => x.note_id === r.id).map((x) => x.person_id as string),
      updatedAt: updates[0]?.createdAt ?? Number(r.created_at),
      commentCount: updates.reduce((sum, x) => sum + x.comments.length, 0),
    };
  });
  notes.sort((a, b) => b.updatedAt - a.updatedAt);

  const me = people.find((x) => x.id === wanted) ?? people.find((x) => x.id === ME) ?? people[0];
  const inbox: Notification[] = nt.map((r) => ({
    id: r.id as string,
    personId: r.person_id as string,
    kind: r.kind as NotificationKind,
    actorId: r.actor_id as string,
    noteId: r.note_id as string,
    body: r.body as string,
    createdAt: Number(r.created_at),
    readAt: r.read_at === null ? null : Number(r.read_at),
  }));

  return { people, notes, me, inbox, unread: inbox.filter((x) => !x.readAt).length };
}

/** One notification per recipient, never one for the person who did the thing. */
const notify = (to: string[], kind: NotificationKind, actor: string, noteId: string, body: string, at: number) =>
  [...new Set(to)]
    .filter((personId) => personId !== actor)
    .map(
      (personId) =>
        sql`insert into notifications (id, person_id, kind, actor_id, note_id, body, created_at)
            values (${`${noteId}-${id()}`}, ${personId}, ${kind}, ${actor}, ${noteId}, ${body}, ${at})`,
    );

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
  images: { mime: string; data: string }[];
}): Promise<string> {
  const noteId = slug(input.title);
  const now = Date.now();
  const stored = input.images.map((image) => ({ ...image, id: crypto.randomUUID() }));
  const shots = JSON.stringify(stored.map((image) => `/img/${image.id}`));
  await sql.transaction([
    ...stored.map(
      (image) =>
        sql`insert into images (id, mime, data, created_at) values (${image.id}, ${image.mime}, ${image.data}, ${now})`,
    ),
    sql`insert into notes (id, title, description, status, tag, due, shots, created_at)
        values (${noteId}, ${input.title}, ${input.description}, ${input.status}, ${input.tag}, ${input.due}, ${shots}::jsonb, ${now})`,
    ...input.people.map(
      (person, i) => sql`insert into note_people (note_id, person_id, sort) values (${noteId}, ${person}, ${i})`,
    ),
    sql`insert into updates (id, note_id, person_id, status, body, shots, created_at)
        values (${`${noteId}-${id()}`}, ${noteId}, ${input.by}, ${input.status}, ${"Opened this note"}, ${shots}::jsonb, ${now})`,
    ...notify(input.people, "added", input.by, noteId, "", now),
  ]);
  return noteId;
}

export async function insertUpdate(input: {
  noteId: string;
  by: string;
  status: Status;
  body: string;
  preview: string;
  images: { mime: string; data: string }[];
}) {
  const now = Date.now();
  const stored = input.images.map((image) => ({ ...image, id: crypto.randomUUID() }));
  const shots = JSON.stringify(stored.map((image) => `/img/${image.id}`));
  const people = (await sql`select person_id from note_people where note_id = ${input.noteId}`) as Raw[];
  await sql.transaction([
    ...stored.map(
      (image) =>
        sql`insert into images (id, mime, data, created_at) values (${image.id}, ${image.mime}, ${image.data}, ${now})`,
    ),
    sql`insert into updates (id, note_id, person_id, status, body, shots, created_at)
        values (${`${input.noteId}-${id()}`}, ${input.noteId}, ${input.by}, ${input.status}, ${input.body}, ${shots}::jsonb, ${now})`,
    // New pictures go on top of the note's pile, so the card on the feed shows the latest work.
    sql`update notes set status = ${input.status}, shots = ${shots}::jsonb || shots where id = ${input.noteId}`,
    ...notify(people.map((r) => r.person_id as string), "update", input.by, input.noteId, input.preview, now),
  ]);
}

export async function insertComment(input: { updateId: string; by: string; body: string; emoji: string | null }) {
  const now = Date.now();
  const [update] = (await sql`select note_id, person_id from updates where id = ${input.updateId}`) as Raw[];
  if (!update) return;
  const noteId = update.note_id as string;
  const people = (await sql`select person_id from note_people where note_id = ${noteId}`) as Raw[];
  const text = input.emoji ? `${input.body} ${input.emoji}` : input.body;
  await sql.transaction([
    sql`insert into comments (id, update_id, person_id, body, emoji, created_at)
        values (${`${input.updateId}-${id()}`}, ${input.updateId}, ${input.by}, ${input.body}, ${input.emoji}, ${now})`,
    ...notify(
      [...people.map((r) => r.person_id as string), update.person_id as string],
      "comment",
      input.by,
      noteId,
      text,
      now,
    ),
  ]);
}

export async function updateNote(input: {
  noteId: string;
  by: string;
  prUrl: string | null;
  protoUrl: string | null;
  due: string | null;
  tag: string;
  people: string[];
}) {
  const now = Date.now();
  const before = (await sql`select person_id from note_people where note_id = ${input.noteId}`) as Raw[];
  const had = new Set(before.map((r) => r.person_id as string));
  await sql.transaction([
    sql`update notes set pr_url = ${input.prUrl}, proto_url = ${input.protoUrl}, due = ${input.due}, tag = ${input.tag}
        where id = ${input.noteId}`,
    sql`delete from note_people where note_id = ${input.noteId}`,
    ...input.people.map(
      (person, i) => sql`insert into note_people (note_id, person_id, sort) values (${input.noteId}, ${person}, ${i})`,
    ),
    ...notify(input.people.filter((person) => !had.has(person)), "added", input.by, input.noteId, "", now),
  ]);
}

export async function getImage(imageId: string): Promise<{ mime: string; data: string } | null> {
  const [row] = (await sql`select mime, data from images where id = ${imageId}`) as Raw[];
  return row ? { mime: row.mime as string, data: row.data as string } : null;
}

export async function markRead(me: string, notificationId?: string) {
  const now = Date.now();
  if (notificationId)
    await sql`update notifications set read_at = ${now} where id = ${notificationId} and person_id = ${me} and read_at is null`;
  else await sql`update notifications set read_at = ${now} where person_id = ${me} and read_at is null`;
}
