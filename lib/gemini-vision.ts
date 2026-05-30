/**
 * Gemini Vision — travel preference extraction from images.
 *
 * ROOT CAUSE OF 404 BUG: "gemini-1.5-flash" was sunset 2025-05-14.
 * Google's REST endpoint returns HTTP 404 for that model name.
 * Fixed by: switching to "gemini-2.0-flash" via the @google/generative-ai SDK
 * instead of raw fetch (the SDK was already installed but unused).
 */

import { GoogleGenerativeAI } from "@google/generative-ai"

// ── Model ─────────────────────────────────────────────────────────────────────
// gemini-1.5-flash sunset date: 2025-05-14 → HTTP 404 for any call after that.
// gemini-2.0-flash is GA, supports multimodal + JSON mode, and is significantly
// more capable than 1.5-flash for travel psychology extraction.
const GEMINI_MODEL = "gemini-2.0-flash"

// ── Legacy shape (used by /api/analyze route) ─────────────────────────────────

export interface GeminiImageAnalysis {
  travelStyle: "adventure" | "luxury" | "cultural" | "relaxed" | "budget"
  preferredClimate: "tropical" | "temperate" | "cold" | "desert" | "mediterranean"
  activities: string[]
  environment: string[]
  vibe: string[]
  mood: string
  tags: string[]
}

// ── Travel Psychology shape (used by /api/explore-analyze route) ──────────────

export interface TravelPreferenceAnalysis {
  travelStyles: string[]
  activities: string[]
  budgetLevel: "low" | "medium" | "high" | "ultra"
  climatePreference: string[]
  travelType: "solo" | "couple" | "friends" | "family"
  possibleRegions: string[]
  atmosphere: string[]
  emotionalVibe: string[]
  architectureStyle: string[]
  culturalContext: string[]
  explorationStyle: string[]
  luxuryLevel: number
  natureLevel: number
  cityLevel: number
  relaxationLevel: number
  adventureLevel: number
  socialLevel: number
  nightlifeInterest: number
  culturalInterest: number
  romanticAffinity: number
  foodExplorationAffinity: number
  familyFriendly: boolean
  confidenceLevel: number
}

// ── Extended destination-analysis shape (kept for backward compat) ────────────

export interface DestinationPreferenceAnalysis {
  possible_locations: string[]
  landmarks: string[]
  architecture_style: string[]
  culture_signals: string[]
  location_confidence: number
  scores: {
    luxury: number; adventure: number; family: number; romantic: number
    nightlife: number; culture: number; food: number; nature: number
    shopping: number; wellness: number; relaxation: number
    soloTravel: number; groupTravel: number
  }
  confidence: number
  travelStyle: GeminiImageAnalysis["travelStyle"]
  preferredClimate: GeminiImageAnalysis["preferredClimate"]
  activities: string[]
  environment: string[]
  vibe: string[]
  tags: string[]
}

// ── SDK helper ────────────────────────────────────────────────────────────────

function buildModel(apiKey: string, maxOutputTokens: number, temperature: number) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
    },
  })
}

// ── Image fetching ────────────────────────────────────────────────────────────

async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      console.warn(`[Gemini] Remote image fetch failed: ${res.status} ${url.slice(0, 80)}`)
      return null
    }
    const buffer = await res.arrayBuffer()
    const base64   = Buffer.from(buffer).toString("base64")
    const mimeType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg"
    return { base64, mimeType }
  } catch (err) {
    console.warn(`[Gemini] Remote image fetch error: ${err}`)
    return null
  }
}

// ── Shared image preparation ──────────────────────────────────────────────────

async function prepareImage(
  imageUrl: string
): Promise<{ base64: string; mimeType: string; source: string } | null> {
  if (imageUrl.startsWith("data:")) {
    const commaIdx = imageUrl.indexOf(",")
    if (commaIdx < 0) { console.warn("[Gemini] Malformed data URL"); return null }
    const base64   = imageUrl.slice(commaIdx + 1)
    const mimeMatch = imageUrl.slice(0, commaIdx).match(/data:([^;]+);/)
    const mimeType = mimeMatch?.[1] ?? "image/jpeg"
    return { base64, mimeType, source: "upload" }
  }
  const fetched = await fetchImageAsBase64(imageUrl)
  if (!fetched) return null
  return { ...fetched, source: imageUrl.slice(0, 60) }
}

