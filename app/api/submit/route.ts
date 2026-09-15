import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata, responses, domainScores, aggregateScores, overall, session } = body ?? {};

    if (!responses || !domainScores || !aggregateScores || typeof overall !== "number") {
      return NextResponse.json({ error: "Malformed submission." }, { status: 400 });
    }

    // Normalized server-side regardless of what arrived, so the value
    // stored is always consistent no matter how the session tag got here.
    const normalizedSession = typeof session === "string" && session.trim() ? slugify(session) : null;

    await ensureSchema();
    const sql = getSql();

    await sql`
      INSERT INTO submissions
        (participant, institution, role, initiative, notes, responses, domain_scores, aggregate_scores, overall, session)
      VALUES
        (${metadata?.participant ?? null},
         ${metadata?.institution ?? null},
         ${metadata?.role ?? null},
         ${metadata?.initiative ?? null},
         ${metadata?.notes ?? null},
         ${JSON.stringify(responses)}::jsonb,
         ${JSON.stringify(domainScores)}::jsonb,
         ${JSON.stringify(aggregateScores)}::jsonb,
         ${overall},
         ${normalizedSession})
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save submission:", err);
    return NextResponse.json(
      { error: "Could not save submission. Is a database connected in Vercel's Storage tab?" },
      { status: 500 }
    );
  }
}
