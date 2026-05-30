import { type NextRequest, NextResponse } from "next/server"
import { analyzePreferences, createPreferenceProfile } from "@/lib/preferences-analyzer"
import { getTopDestinations, type DestinationMatch } from "@/lib/destination-matcher"
import { ImageMetadata } from "@/lib/image-generator"
import { generateSeed, shuffleArrayWithSeed } from "@/lib/seed-randomizer"
import { getEnhancedDestinationDetails } from "@/lib/destination-enhancer"
import { destinationCache, generateCacheKey } from "@/lib/cache"
import {
  analyzeImagesWithGemini,
  analyzeProfileWithGemini,
  geminiToImageMetadata,
  type GeminiImageAnalysis,
} from "@/lib/gemini-vision"
import {
  accumulateScore,
  buildTravelProfile,
  createEmptyScores,
  profileToPrompt,
} from "@/lib/preference-scorer"

// ─── Gemini-independent text summary ─────────────────────────────────────────

const generateSummary = (destinations: any[], language: string): string => {
  const topDest = destinations[0]
  if (!topDest) return "No destinations found"

  if (language === "fr") {
    return `Basé sur vos préférences, ${topDest.countryName} est votre destination idéale.`
  }
  if (language === "ar") {
    return `بناءً على تفضيلاتك، ${topDest.countryName} هي الوجهة المناسبة لك.`
  }
  return `Based on your preferences, ${topDest.countryName} is a perfect match for you.`
}

// ─── BLIP fallback (used only when GEMINI_API_KEY is absent) ─────────────────
// Keeps the app working even without a Gemini key.

const BLIP_MODEL =
  "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 8000

async function callBLIP(body: Blob): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(BLIP_MODEL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body,
    })

    if (res.ok) {
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        return Array.isArray(data) && data[0]?.generated_text
          ? (data[0].generated_text as string)
          : ""
      } catch {
        return ""
      }
    }

    if (res.status === 429) {
      console.warn("[BLIP] Rate limit exceeded")
      break
    }

    if (res.status === 503) {
      const errText = await res.text()
      let errData: any = {}
      try { errData = JSON.parse(errText) } catch {}
      const wait = (errData.estimated_time ?? RETRY_DELAY_MS / 1000) * 1000
      console.log(`[BLIP] Model loading, retrying in ${wait}ms (attempt ${attempt + 1})`)
      await new Promise((r) => setTimeout(r, Math.min(wait, 30_000)))
      continue
    }

    console.error("[BLIP] API error:", res.status)
    break
  }
  return ""
}