// ── JSON parsing helper ───────────────────────────────────────────────────────
// Gemini 2.0 with responseMimeType:"application/json" returns clean JSON, but
// we keep a markdown-strip fallback just in case.

function parseGeminiJson<T>(text: string): T | null {
  const clean = text.trim()
  try { return JSON.parse(clean) as T } catch {}
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) return null
  try { return JSON.parse(match[0]) as T } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 1. Legacy vision analysis (used by /api/analyze) ─────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `Analyze this travel image. Return ONLY a valid JSON object — no markdown, no explanation, no code block. Exact schema:
{
  "travelStyle": "adventure|luxury|cultural|relaxed|budget",
  "preferredClimate": "tropical|temperate|cold|desert|mediterranean",
  "activities": ["up to 4 activities from: beach, hiking, nightlife, diving, shopping, museums, skiing, surfing, food, wellness, adventure, cycling"],
  "environment": ["up to 3 from: ocean, mountain, city, forest, desert, countryside, lake, island, village"],
  "vibe": ["up to 3 from: relaxing, romantic, exciting, peaceful, adventurous, cultural, luxurious, energetic, spiritual"],
  "mood": "calm|adventurous|cultural|luxury|relaxed",
  "tags": ["up to 8 specific travel keywords visible in the image"]
}`

export async function analyzeImageWithGemini(
  imageUrl: string
): Promise<GeminiImageAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn("[Gemini] GEMINI_API_KEY not set — skipping vision analysis")
    return null
  }

  const img = await prepareImage(imageUrl)
  if (!img) return null

  console.log(`[Gemini] analyzeImageWithGemini | model=${GEMINI_MODEL} | src=${img.source} | mime=${img.mimeType} | b64len=${img.base64.length}`)

  try {
    const model = buildModel(apiKey, 400, 0.1)
    const result = await model.generateContent([
      { inlineData: { data: img.base64, mimeType: img.mimeType } },
      { text: ANALYSIS_PROMPT },
    ])
    const text = result.response.text()
    console.log(`[Gemini] analyzeImageWithGemini raw response (first 200): ${text.slice(0, 200)}`)
    const parsed = parseGeminiJson<GeminiImageAnalysis>(text)
    if (!parsed) console.warn("[Gemini] analyzeImageWithGemini: could not parse JSON")
    return parsed
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Gemini] analyzeImageWithGemini FAILED | model=${GEMINI_MODEL} | error: ${msg}`)
    if (error instanceof Error && error.stack) console.error(error.stack)
    return null
  }
}

export async function analyzeImagesWithGemini(
  imageUrls: string[]
): Promise<Array<GeminiImageAnalysis | null>> {
  const limited = imageUrls.slice(0, 5)
  console.log(`[Gemini] analyzeImagesWithGemini: ${limited.length} image(s)`)
  return Promise.all(limited.map((url) => analyzeImageWithGemini(url)))
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 2. Travel psychology analysis (used by /api/explore-analyze) ──────────────
// ─────────────────────────────────────────────────────────────────────────────

const TRAVEL_PSYCHOLOGY_PROMPT = `You are a Travel Psychology + Visual Intelligence AI.

Decode the TRAVEL PERSONALITY and DESIRED EXPERIENCE this image signals — not where it was taken.

ABSOLUTE RULES — any violation breaks the system:
1. NEVER name a specific country, nation, state, or city anywhere in your output.
2. NEVER identify a specific landmark or monument by name.
3. architectureStyle = the architectural STYLE (islamic, brutalist, gothic...) — NOT the location.
4. culturalContext = the broad visual cultural aesthetic (north-african, east-asian...) — NOT a country.
5. possibleRegions = broad geographic macro-region (North Africa, East Asia...) — NOT a country.

ANALYZE THESE DIMENSIONS:
- Visual atmosphere, mood, and lighting
- Architectural character: style, scale, material, ornamentation
- Cultural visual identity: what tradition does the aesthetic belong to?
- Human presence and social energy
- Natural vs built environment balance
- Luxury / authenticity / budget indicators
- Activity types and movement signals
- Climate, season, and environmental cues

