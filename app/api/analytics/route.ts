import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Create sessions table if it doesn't exist yet
async function ensureSessionsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT,
      mode       ENUM('single', 'squad') NOT NULL DEFAULT 'single',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
}

export async function GET() {
  try {
    await ensureSessionsTable();

    const [[userRow]] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'user'"
    );

    const [[sessionRow]] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM sessions"
    );

    return NextResponse.json({
      totalUsers: Number(userRow.count),
      totalSessions: Number(sessionRow.count),
    });
  } catch (err) {
    console.error("[/api/analytics]", err);
    return NextResponse.json(
      { totalUsers: 0, totalSessions: 0 },
      { status: 500 }
    );
  }
}
