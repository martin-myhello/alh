/**
 * Creates the schema and loads the demo backlog into Postgres.
 *   pnpm db:seed          (reads DATABASE_URL from .env.local)
 * It drops and recreates the ALH tables, so anything posted in the app is deleted.
 */
import { neon } from "@neondatabase/serverless";
import { install } from "../src/lib/install.ts";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and paste your Postgres connection string.");
  process.exit(1);
}

const counts = await install(neon(url), { fresh: true });
console.log("Seeded", counts);
