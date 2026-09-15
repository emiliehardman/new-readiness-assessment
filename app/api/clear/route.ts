import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql, getFacilitatorPassword } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password !== getFacilitatorPassword()) {
      return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
    }

    await ensureSchema();
    const sql = getSql();
    const deleted = (await sql`DELETE FROM submissions RETURNING id`) as { id: number }[];

    return NextResponse.json({ ok: true, deletedCount: deleted.length });
  } catch (err) {
    console.error("Failed to clear submissions:", err);
    return NextResponse.json({ error: "Could not clear results." }, { status: 500 });
  }
}
