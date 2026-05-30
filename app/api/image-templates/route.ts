import { NextRequest, NextResponse } from "next/server"
import type { ImageTemplate } from "@/lib/image-templates"
import {
  CATEGORY_QUERY_POOLS,
  FALLBACK_QUERIES,
  type CategoryQueryEntry,
} from "@/lib/category-queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

// ── Response shape (unchanged — component reads these fields) ─────────────────
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

// ── Core fetch helper ─────────────────────────────────────────────────────────
// Returns ALL photos Unsplash sends back for one query (up to perPage).
// One call → many photos; far fewer API hits than one-call-per-template.
async function fetchUnsplashBatch(
  query: string,
  accessKey: string,
  perPage: number = 20
): Promise<UnsplashPhoto[]> {
  try {
    // Pages 1–3 have the most relevant results for any given query
    const page = Math.floor(Math.random() * 3) + 1
    const url = [
      "https://api.unsplash.com/search/photos",
      `?query=${encodeURIComponent(query)}`,
      `&per_page=${perPage}`,
      `&page=${page}`,
      "&orientation=landscape",
      `&client_id=${accessKey}`,
    ].join("")

    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      console.warn(`[image-templates] Unsplash ${res.status} for "${query}"`)
      return []
    }

    const data = await res.json()
    const photos: any[] = data.results ?? []

    console.log(`[image-templates] "${query}" → ${photos.length} results (page ${page})`)

    return photos.map((p: any) => ({
      id: p.id,
      regular: p.urls?.regular ?? p.urls?.full ?? "",
      thumb: p.urls?.thumb ?? p.urls?.small ?? "",
      alt: p.alt_description ?? p.description ?? null,
      photographer: p.user?.name ?? "Unknown",
    }))
  } catch (err) {
    console.warn(`[image-templates] Fetch failed for "${query}":`, String(err))
    return []
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_KEY
  if (!accessKey) {
    return NextResponse.json({ error: "Unsplash API key not configured" }, { status: 500 })
  }

  const { searchParams } = req.nextUrl
  const count = Math.min(parseInt(searchParams.get("count") ?? "10"), 24)
  const categoryFilter = searchParams.get("category") ?? ""

  // Resolve the query pool for this category; fall back if unknown
  const queryPool: CategoryQueryEntry[] =
    CATEGORY_QUERY_POOLS[categoryFilter] ?? FALLBACK_QUERIES

  console.log(
    `[image-templates] category="${categoryFilter}" | target=${count} | pool=${queryPool.length} queries`
  )

  const seenIds = new Set<string>()
  const images: FetchedTemplateImage[] = []

  // ── Sequential query loop ───────────────────────────────────────────────────
  // Try each query in order. Stop as soon as we have `count` unique images.
  // First query with per_page=20 normally yields 10+ immediately;
  // subsequent queries act as automatic fallbacks.
  for (const entry of queryPool) {
    if (images.length >= count) break

    const needed = count - images.length
    // Fetch a buffer above what we need to absorb duplicates
    const perPage = Math.min(needed + 10, 20)
    const batch = await fetchUnsplashBatch(entry.query, accessKey, perPage)

    let addedFromQuery = 0
    for (const photo of batch) {
      if (images.length >= count) break
      if (!photo.regular) continue           // skip photos with no URL
      if (seenIds.has(photo.id)) continue    // deduplicate

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
      addedFromQuery++
    }

    console.log(
      `[image-templates] "${entry.query}" → +${addedFromQuery} unique` +
        ` (${images.length}/${count} total | ${seenIds.size} IDs seen)`
    )
  }

  // ── Final safety fallback ───────────────────────────────────────────────────
  // If the entire category pool failed (rate limit, network error, etc.)
  // try the generic fallback queries rather than returning an error.
  if (images.length === 0 && queryPool !== FALLBACK_QUERIES) {
    console.warn("[image-templates] Category pool exhausted with 0 results — trying fallback queries")
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
    console.error(`[image-templates] All queries failed for category="${categoryFilter}"`)
    return NextResponse.json({ error: "Failed to fetch any images" }, { status: 502 })
  }

  // Shuffle for visual variety across sessions
  images.sort(() => Math.random() - 0.5)

  const finalImages = images.slice(0, count)

  console.log(
    `[image-templates] Done: ${finalImages.length} images returned` +
      ` | ${seenIds.size} unique IDs processed` +
      ` | category="${categoryFilter}"`
  )

  return NextResponse.json({ images: finalImages, total: finalImages.length })
}
