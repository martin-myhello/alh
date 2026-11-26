# ALH — Act Like Human

Project management made simple for humans. Notes instead of tickets, honest stages
(Up next, Cooking, Testing, Shipped), and a feed of what people are actually doing.

This is a demo: there is no login. You are Michael unless you pick someone else on a
profile page. The example data is a product backlog for a fictional website rebuild.

**Live demo:** https://alh.myhello.io. It's a shared demo, so anything you post there is public
and is wiped when the demo resets.

## Run your own copy

ALH needs only one thing: a Postgres database. The live demo uses Neon's free plan on Vercel.
This repo has no keys, URLs or accounts of ours in it, so you plug in your own.

### Deploy to Vercel (about 3 minutes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmartin-myhello%2Falh&project-name=alh&repository-name=alh&env=DATABASE_URL&envDescription=Postgres%20connection%20string%20(Neon%20free%20plan%20works)&envLink=https%3A%2F%2Fgithub.com%2Fmartin-myhello%2Falh%23database)

1. Click **Deploy**. Vercel copies the repo into your GitHub account.
2. When it asks for `DATABASE_URL`, paste a Postgres connection string (see [Database](#database)).
   Another option: skip it, then add **Neon** from your Vercel project's **Storage** tab.
   That sets `DATABASE_URL` for you, and you redeploy once.
3. Open the site. On the first visit to an empty database, ALH creates its tables and loads the demo backlog.

### Run it on your machine

You need Node 22.18 or newer (24 recommended) and pnpm (`corepack enable` gives you the pinned version).

```bash
git clone https://github.com/<you>/alh.git
cd alh
pnpm install
cp .env.example .env.local     # then paste your DATABASE_URL into it
pnpm db:seed                   # optional: the first page load also does this on an empty database
pnpm dev                       # http://localhost:3000
```

If your Vercel project is linked (`vercel link`), `vercel env pull .env.local` fills in `.env.local` for you.

### Database

Any Postgres 14+ works. The app uses the `@neondatabase/serverless` HTTP driver, so Neon is the easiest.
To get a string from Neon, open https://neon.tech, create a project on the free plan, click **Connect** and copy the
`postgresql://…` string.

| Variable       | Required | What it does |
| -------------- | -------- | ------------ |
| `DATABASE_URL` | yes      | Postgres connection string. `POSTGRES_URL` is also read, which is the name the Vercel Neon integration uses. |
| `CRON_SECRET`  | no       | Turns on the nightly reset (see below). Use a long random string: `openssl rand -hex 32`. |

`pnpm db:seed` **drops and recreates** the ALH tables. Don't point it at a database you care about.

### Running it as a public demo

The app has no login, so anyone who has the URL can post notes, comments and images (up to 4 per update, each shrunk to under 900 KB).
For a public deployment:

- **Nightly reset:** set `CRON_SECRET` in Vercel. `vercel.json` already schedules `/api/reset` at 04:00 UTC,
  and that route puts the demo data back. Without the secret, the route answers 401 and does nothing.
- **Keep previews off production data:** in Vercel, scope `DATABASE_URL` to Production only, or use a Neon branch for Preview.
- **Neon's free plan** allows 0.5 GB per project, and uploaded images are stored in Postgres. The reset keeps storage small.

To use ALH for real work, you'd add authentication first (e.g. Auth.js or Clerk) and move images to object storage (e.g. Vercel Blob).
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) shows where those changes go.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): how the app works (data model, request flow, where to change what)
- [`docs/DESIGN.md`](docs/DESIGN.md): the design system (tokens, type, components, motion, and the product rules behind them)

## Stack

- Next.js 16 (App Router, Server Actions) and React 19, on Vercel
- Postgres via `@neondatabase/serverless`
- Plain CSS with design tokens, no UI framework (`src/app/globals.css`)
- Nucleo UI icons drawn inline (`src/components/Icon.tsx`)

## Scripts

| Command        | What it does |
| -------------- | ------------ |
| `pnpm dev`     | Dev server |
| `pnpm build`   | Production build |
| `pnpm lint`    | ESLint |
| `pnpm db:seed` | Wipe and reload the demo data (reads `.env.local`) |

## Credits and assets

The demo backlog, people and screenshots are fictional placeholder content for showing the product.
Replace `public/people/*`, `public/shots/*` and `src/lib/seed.ts` with your own before you use it for anything else.
