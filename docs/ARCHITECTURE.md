# How ALH works

ALH is a small Next.js App Router app: server components read everything from Postgres in one round trip,
and server actions write. The browser runs no client state store. After a write, the app revalidates and the
server renders again.

```
browser ──GET──▶ page.tsx (server) ──getData()──▶ Postgres (1 HTTP transaction, 6 selects)
   │                                   ▲
   └─form action──▶ actions.ts ──insert/update──┘ ──revalidatePath("/", "layout")──▶ fresh render
```

## Folders

| Path | What lives there |
| ---- | ---------------- |
| `src/app/page.tsx` | **Feed**: people row, tabs (Latest / Cooking / Testing / Shipped), tag filter, note cards |
| `src/app/today/page.tsx` | **Today**: what's due and what moved today |
| `src/app/inbox/page.tsx` | **Inbox**: your notifications, New / Earlier, mark all read |
| `src/app/timeline/page.tsx` | **Timeline**: horizontal gantt, one bar per note from its start to its due day |
| `src/app/notes/[id]/page.tsx` | **Note**: centred 600px column with meta, editor, updates and comments |
| `src/app/people/[id]/page.tsx` | **Profile**: a person's notes, plus "Use ALH as …" to switch who you are |
| `src/app/img/[id]/route.ts` | Serves uploaded images from Postgres (immutable cache) |
| `src/app/api/reset/route.ts` | Optional nightly demo reset (needs `CRON_SECRET`) |
| `src/app/actions.ts` | Every write: `createNote`, `saveNote`, `postUpdate`, `addComment`, `markAllRead`, `openNotification`, `becomePerson` |
| `src/lib/db.ts` | The only module that talks to Postgres: `getData()` and the `insert*` / `update*` helpers |
| `src/lib/schema.ts` | Table DDL |
| `src/lib/install.ts` | Creates the tables and loads the seed; runs on the first request to an empty database |
| `src/lib/seed.ts` | The demo backlog, with dates relative to "now" so the demo always looks current |
| `src/lib/types.ts` | Domain types, status labels, tags |
| `src/lib/format.ts` | Human dates ("Today", "Yesterday", "Monday", "01.11"), previews, emoji split |
| `src/components/` | UI. Client components are marked `"use client"` |

## Data model

```
people ─┬─< note_people >─┬─ notes ──< updates ──< comments
        │                 │
        └─< notifications ┘          images (base64 JPEG, referenced as /img/<id> from notes.shots / updates.shots)
```

- **notes**: `status` is one of `next | cooking | testing | shipped`. `tag` is one of `TAGS`. `due` is `YYYY-MM-DD` text.
  `shots` is a jsonb array of image URLs, newest first. `pr_url` and `proto_url` are optional links.
- **updates**: what someone did on a note. Each update records the status the note moved to and a body in a small
  Markdown subset, and can carry its own shots. Posting an update changes the note's status.
- **comments**: short replies to an update. A trailing emoji is split into its own column so the UI can show it as a sticker.
- **notifications**: `kind` is `comment | update | added`. One row per recipient, with `read_at` null while unread.
  Everyone on a note is notified of its updates and comments, except the author. People added to a note get an `added` notification.
- Timestamps are `bigint` milliseconds. That keeps them easy to compare in JS and avoids time zones in the demo.

## Identity (demo only)

The app has no auth. The person you are is the `alh_me` cookie, `michael` by default, and `becomePerson` sets it
from a profile page. To make ALH real, swap `getMeId()` in `src/lib/db.ts` for your auth provider's user id.
Every write already goes through it.

## Rich text

The update editor (`src/components/Editor.tsx`) is a `contentEditable` with a toolbar (bold, italic, link, list,
image). On submit, `toMarkdown()` converts the DOM to a tiny Markdown subset (`**b**`, `*i*`, `[t](url)`, `- item`).
`src/components/Rich.tsx` parses that subset back into React elements, never HTML strings, so the app has no injection surface.
Links must be `http(s)`.

## Images

Images are shrunk in the browser (canvas, longest side 1600px, JPEG). The server accepts at most 4 per post, each under 900 KB.
They're stored base64 in `images` and served by `/img/[id]` with an immutable cache header. That's fine for a demo.
For real use, upload to object storage (e.g. Vercel Blob) in `insertUpdate` / `insertNote` and store the URL in `shots` instead.

## Live-ish updates

`src/components/Live.tsx` calls `router.refresh()` every 20 seconds while the tab is visible, so other people's posts
show up without a reload. If you need real push, put a websocket or SSE channel there.

## Changing things

- **Statuses or tags**: `src/lib/types.ts` (`STATUS_LABEL`, `TAGS`). Add a `.pill.<status>` and a `.gantt-bar.<status>` colour in `globals.css`.
- **Your own data**: edit `src/lib/seed.ts` (people, notes, updates, comments), replace `public/people/*` and `public/shots/*`,
  then run `pnpm db:seed`.
- **New column**: add it to `schema.ts`, map it in `getData()` and the matching insert. On an existing database, run an
  `alter table … add column if not exists …` rather than reseeding.
