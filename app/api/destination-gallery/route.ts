import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

function makeTimeoutSignal(ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

export async function GET(req: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ images: [] })
  }

  const { searchParams } = req.nextUrl
  const city    = searchParams.get("city")    ?? ""
  const country = searchParams.get("country") ?? ""

  if (!city && !country) {
    return NextResponse.json({ images: [] })
  }

  const place = city ? `${city} ${country}`.trim() : country

  // Varied facets so the gallery feels diverse
  const queries = [
    `${place} landmark architecture`,
    `${place} street travel photography`,
    `${city || country} local food cuisine`,
    `${city || country} nature scenery`,
    `${place} culture people lifestyle`,
    `${place} aerial skyline view`,
  ]

  const imageUrls: string[] = []
  const seenIds = new Set<string>()

  for (const query of queries) {
    if (imageUrls.length >= 8) break

    const { signal, clear } = makeTimeoutSignal(6000)
    try {
      const page = Math.floor(Math.random() * 3) + 1
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=4&page=${page}&orientation=landscape`

      const res = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        cache: "no-store",
        signal,
      })

      if (!res.ok) {
        console.warn(`[destination-gallery] Unsplash ${res.status} for "${query}"`)
        continue
      }

      const data = await res.json()
      for (const p of data.results ?? []) {
        if (imageUrls.length >= 8) break
        if (!p.urls?.regular || seenIds.has(p.id)) continue
        seenIds.add(p.id)
        imageUrls.push(p.urls.regular)
      }
    } catch (err) {
      console.warn(`[destination-gallery] Fetch error for "${query}":`, String(err))
    } finally {
      clear()
    }
  }

  console.log(`[destination-gallery] Returning ${imageUrls.length} images for "${place}"`)
  return NextResponse.json({ images: imageUrls })
}