async function blipCaptionToMetadata(imageUrl: string): Promise<Partial<ImageMetadata> | null> {
  try {
    let body: Blob
    if (imageUrl.startsWith("data:")) {
      const base64 = imageUrl.split(",")[1]
      body = new Blob([Buffer.from(base64, "base64")])
    } else {
      const res = await fetch(imageUrl)
      if (!res.ok) return null
      body = await res.blob()
    }

    const caption = await callBLIP(body)
    if (!caption) return null

    const c = caption.toLowerCase()
    const keywords = [
      "beach", "ocean", "sea", "waves", "sand", "sunset", "sunrise",
      "mountain", "hiking", "snow", "ski", "forest", "waterfall",
      "city", "street", "building", "architecture", "museum", "castle",
      "restaurant", "food", "market", "cafe", "temple", "church",
      "desert", "safari", "jungle", "lake", "river", "island",
      "village", "countryside", "vineyard", "garden", "park",
      "shopping", "night", "festival", "people", "harbour",
    ]
    const tags = keywords.filter((k) => c.includes(k))

    let mood = "adventurous"
    if (c.match(/beach|ocean|sea|sunset|tropical|relax|calm|peaceful/)) mood = "relaxed"
    else if (c.match(/museum|castle|temple|church|historical|old|ancient|ruin/)) mood = "cultural"
    else if (c.match(/luxury|resort|spa|hotel|fine dining|elegant/)) mood = "luxury"
    else if (c.match(/mountain|hiking|trek|adventure|climb|sport/)) mood = "adventurous"
    else if (c.match(/forest|lake|nature|quiet|serene/)) mood = "calm"

    let climate = "temperate"
    if (c.match(/beach|ocean|tropical|palm|hot|humid|warm|sunny/)) climate = "tropical"
    else if (c.match(/snow|winter|cold|ice|ski|frozen|blizzard/)) climate = "cold"
    else if (c.match(/desert|sand|dry|arid|dune|barren/)) climate = "desert"

    let environment = "nature"
    if (c.match(/city|street|building|urban|downtown|skyscraper|tower/)) environment = "urban"
    else if (c.match(/beach|ocean|sea|coast|waves|island|shore/)) environment = "beach"
    else if (c.match(/mountain|peak|summit|cliff|hill|alpine/)) environment = "mountain"
    else if (c.match(/forest|jungle|trees|woodland/)) environment = "forest"
    else if (c.match(/desert|dune|arid/)) environment = "desert"
    else if (c.match(/temple|church|museum|castle|historical|ruin/)) environment = "cultural"

    let activity_level: "low" | "medium" | "high" = "medium"
    if (c.match(/hiking|climbing|skiing|surfing|adventure|trek|sport|running|kayak/)) {
      activity_level = "high"
    } else if (c.match(/beach|relax|resort|spa|sunset|lying|sitting|lounging/)) {
      activity_level = "low"
    }

    let food_style = "local"
    if (c.match(/restaurant|fine dining|gourmet|chef|elegant dinner/)) food_style = "fine_dining"
    else if (c.match(/market|street food|vendor|stall|bazaar/)) food_style = "street_food"
    else if (c.match(/seafood|fish|shrimp|lobster|harbour/)) food_style = "seafood"
    else if (c.match(/cafe|coffee|bakery|pastry|brunch/)) food_style = "cafe"
    else if (c.match(/beach|tropical|island/)) food_style = "seafood"

    return { tags, mood, climate, environment, activity_level, food_style }
  } catch (err) {
    console.error("[BLIP] Error:", err)
    return null
  }
}

// ─── Safe defaults ────────────────────────────────────────────────────────────
// analyzePreferences() iterates metadata.tags — every field must be populated.

const METADATA_DEFAULTS: ImageMetadata = {
  tags: [],
  mood: "adventurous",
  climate: "temperate",
  environment: "nature",
  activity_level: "medium",
  food_style: "local",
}

function tripStyleToLevel(tripStyle?: string): "low" | "medium" | "high" {
  if (tripStyle === "adventure" || tripStyle === "party") return "high"
  if (tripStyle === "relaxed" || tripStyle === "wellness") return "low"
  return "medium"
}

// ─── Companion-type destination bonuses ──────────────────────────────────────
// Added to confidenceScore after ranking so solo/couple/friends/family context
// nudges results toward the most fitting destinations.
const COMPANION_BONUS: Record<string, Record<string, number>> = {
  solo:    { JP: 4, VN: 4, MA: 3, TH: 3, IN: 3, ID: 2, GR: 2, ES: 2, PT: 2, AU: 2, NZ: 2, FR: 1, IT: 1, AE: 0 },
  couple:  { GR: 5, FR: 5, IT: 5, ID: 4, AE: 3, ES: 3, JP: 2, TH: 2, MA: 1, VN: 1, PT: 2, CH: 3, IN: 1 },
  friends: { ES: 6, TH: 5, GR: 4, VN: 4, ID: 3, MA: 3, IN: 2, JP: 2, IT: 2, AE: 2, FR: 1, BR: 3, MX: 3 },
  family:  { IT: 4, JP: 3, FR: 3, AE: 2, ES: 2, GR: 2, TH: 2, AU: 3, SG: 3, ID: 1, VN: 1, IN: 1, MA: 0 },
}

// ─── Force dynamic rendering ──────────────────────────────────────────────────
export const dynamic = "force-dynamic"
export const revalidate = 0

