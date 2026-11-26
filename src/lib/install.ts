import type { NeonQueryFunction } from "@neondatabase/serverless";
import { SCHEMA, TABLES } from "./schema.ts";
import { buildSeed } from "./seed.ts";

type Sql = NeonQueryFunction<false, false>;

/**
 * Creates the ALH tables and loads the demo backlog.
 * With `fresh`, the tables are dropped first, so everything posted since is gone.
 * Used by `pnpm db:seed`, by the first request on an empty database, and by the optional nightly reset.
 */
export async function install(sql: Sql, { fresh = false } = {}) {
  if (fresh) for (const t of TABLES) await sql.query(`drop table if exists ${t} cascade`);
  for (const ddl of SCHEMA) await sql.query(ddl);

  const [{ count }] = (await sql`select count(*)::int as count from people`) as { count: number }[];
  if (count > 0) return null;

  const rows = buildSeed();
  await sql.transaction([
    ...rows.people.map(
      (p) => sql`insert into people (id, name, bio, github, avatar, away, sort)
                 values (${p.id}, ${p.name}, ${p.bio}, ${p.github}, ${p.avatar}, ${p.away}, ${p.sort})`,
    ),
    ...rows.notes.map(
      (n) => sql`insert into notes (id, title, description, status, tag, pr_url, proto_url, due, shots, created_at)
                 values (${n.id}, ${n.title}, ${n.description}, ${n.status}, ${n.tag}, ${n.prUrl}, ${n.protoUrl}, ${n.due}, ${JSON.stringify(n.shots)}::jsonb, ${n.createdAt})`,
    ),
    ...rows.notePeople.map(
      (r) => sql`insert into note_people (note_id, person_id, sort) values (${r.noteId}, ${r.personId}, ${r.sort})`,
    ),
    ...rows.updates.map(
      (u) => sql`insert into updates (id, note_id, person_id, status, body, shots, created_at)
                 values (${u.id}, ${u.noteId}, ${u.personId}, ${u.status}, ${u.body}, ${JSON.stringify(u.shots)}::jsonb, ${u.createdAt})`,
    ),
    ...rows.comments.map(
      (c) => sql`insert into comments (id, update_id, person_id, body, emoji, created_at)
                 values (${c.id}, ${c.updateId}, ${c.personId}, ${c.body}, ${c.emoji}, ${c.createdAt})`,
    ),
    ...rows.notifications.map(
      (n) => sql`insert into notifications (id, person_id, kind, actor_id, note_id, body, created_at, read_at)
                 values (${n.id}, ${n.personId}, ${n.kind}, ${n.actorId}, ${n.noteId}, ${n.body}, ${n.createdAt}, ${n.readAt})`,
    ),
  ]);

  return {
    people: rows.people.length,
    notes: rows.notes.length,
    updates: rows.updates.length,
    comments: rows.comments.length,
    notifications: rows.notifications.length,
  };
}
