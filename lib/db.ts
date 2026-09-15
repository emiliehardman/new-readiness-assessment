import { neon } from "@neondatabase/serverless";

// Reads the connection string Vercel injects automatically once you
// connect a Postgres database (Neon) from the Storage tab in your
// Vercel project. Nothing to configure manually.
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Connect a Postgres database to this project in the Vercel dashboard (Storage tab -> Connect Database)."
    );
  }
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

// Creates the submissions table on first use, and adds the session column
// if it's missing. Both statements are idempotent, so this is safe to run
// before every query, including against a database that was already
// deployed before session tagging existed.
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          participant TEXT,
          institution TEXT,
          role TEXT,
          initiative TEXT,
          notes TEXT,
          responses JSONB NOT NULL,
          domain_scores JSONB NOT NULL,
          aggregate_scores JSONB NOT NULL,
          overall NUMERIC NOT NULL
        )
      `;
      await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS session TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_session ON submissions (session)`;
    })();
  }
  return schemaReady;
}

export function getFacilitatorPassword(): string {
  return process.env.FACILITATOR_PASSWORD || "readiness2026";
}

export { getSql };
