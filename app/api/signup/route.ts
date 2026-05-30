import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, role = "user" } = await req.json();

    // ── Basic validation ──────────────────────────────────────
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "username, email, and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!["user", "agency"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // ── Check uniqueness ──────────────────────────────────────
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email or username already registered" },
        { status: 409 }
      );
    }

    // ── Hash password & insert ────────────────────────────────
    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashed, role]
    );

    const newUser = {
      uid:      String(result.insertId),
      username,
      email,
      role,
    };

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err: any) {
    console.error("[/api/signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
