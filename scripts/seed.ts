/**
 * Creates the schema and loads the demo backlog into Postgres.
 *   pnpm db:seed          (reads DATABASE_URL from .env.local)
 * It replaces everything in the ALH tables.
 */
import { neon } from "@neondatabase/serverless";
import { SCHEMA } from "../src/lib/schema.ts";
import { buildSeed } from "../src/lib/seed.ts";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);
const rows = buildSeed();

for (const ddl of SCHEMA) await sql.query(ddl);

await sql.transaction([
  sql`truncate comments, updates, note_people, notes, people`,
  ...rows.people.map(
    (p) => sql`insert into people (id, name, bio, github, avatar, away, sort)
               values (${p.id}, ${p.name}, ${p.bio}, ${p.github}, ${p.avatar}, ${p.away}, ${p.sort})`,
  ),
  ...rows.notes.map(
    (n) => sql`insert into notes (id, title, description, status, tag, pr, proto, due, shots, created_at)
               values (${n.id}, ${n.title}, ${n.description}, ${n.status}, ${n.tag}, ${n.pr}, ${n.proto}, ${n.due}, ${JSON.stringify(n.shots)}::jsonb, ${n.createdAt})`,
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
]);

console.log(
  `Seeded ${rows.people.length} people, ${rows.notes.length} notes, ${rows.updates.length} updates, ${rows.comments.length} comments`,
);
