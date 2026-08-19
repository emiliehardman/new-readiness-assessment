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

// Creates the submissions table on first use. Idempotent, so it's safe
// to call before every query rather than requiring a manual migration.
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
    })();
  }
  return schemaReady;
}

export function getFacilitatorPassword(): string {
  return process.env.FACILITATOR_PASSWORD || "readiness2026";
}

export { getSql };
