import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql, getFacilitatorPassword } from "@/lib/db";
import { domains } from "@/lib/domains";
import { getStatus, type StatusKey } from "@/lib/scoring";

type Row = {
  id: number;
  created_at: string;
  participant: string | null;
  institution: string | null;
  role: string | null;
  initiative: string | null;
  notes: string | null;
  domain_scores: { id: string; short: string; average: number }[];
  aggregate_scores: Record<string, { title: string; average: number }>;
  overall: string;
};

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password !== getFacilitatorPassword()) {
      return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
    }

    await ensureSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, created_at, participant, institution, role, initiative, notes,
             domain_scores, aggregate_scores, overall
      FROM submissions
      ORDER BY created_at DESC
    `) as Row[];

    const submissions = rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      participant: r.participant,
      institution: r.institution,
      role: r.role,
      initiative: r.initiative,
      notes: r.notes,
      domainScores: r.domain_scores,
      aggregateScores: r.aggregate_scores,
      overall: Number(r.overall),
    }));

    const count = submissions.length;

    const domainAverages = domains.map((domain) => {
      const values = submissions
        .map((s) => s.domainScores.find((d) => d.id === domain.id)?.average ?? 0)
        .filter((v) => v > 0);
      const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const statusCounts: Record<StatusKey, number> = { green: 0, amber: 0, red: 0, neutral: 0 };
      values.forEach((v) => {
        statusCounts[getStatus(v).key] += 1;
      });
      return { id: domain.id, title: domain.title, short: domain.short, average, statusCounts, n: values.length };
    });

    const bucketKeys = ["leadership", "success", "delivery", "readiness"] as const;
    const bucketAverages = Object.fromEntries(
      bucketKeys.map((key) => {
        const values = submissions
          .map((s) => s.aggregateScores?.[key]?.average ?? 0)
          .filter((v) => v > 0);
        const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        return [key, average];
      })
    );

    const overallValues = submissions.map((s) => s.overall).filter((v) => v > 0);
    const overallAverage = overallValues.length
      ? overallValues.reduce((a, b) => a + b, 0) / overallValues.length
      : 0;

    return NextResponse.json({
      count,
      overallAverage,
      domainAverages,
      bucketAverages,
      submissions,
    });
  } catch (err) {
    console.error("Failed to load results:", err);
    return NextResponse.json(
      { error: "Could not load results. Is a database connected in Vercel's Storage tab?" },
      { status: 500 }
    );
  }
}