// ─── POST /api/analyze ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      imageMetadata = [],
      language = "en",
      seed = null,
      preferences: userPreferences = {},
      travelCompanion = null,
    } = body

    const requestSeed = seed || generateSeed()

    console.log("[analyze] Request — seed:", requestSeed, {
      metadataCount: imageMetadata.length,
      language,
      usingGemini: !!process.env.GEMINI_API_KEY,
    })

    if (!Array.isArray(imageMetadata) || imageMetadata.length === 0) {
      return NextResponse.json(
        { error: "No image metadata provided" },
        { status: 400 }
      )
    }

    // ── Detect path: template-driven vs legacy image vision ───────────────────
    const templateCount = imageMetadata.filter((img: any) => img.templateTags).length
    const useTemplatePath = templateCount >= Math.ceil(imageMetadata.length / 2)

    let enrichedMetadata: ImageMetadata[]
    let geminiResults: Array<GeminiImageAnalysis | null> = []
    let geminiProfileInsight: Awaited<ReturnType<typeof analyzeProfileWithGemini>> = null

    if (useTemplatePath) {
      // ── Template path: accumulate scores from hidden metadata ───────────────
      console.log("[analyze] Template path — scoring from metadata tags")

      let scores = createEmptyScores()
      for (const img of imageMetadata) {
        if (img.templateTags) scores = accumulateScore(scores, img.templateTags)
      }
      const travelProfile = buildTravelProfile(scores, imageMetadata.length)

      // Use Gemini for personalized reasoning text (profile summary, not images)
      if (process.env.GEMINI_API_KEY) {
        geminiProfileInsight = await analyzeProfileWithGemini(profileToPrompt(travelProfile))
      }

      // Convert template profile → ImageMetadata format expected by destination-matcher
      enrichedMetadata = imageMetadata.map((img: any) => {
        const tags = img.templateTags
          ? [
              img.templateTags.vibe,
              img.templateTags.tripStyle,
              img.templateTags.environment,
              ...(img.templateTags.interests ?? []),
            ]
          : (img.tags ?? [])
        return {
          ...METADATA_DEFAULTS,
          tags,
          mood:           img.templateTags?.vibe     ?? img.mood     ?? "adventurous",
          climate:        img.templateTags?.climate   ?? img.climate  ?? "temperate",
          environment:    img.templateTags?.environment ?? img.environment ?? "nature",
          activity_level: tripStyleToLevel(img.templateTags?.tripStyle) ?? img.activity_level ?? "medium",
          food_style:     img.templateTags?.foodStyle ?? img.food_style ?? "local",
        } satisfies ImageMetadata
      })
    } else {
      // ── Legacy vision path: Gemini Vision on raw images ─────────────────────
      const imageUrls: string[] = imageMetadata.map((img: any) => img.url).filter(Boolean)

      if (process.env.GEMINI_API_KEY) {
        console.log("[analyze] Gemini Vision on", imageUrls.length, "images")
        geminiResults = await analyzeImagesWithGemini(imageUrls)
      }

      enrichedMetadata = await Promise.all(
        imageMetadata.map(async (img: any, index: number) => {
          const base: ImageMetadata = { ...METADATA_DEFAULTS, ...img, tags: img.tags ?? [] }

          const gemini = geminiResults[index]
          if (gemini) {
            const mapped = geminiToImageMetadata(gemini)
            return { ...base, ...mapped, tags: mapped.tags.length > 0 ? mapped.tags : base.tags }
          }

          if (img.url) {
            const blip = await blipCaptionToMetadata(img.url)
            if (blip) return { ...base, ...blip, tags: blip.tags?.length ? blip.tags : base.tags }
          }

          return base
        })
      )
    }

    // ── Step 3: Recommendation engine (100% code-based, no AI) ───────────────
    const preferences = analyzePreferences(enrichedMetadata)
    const profile = createPreferenceProfile(preferences)

    const matchContext = {
      budget:      userPreferences.budget as string | undefined,
      travelDates: userPreferences.travelDates as { start: string; end: string } | undefined,
    }

    // Cache key: profile fingerprint + budget + travel month (season changes monthly)
    const travelMonth = matchContext.travelDates?.start
      ? new Date(matchContext.travelDates.start).getMonth()
      : -1
    const cacheKey = generateCacheKey(
      profile.dominantMood,
      profile.preferredClimate,
      profile.preferredEnvironment,
      profile.activityLevel,
      matchContext.budget ?? "none",
      String(travelMonth),
    )

    let topDestinations: DestinationMatch[] =
      (destinationCache.get(cacheKey) as DestinationMatch[] | null) ??
      getTopDestinations(profile, 10, matchContext)

    if (!destinationCache.has(cacheKey)) {
      destinationCache.set(cacheKey, topDestinations)
    }

    topDestinations = shuffleArrayWithSeed(topDestinations, requestSeed) as DestinationMatch[]

    // Apply companion-type bonuses before final slice so ranking reflects them
    if (travelCompanion && COMPANION_BONUS[travelCompanion]) {
      const bonus = COMPANION_BONUS[travelCompanion]
      topDestinations = topDestinations.map((dest) => ({
        ...dest,
        confidenceScore: Math.min(98, dest.confidenceScore + (bonus[dest.countryCode] ?? 0)),
      }))
      topDestinations.sort((a, b) => b.confidenceScore - a.confidenceScore)
    }

    topDestinations = topDestinations.slice(0, 3)

    const validatedDestinations = topDestinations.map((dest, index) => ({
      ...dest,
      confidenceScore: Math.max(60, Math.min(95, dest.confidenceScore + index * 2)),
    }))

    // ── Step 4: Enhanced details for the top destination ─────────────────────
    const topDestination = validatedDestinations[0]
    let selectedDestinationDetails = null

    if (topDestination) {
      try {
        selectedDestinationDetails = await getEnhancedDestinationDetails(
          topDestination.countryCode,
          profile,
          userPreferences.budget || "medium",
          userPreferences.travelDates
        )
      } catch (error) {
        console.error("[analyze] Enhanced destination details error:", error)
      }
    }

    // ── Step 5: Build response ────────────────────────────────────────────────
    // geminiAnalysis is included so the client can save it to Firestore.
    const response = {
      requestSeed,
      userProfile: {
        dominantMood:         profile.dominantMood,
        preferredClimate:     profile.preferredClimate,
        preferredEnvironment: profile.preferredEnvironment,
        activityLevel:        profile.activityLevel,
        foodPreferences:      profile.foodPreferences,
      },
      // Per-image Gemini analysis (null entries = image analysis failed)
      geminiAnalysis: geminiResults,
      geminiProfileInsight,
      selectedDestinationDetails,
      countries: validatedDestinations.map((dest) => ({
        name: dest.countryName,
        code: dest.countryCode,
        matchPercentage: dest.confidenceScore,
        reason: dest.positives[0] ?? `A great match for ${profile.dominantMood} travellers`,
        vibe: profile.dominantMood.charAt(0).toUpperCase() + profile.dominantMood.slice(1),
        confidenceBreakdown: {
          activity: dest.scoreBreakdown.activityScore,
          climate:  dest.scoreBreakdown.climateScore,
          mood:     dest.scoreBreakdown.moodScore,
          food:     dest.scoreBreakdown.foodScore,
        },
        positives:      dest.positives,
        negatives:      dest.negatives,
        climate:        dest.climate,
        activities:     dest.activities,
        foodHighlights: dest.foodHighlights,
        cities: dest.cities ?? [],
        hotels: dest.hotels.map((h) => ({
          name:           h.name,
          style:          h.style,
          activity_level: h.activity_level,
        })),
      })),
      summary: generateSummary(validatedDestinations, language),
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[analyze] Unhandled error:", message, error)
    return NextResponse.json(
      { error: "Failed to analyze preferences", detail: message },
      { status: 500 }
    )
  }
}
