import { NextRequest, NextResponse } from "next/server"
import type { ImageTemplate } from "@/lib/image-templates"
import {
  CATEGORY_QUERY_POOLS,
  FALLBACK_QUERIES,
  type CategoryQueryEntry,
} from "@/lib/category-queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

// ── Response shape ────────────────────────────────────────────────────────────
interface FetchedTemplateImage {
  id: string
  templateId: string
  imageUrl: string
  thumbUrl: string
  altDescription: string | null
  photographerName: string
  tags: ImageTemplate["tags"]
  query: string
}

interface UnsplashPhoto {
  id: string
  regular: string
  thumb: string
  alt: string | null
  photographer: string
}

// ── Compatibility shim for AbortSignal.timeout ────────────────────────────────
// AbortSignal.timeout() was added in Node.js 17.3.
// We reproduce the same behaviour with AbortController + setTimeout so the
// route works on every Node.js version Next.js supports (≥16).
function makeTimeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

// ── Core fetch helper ─────────────────────────────────────────────────────────
async function fetchUnsplashBatch(
  query: string,
  accessKey: string,
  perPage: number = 20
): Promise<UnsplashPhoto[]> {
  const { signal, clear } = makeTimeoutSignal(8000)
  try {
    const page = Math.floor(Math.random() * 3) + 1   // pages 1-3 (less rate-limit pressure)
    const url = [
      "https://api.unsplash.com/search/photos",
      `?query=${encodeURIComponent(query)}`,
      `&per_page=${perPage}`,
      `&page=${page}`,
      "&orientation=landscape",
    ].join("")

    const res = await fetch(url, {
      headers: {
        // Canonical Unsplash auth — header is preferred over ?client_id query param
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      cache: "no-store",
      signal,
    })

    if (!res.ok) {
      // Read the body so we can log the actual Unsplash error message
      let errBody = "(could not read body)"
      try { errBody = await res.text() } catch {}
      console.error(
        `[image-templates] Unsplash HTTP ${res.status} for "${query}" — body: ${errBody.slice(0, 300)}`
      )
      return []
    }

    const data = await res.json()
    const photos: any[] = data.results ?? []

    console.log(`[image-templates] "${query}" → ${photos.length} results (page ${page})`)

    return photos.map((p: any) => ({
      id: p.id,
      regular: p.urls?.regular ?? p.urls?.full ?? "",
      thumb:   p.urls?.thumb  ?? p.urls?.small ?? "",
      alt:     p.alt_description ?? p.description ?? null,
      photographer: p.user?.name ?? "Unknown",
    }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[image-templates] Fetch error for "${query}": ${msg}`)
    return []
  } finally {
    clear()
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Private server-only key (no NEXT_PUBLIC_ prefix — never sent to the browser)
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    console.error("[image-templates] UNSPLASH_ACCESS_KEY is not set in environment variables")
    return NextResponse.json(
      { error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in your .env file." },
      { status: 500 }
    )
  }

  // Log first 8 chars so you can verify which key is active without exposing it
  console.log(`[image-templates] Using key: ${accessKey.slice(0, 8)}…`)

  const { searchParams } = req.nextUrl
  const count = Math.min(parseInt(searchParams.get("count") ?? "10"), 30)
  const categoryFilter = searchParams.get("category") ?? ""

  const queryPool: CategoryQueryEntry[] =
    CATEGORY_QUERY_POOLS[categoryFilter] ?? FALLBACK_QUERIES

  console.log(
    `[image-templates] category="${categoryFilter}" | target=${count} | pool=${queryPool.length} queries`
  )

  const seenIds = new Set<string>()
  const images: FetchedTemplateImage[] = []

  // Shuffle so each request draws from a random cross-section of subcategories
  const shuffledPool = [...queryPool].sort(() => Math.random() - 0.5)

  for (const entry of shuffledPool) {
    if (images.length >= count) break

    const needed  = count - images.length
    const perPage = Math.min(needed + 10, 20)
    const batch   = await fetchUnsplashBatch(entry.query, accessKey, perPage)

    let added = 0
    for (const photo of batch) {
      if (images.length >= count) break
      if (!photo.regular) continue
      if (seenIds.has(photo.id)) continue

      seenIds.add(photo.id)
      images.push({
        id: photo.id,
        templateId: entry.id,
        imageUrl: photo.regular,
        thumbUrl: photo.thumb,
        altDescription: photo.alt,
        photographerName: photo.photographer,
        tags: entry.tags,
        query: entry.query,
      })
      added++
    }

    console.log(
      `[image-templates] "${entry.query}" → +${added} (${images.length}/${count} total)`
    )
  }

  // Final fallback — try generic queries if the category pool returned nothing
  if (images.length === 0 && queryPool !== FALLBACK_QUERIES) {
    console.warn("[image-templates] Category pool returned 0 results — trying fallback queries")
    for (const entry of FALLBACK_QUERIES) {
      if (images.length >= count) break
      const batch = await fetchUnsplashBatch(entry.query, accessKey, 20)
      for (const photo of batch) {
        if (images.length >= count) break
        if (!photo.regular || seenIds.has(photo.id)) continue
        seenIds.add(photo.id)
        images.push({
          id: photo.id,
          templateId: entry.id,
          imageUrl: photo.regular,
          thumbUrl: photo.thumb,
          altDescription: photo.alt,
          photographerName: photo.photographer,
          tags: entry.tags,
          query: entry.query,
        })
      }
    }
  }

  if (images.length === 0) {
    console.error(
      `[image-templates] All queries failed for category="${categoryFilter}". ` +
      "Check your UNSPLASH_ACCESS_KEY and Unsplash rate limits (50 req/hr on demo)."
    )
    return NextResponse.json(
      { error: "Failed to fetch images. Check server logs for the Unsplash error details." },
      { status: 502 }
    )
  }

  images.sort(() => Math.random() - 0.5)
  const finalImages = images.slice(0, count)

  console.log(
    `[image-templates] Returning ${finalImages.length} images | ${seenIds.size} IDs seen | category="${categoryFilter}"`
  )

  return NextResponse.json({ images: finalImages, total: finalImages.length })
}
