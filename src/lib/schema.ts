export const TABLES = ["images", "notifications", "comments", "updates", "note_people", "notes", "people"];

export const SCHEMA: string[] = [
  `create table if not exists people (
    id text primary key,
    name text not null,
    bio text not null default '',
    github text not null default '',
    avatar text not null default '',
    away text,
    sort int not null default 0
  )`,
  `create table if not exists notes (
    id text primary key,
    title text not null,
    description text not null default '',
    status text not null default 'next',
    tag text not null default 'Product',
    pr_url text,
    proto_url text,
    due text,
    shots jsonb not null default '[]',
    created_at bigint not null
  )`,
  `create table if not exists note_people (
    note_id text not null references notes(id) on delete cascade,
    person_id text not null references people(id) on delete cascade,
    sort int not null default 0,
    primary key (note_id, person_id)
  )`,
  `create table if not exists updates (
    id text primary key,
    note_id text not null references notes(id) on delete cascade,
    person_id text not null references people(id) on delete cascade,
    status text not null,
    body text not null default '',
    shots jsonb not null default '[]',
    created_at bigint not null
  )`,
  `create table if not exists comments (
    id text primary key,
    update_id text not null references updates(id) on delete cascade,
    person_id text not null references people(id) on delete cascade,
    body text not null,
    emoji text,
    created_at bigint not null
  )`,
  `create table if not exists notifications (
    id text primary key,
    person_id text not null references people(id) on delete cascade,
    kind text not null,
    actor_id text not null references people(id) on delete cascade,
    note_id text not null references notes(id) on delete cascade,
    body text not null default '',
    created_at bigint not null,
    read_at bigint
  )`,
  `create table if not exists images (
    id text primary key,
    mime text not null,
    data text not null,
    created_at bigint not null
  )`,
  `create index if not exists notifications_person_idx on notifications(person_id, created_at desc)`,
  `create index if not exists updates_note_idx on updates(note_id)`,
  `create index if not exists comments_update_idx on comments(update_id)`,
];
