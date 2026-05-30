import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface TripRow extends RowDataPacket {
  id:          number;
  agency_id:   number;
  agency_name: string;
  destination: string;
  price:       number;
  start_date:  string;
  end_date:    string;
  created_at:  string;
}

// GET /api/trips — return all trips with agency name
export async function GET() {
  try {
    const [rows] = await db.query<TripRow[]>(`
      SELECT
        t.id,
        t.agency_id,
        a.name  AS agency_name,
        t.destination,
        t.price,
        DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(t.end_date,   '%Y-%m-%d') AS end_date,
        t.created_at
      FROM trips t
      JOIN agencies a ON a.id = t.agency_id
      ORDER BY t.created_at DESC
    `);

    return NextResponse.json({ trips: rows }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/trips]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/trips — create a new trip (agency only)
export async function POST(req: NextRequest) {
  try {
    const { agency_id, destination, price, start_date, end_date } = await req.json();

    if (!agency_id || !destination || price === undefined) {
      return NextResponse.json(
        { error: "agency_id, destination, and price are required" },
        { status: 400 }
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO trips (agency_id, destination, price, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
      [agency_id, destination, price, start_date || null, end_date || null]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/trips]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
