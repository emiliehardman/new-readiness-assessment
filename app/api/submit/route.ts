import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata, responses, domainScores, aggregateScores, overall } = body ?? {};

    if (!responses || !domainScores || !aggregateScores || typeof overall !== "number") {
      return NextResponse.json({ error: "Malformed submission." }, { status: 400 });
    }

    await ensureSchema();
    const sql = getSql();

    await sql`
      INSERT INTO submissions
        (participant, institution, role, initiative, notes, responses, domain_scores, aggregate_scores, overall)
      VALUES
        (${metadata?.participant ?? null},
         ${metadata?.institution ?? null},
         ${metadata?.role ?? null},
         ${metadata?.initiative ?? null},
         ${metadata?.notes ?? null},
         ${JSON.stringify(responses)}::jsonb,
         ${JSON.stringify(domainScores)}::jsonb,
         ${JSON.stringify(aggregateScores)}::jsonb,
         ${overall})
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
