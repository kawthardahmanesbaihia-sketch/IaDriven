/**
 * /api/explore-analyze — Primary image-based recommendation endpoint
 *
 * Pipeline:
 *   CLIP (Xenova/clip-vit-base-patch32)
 *     ↓ zero-shot image classification against 600+ destination concept phrases
 *     ↓ Geographic Reasoning Engine (landmark detection + environment elimination)
 *     ↓ semantic similarity aggregation across all selected images
 *     ↓ ranked destination list with explanations
 *
 * CLIP is the ONLY image analysis engine — Gemini does NOT participate.
 */

import { NextRequest, NextResponse } from "next/server"
import { rankDestinationsByCLIP } from "@/lib/clip-scorer"
import { prewarm } from "@/lib/clip-service"
import { prewarmTextEmbeddings } from "@/lib/clip-scorer"
import { EXPLORE_DESTINATIONS } from "@/lib/explore-destinations"
import {
  parseBody,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  ExploreBodySchema,
} from "@/lib/request-validation"

export const runtime = "nodejs"

prewarm()
prewarmTextEmbeddings().catch(() => {})

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req)
  if (!checkRateLimit(ip).allowed) return rateLimitResponse()

  try {
    const raw = await req.json()
    const parsed = parseBody(ExploreBodySchema, raw)
    if (!parsed.ok) return parsed.response

    const { images, squad } = parsed.data
    const clampedImages = images.slice(0, 5)
    console.log(`[explore-analyze] ${clampedImages.length} image(s) | squad="${squad ?? "none"}" | engine=CLIP`)


    const result = await rankDestinationsByCLIP(clampedImages, squad ?? undefined)

    const { ranked, confidence, vibes, travelStyle, processingMs } = result
    const best = ranked[0]

    console.log(
      `[explore-analyze] CLIP OK — ${processingMs}ms | conf=${confidence}% | winner=${best.id}`
    )

    return NextResponse.json({
      destinationId:   best.id,
      destinationName: best.name,
      heroImage:       best.heroImage,
      flag:            best.flag,
      confidence:      Math.min(confidence, 97),
      vibes,
      travelStyle,
      cities:          best.cities,
      engine:          "clip",
      ranked: ranked.slice(0, 3).map(r => ({
        id:             r.id,
        name:           r.name,
        flag:           r.flag,
        cities:         r.cities,
        explanation:    r.explanation,
        scoreBreakdown: r.scoreBreakdown,
      })),
    })

  } catch (err) {
    console.error("[explore-analyze] CLIP error:", err)
    return NextResponse.json({ error: "Image analysis failed — please try again" }, { status: 503 })
  }
}
