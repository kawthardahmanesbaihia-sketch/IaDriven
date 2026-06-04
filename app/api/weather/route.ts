import { NextRequest, NextResponse } from "next/server"
import { getWeatherForTravel } from "@/lib/weather-service"

export const dynamic   = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country, city, date } = body

    if (!country) {
      return NextResponse.json(
        { error: "country is required" },
        { status: 400 }
      )
    }

    const travelDate = date ?? new Date().toISOString().split("T")[0]
    const month      = new Date(travelDate).toLocaleString("en-US", { month: "long" })

    console.log(`[weather] Request — country="${country}" city="${city ?? ""}" date="${travelDate}"`)

    const weather = await getWeatherForTravel(country, city, travelDate, month)

    console.log(`[weather] Response — type="${weather.type}" temp="${weather.temperature}" condition="${weather.condition}"`)

    return NextResponse.json(weather)
  } catch (error) {
    console.error("[weather] Unhandled error:", error)
    return NextResponse.json(
      { error: "Weather service unavailable" },
      { status: 500 }
    )
  }
}