Return ONLY valid JSON — no markdown, no code block, no explanation:
{
  "travelStyles": ["2-4 from: urban, cultural, luxury, adventure, nature, relaxed, romantic, social, spiritual, wellness, family, budget, backpacker, road-trip, coastal, foodie"],
  "atmosphere": ["2-5 from: historical, monumental, ancient, sun-drenched, tropical, cozy, vibrant, serene, mystical, wild, glamorous, raw, modern, warm, cool, lively, peaceful, rugged, ethereal, dramatic"],
  "emotionalVibe": ["1-3 from: inspired, curious, adventurous, peaceful, romantic, energized, contemplative, excited, nostalgic, awestruck, free, grounded, exhilarated"],
  "architectureStyle": ["0-3 from: islamic, gothic, baroque, modernist, brutalist, traditional, mediterranean, japanese-traditional, art-deco, minimalist, colonial, moorish, ottoman, vernacular, tropical, cycladic, mughal, roman-classical, futuristic, art-nouveau, north-african, indo-islamic — EMPTY ARRAY if no significant architecture"],
  "culturalContext": ["0-2 from: north-african, east-asian, south-asian, middle-eastern, western-european, mediterranean-coastal, tropical-asian, latin-american, nordic, sub-saharan, island-tropical — describe the visual cultural aesthetic only — EMPTY if not clearly evident"],
  "explorationStyle": ["1-2 from: deep-dive, wandering, guided-tour, spontaneous, structured, slow-travel, immersive, off-beaten-path"],
  "activities": ["2-5 from: food, history, shopping, hiking, beach, diving, skiing, nightlife, museums, wellness, photography, cycling, water-sports, festivals, cooking, yoga, sailing, trekking"],
  "budgetLevel": "low|medium|high|ultra",
  "climatePreference": ["1-3 from: tropical, warm, temperate, cold, desert, snowy, mediterranean"],
  "travelType": "solo|couple|friends|family",
  "possibleRegions": ["0-2 from: Mediterranean, Western Europe, Eastern Europe, North Africa, Middle East, East Asia, Southeast Asia, South Asia, Caribbean, South America, Nordic, Oceania — EMPTY if no clear geographic visual context"],
  "luxuryLevel": <integer 0-100>,
  "natureLevel": <integer 0-100>,
  "cityLevel": <integer 0-100>,
  "relaxationLevel": <integer 0-100>,
  "adventureLevel": <integer 0-100>,
  "socialLevel": <integer 0-100>,
  "familyFriendly": <true|false>,
  "nightlifeInterest": <integer 0-100>,
  "culturalInterest": <integer 0-100>,
  "romanticAffinity": <integer 0-100>,
  "foodExplorationAffinity": <integer 0-100>,
  "confidenceLevel": <float 0.0-1.0: how confidently you read this image>
}`

async function analyzeImageForTravel(
  imageUrl: string,
  index: number = 0
): Promise<TravelPreferenceAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn("[Gemini] GEMINI_API_KEY not set")
    return null
  }

  const img = await prepareImage(imageUrl)
  if (!img) {
    console.warn(`[Gemini Travel] Image ${index + 1}: could not prepare image`)
    return null
  }

  console.log(
    `[Gemini Travel] Image ${index + 1} | model=${GEMINI_MODEL} | ` +
    `src=${img.source} | mime=${img.mimeType} | b64len=${img.base64.length}`
  )

  try {
    const model = buildModel(apiKey, 900, 0.15)
    const t0 = Date.now()
    const result = await model.generateContent([
      { inlineData: { data: img.base64, mimeType: img.mimeType } },
      { text: TRAVEL_PSYCHOLOGY_PROMPT },
    ])
    const ms = Date.now() - t0
    const text = result.response.text()

    console.log(
      `[Gemini Travel] Image ${index + 1} responded in ${ms}ms | ` +
      `raw (first 300): ${text.slice(0, 300)}`
    )

    const parsed = parseGeminiJson<TravelPreferenceAnalysis>(text)
    if (!parsed) {
      console.error(`[Gemini Travel] Image ${index + 1}: JSON parse failed | full text: ${text.slice(0, 500)}`)
      return null
    }

    console.log(
      `[Gemini Travel] Image ${index + 1} parsed OK | ` +
      `styles=${JSON.stringify(parsed.travelStyles)} | ` +
      `arch=${JSON.stringify(parsed.architectureStyle)} | ` +
      `culture=${JSON.stringify(parsed.culturalContext)} | ` +
      `regions=${JSON.stringify(parsed.possibleRegions)} | ` +
      `budget=${parsed.budgetLevel} | luxury=${parsed.luxuryLevel} | ` +
      `culture_score=${parsed.culturalInterest} | adventure=${parsed.adventureLevel} | ` +
      `confidence=${parsed.confidenceLevel}`
    )

    return parsed
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(
      `[Gemini Travel] Image ${index + 1} FAILED | model=${GEMINI_MODEL} | error: ${msg}`
    )
    if (error instanceof Error && error.stack) console.error(error.stack)
    return null
  }
}

export async function analyzeImagesForTravel(
  imageUrls: string[]
): Promise<Array<TravelPreferenceAnalysis | null>> {
  const limited = imageUrls.slice(0, 5)
  console.log(
    `[Gemini Travel] analyzeImagesForTravel: ${limited.length} image(s) | model=${GEMINI_MODEL}`
  )
  return Promise.all(limited.map((url, i) => analyzeImageForTravel(url, i)))
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 3. Profile text analysis (used by /api/analyze — template path) ───────────
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeProfileWithGemini(profileSummary: string): Promise<{
  recommendationReason: string
  travelPersonality: string
  topExperiences: string[]
  avoidances: string[]
  geminiInsight: string
} | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const PROFILE_PROMPT = `You are an expert travel consultant. Based on the travel profile below, generate personalized travel insights. Return ONLY valid JSON — no markdown, no code block.

