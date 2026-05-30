import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { userId, mode = "single" } = await req.json();

    // userId from auth is a string (e.g. "12"); convert to int or null
    const userIdInt = userId ? parseInt(userId, 10) : null;
    const safeMode = mode === "squad" ? "squad" : "single";

    await db.query<ResultSetHeader>(
      "INSERT INTO sessions (user_id, mode) VALUES (?, ?)",
      [userIdInt || null, safeMode]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/sessions]", err);
    // Non-fatal: return 200 so clients don't surface errors for analytics writes
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
