import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id:       number;
  username: string;
  email:    string;
  password: string;
  role:     "user" | "agency";
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password are required" },
        { status: 400 }
      );
    }

    // ── Look up user by username ──────────────────────────────
    const [rows] = await db.query<UserRow[]>(
      "SELECT id, username, email, password, role FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const found = rows[0];

    // ── Verify password ───────────────────────────────────────
    const match = await bcrypt.compare(password, found.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const user = {
      uid:      String(found.id),
      username: found.username,
      email:    found.email,
      role:     found.role,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