${profileSummary}

Return exactly this JSON schema:
{
  "recommendationReason": "2-3 sentence explanation of why specific destinations match this traveler",
  "travelPersonality": "short label like 'The Adventure Seeker' or 'The Luxury Explorer'",
  "topExperiences": ["up to 4 experience types this traveler would love"],
  "avoidances": ["up to 2 things this traveler would NOT enjoy"],
  "geminiInsight": "one unique, personalized insight about this traveler's style"
}`

  console.log(`[Gemini Profile] analyzeProfileWithGemini | model=${GEMINI_MODEL}`)

  try {
    const model = buildModel(apiKey, 500, 0.4)
    const result = await model.generateContent(PROFILE_PROMPT)
    const text = result.response.text()
    const parsed = parseGeminiJson<{
      recommendationReason: string; travelPersonality: string
      topExperiences: string[]; avoidances: string[]; geminiInsight: string
    }>(text)
    if (!parsed) console.warn("[Gemini Profile] Could not parse JSON from profile analysis")
    return parsed
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Gemini Profile] FAILED | model=${GEMINI_MODEL} | error: ${msg}`)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 4. Destination analysis (backward compat — not used in current routes) ────
// ─────────────────────────────────────────────────────────────────────────────

const DESTINATION_ANALYSIS_PROMPT = `You are a travel intelligence system. Analyze this image in two steps.

STEP 1 — GEOGRAPHIC & CULTURAL DETECTION (do this first):
- Identify any recognizable landmark, monument, or famous place. Name it precisely if you recognize it.
- Identify the architectural style (e.g. "Islamic", "Japanese traditional", "French Haussmann", "North African brutalist").
- Infer the most likely country, region, or continent based on visual evidence.
- List cultural signals (e.g. "North African culture", "Buddhist temple", "Scandinavian design").
- Set location_confidence based on how certain you are (0 = no idea, 1 = certain landmark recognized).

STEP 2 — TRAVEL SIGNAL EXTRACTION:
- Base travel style and preference scores on what you detected in Step 1, not generic guesses.
- A cultural monument in North Africa should produce high culture score and cultural travelStyle, NOT luxury Western European signals.
- Avoid recommending unrelated destinations — if you detect Arabic/North African context, reflect that in location/culture tags.

Return ONLY a valid JSON object — no markdown, no explanation, no code block:
{
  "possible_locations": ["specific countries, regions, or continents you detected"],
  "landmarks": ["any recognizable landmark — empty array if uncertain"],
  "architecture_style": ["architectural styles visible"],
  "culture_signals": ["cultural context clues"],
  "location_confidence": <float 0.0-1.0>,
  "scores": {
    "luxury": <0-10>, "adventure": <0-10>, "family": <0-10>, "romantic": <0-10>,
    "nightlife": <0-10>, "culture": <0-10>, "food": <0-10>, "nature": <0-10>,
    "shopping": <0-10>, "wellness": <0-10>, "relaxation": <0-10>,
    "soloTravel": <0-10>, "groupTravel": <0-10>
  },
  "confidence": <float 0.0-1.0>,
  "travelStyle": "adventure|luxury|cultural|relaxed|budget",
  "preferredClimate": "tropical|temperate|cold|desert|mediterranean",
  "activities": ["up to 4 from: beach, hiking, nightlife, diving, shopping, museums, skiing, surfing, food, wellness, adventure, cycling"],
  "environment": ["up to 3 from: ocean, mountain, city, forest, desert, countryside, lake, island, village"],
  "vibe": ["up to 3 from: relaxing, romantic, exciting, peaceful, adventurous, cultural, luxurious, energetic, spiritual"],
  "tags": ["up to 8 travel keywords"]
}`

