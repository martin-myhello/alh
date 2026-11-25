# ALH — Act Like Human

Project management made simple for humans. Notes instead of tickets, three honest
stages (Cooking, Testing, Shipped), and a feed of what people are actually doing.

This is a demo: no login, everything you post is posted as Michael. The data is a
product backlog for the new Dunder Mifflin Infinity website.

## Stack

- Next.js (App Router) on Vercel
- Neon Postgres through `@neondatabase/serverless`
- Plain CSS with the design tokens from the Sketch file (`src/app/globals.css`)

## Run it

```bash
pnpm install
pnpm dev
```

Without `DATABASE_URL` the app serves an in-memory copy of the seed, so it works
with zero setup. To use Postgres:

```bash
vercel env pull .env.local   # or put DATABASE_URL in .env.local yourself
pnpm db:seed                 # creates tables and replaces their content with the demo backlog
```

## Where things are

- `src/lib/seed.ts` — the backlog (people, notes, updates, comments)
- `src/lib/db.ts` — reads and writes
- `src/components/Shot.tsx` — screenshots, including the drawn mock screens
- `src/app` — Feed, Today, Inbox, Timeline, `/people/[id]`, `/notes/[id]`
