import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface ImageAnalysisResult {
  caption: string
  tags: string[]
  mood: string
  climate: string
  environment: string
  activity_level: "low" | "medium" | "high"
  food_style: string
}

const BLIP_MODEL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
const MAX_RETRIES = 3

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
      const data = await res.json()
      return Array.isArray(data) && data[0]?.generated_text
        ? (data[0].generated_text as string)
        : ""
    }

    if (res.status === 503) {
      const errData = await res.json().catch(() => ({}))
      const wait = Math.min((errData.estimated_time ?? 8) * 1000, 30_000)
      console.log(`[BLIP] Model loading, retrying in ${wait}ms (attempt ${attempt + 1})`)
      await new Promise((r) => setTimeout(r, wait))
      continue
    }

    console.error("[BLIP] API error:", res.status)
    break
  }
  return ""
}

async function getBLIPCaption(imageDataUrl: string): Promise<string> {
  try {
    let body: Blob

    if (imageDataUrl.startsWith("data:")) {
      const base64 = imageDataUrl.split(",")[1]
      body = new Blob([Buffer.from(base64, "base64")])
    } else {
      const res = await fetch(imageDataUrl)
      if (!res.ok) return ""
      body = await res.blob()
    }

    return await callBLIP(body)
  } catch (err) {
    console.error("[BLIP] Caption error:", err)
    return ""
  }
}

function parseCaptionToMetadata(caption: string): ImageAnalysisResult {
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
  else if (c.match(/city|street|market|crowd|busy|urban/)) mood = "adventurous"

  let climate = "temperate"
  if (c.match(/beach|ocean|tropical|palm|hot|humid|warm|sunny/)) climate = "tropical"
  else if (c.match(/snow|winter|cold|ice|ski|frozen|blizzard/)) climate = "cold"
  else if (c.match(/desert|sand|dry|arid|dune|barren/)) climate = "desert"
  else if (c.match(/rain|green|lush|jungle|moist/)) climate = "temperate"

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
  else if (c.match(/vegetarian|vegan|salad|healthy|organic/)) food_style = "vegetarian"
  else if (c.match(/cafe|coffee|bakery|pastry|brunch/)) food_style = "cafe"
  else if (c.match(/beach|tropical|island/)) food_style = "seafood"

  return { caption, tags, mood, climate, environment, activity_level, food_style }
}

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json()

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    const results = await Promise.all(
      images.map(async (imageUrl: string) => {
        const caption = await getBLIPCaption(imageUrl)
        return parseCaptionToMetadata(caption)
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[analyze-images] Error:", error)
    return NextResponse.json({ error: "Failed to analyze images" }, { status: 500 })
  }
}