async function analyzeImageForDestination(
  imageUrl: string
): Promise<DestinationPreferenceAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const img = await prepareImage(imageUrl)
  if (!img) return null

  try {
    const model = buildModel(apiKey, 800, 0.1)
    const result = await model.generateContent([
      { inlineData: { data: img.base64, mimeType: img.mimeType } },
      { text: DESTINATION_ANALYSIS_PROMPT },
    ])
    return parseGeminiJson<DestinationPreferenceAnalysis>(result.response.text())
  } catch (error) {
    console.error(`[Gemini Destination] FAILED: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

export async function analyzeImagesForDestination(
  imageUrls: string[]
): Promise<Array<DestinationPreferenceAnalysis | null>> {
  const limited = imageUrls.slice(0, 5)
  return Promise.all(limited.map((url) => analyzeImageForDestination(url)))
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 5. Mapping helper (used by /api/analyze) ──────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export function geminiToImageMetadata(analysis: GeminiImageAnalysis): {
  tags: string[]
  mood: string
  climate: string
  environment: string
  activity_level: "low" | "medium" | "high"
  food_style: string
} {
  const highActivity = ["hiking", "skiing", "surfing", "adventure", "diving", "cycling"]
  const lowActivity  = ["beach", "wellness", "relaxing", "spa"]

  const activityWords = [...analysis.activities, ...analysis.vibe, ...analysis.tags]
  let activity_level: "low" | "medium" | "high" = "medium"
  if (activityWords.some((a) => highActivity.includes(a.toLowerCase()))) activity_level = "high"
  else if (activityWords.some((a) => lowActivity.includes(a.toLowerCase()))) activity_level = "low"

  const tags = [...analysis.tags, ...analysis.activities]
  let food_style = "local"
  if (tags.some((t) => ["fine dining", "gourmet", "michelin", "luxury"].includes(t.toLowerCase()))) food_style = "fine_dining"
  else if (tags.some((t) => ["street food", "market", "street", "vendor"].includes(t.toLowerCase()))) food_style = "street_food"
  else if (tags.some((t) => ["seafood", "fish", "ocean", "harbour"].includes(t.toLowerCase()))) food_style = "seafood"
  else if (tags.some((t) => ["cafe", "coffee", "bakery", "brunch"].includes(t.toLowerCase()))) food_style = "cafe"
  else if (tags.some((t) => ["vegetarian", "vegan", "healthy"].includes(t.toLowerCase()))) food_style = "vegetarian"

  const allTags = Array.from(new Set([
    ...analysis.tags, ...analysis.activities,
    ...analysis.environment, ...analysis.vibe,
    analysis.travelStyle, analysis.mood,
  ]))

  return {
    tags: allTags,
    mood: analysis.mood,
    climate: analysis.preferredClimate,
    environment: analysis.environment[0] || "nature",
    activity_level,
    food_style,
  }
}
