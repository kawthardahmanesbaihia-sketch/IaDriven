import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// POST /api/book — create a booking
export async function POST(req: NextRequest) {
  try {
    const { user_id, trip_id } = await req.json();

    if (!user_id || !trip_id) {
      return NextResponse.json(
        { error: "user_id and trip_id are required" },
        { status: 400 }
      );
    }

    // Verify the trip exists
    const [trips] = await db.query<RowDataPacket[]>(
      "SELECT id FROM trips WHERE id = ? LIMIT 1",
      [trip_id]
    );
    if (trips.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Verify the user exists
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [user_id]
    );
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO bookings (user_id, trip_id, status) VALUES (?, ?, 'pending')",
      [user_id, trip_id]
    );

    return NextResponse.json(
      { booking_id: result.insertId, status: "pending" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/book]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/book?user_id=X — fetch all bookings for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "user_id query param required" }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         b.id,
         b.status,
         b.booked_at,
         t.destination,
         t.price,
         DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
         DATE_FORMAT(t.end_date,   '%Y-%m-%d') AS end_date,
         a.name AS agency_name
       FROM bookings b
       JOIN trips    t ON t.id = b.trip_id
       JOIN agencies a ON a.id = t.agency_id
       WHERE b.user_id = ?
       ORDER BY b.booked_at DESC`,
      [user_id]
    );

    return NextResponse.json({ bookings: rows }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/book]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
