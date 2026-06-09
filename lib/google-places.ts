/**
 * Google Places client — server-side only.
 *
 * Restaurants  → Places API (New) — POST /v1/places:searchText
 *   Auth:       X-Goog-Api-Key header
 *   Filtering:  priceLevels enum maps directly to user budget
 *   Photos:     resource-name based media URLs
 *
 * Hotels → Legacy Places Text Search (GET) — unchanged.
 */

// ── Endpoints ─────────────────────────────────────────────────────────────────

const LEGACY_TEXT_SEARCH  = "https://maps.googleapis.com/maps/api/place/textsearch/json"
const LEGACY_PHOTO_BASE   = "https://maps.googleapis.com/maps/api/place/photo"
const NEW_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText"
const NEW_PHOTO_BASE      = "https://places.googleapis.com/v1"

// Fields requested for every restaurant result.
// Only ask for what we render — saves quota bytes and latency.
const RESTAURANT_FIELD_MASK = [
  "places.displayName",
  "places.rating",
  "places.priceLevel",
  "places.formattedAddress",
  "places.location",
  "places.photos",
  "places.editorialSummary",
  "places.types",
  "places.businessStatus",
].join(",")

// ── Budget → Google price levels ──────────────────────────────────────────────
//
// standard → cheap / moderate  (everyday dining)
// premium  → moderate / high   (upscale bistros)
// luxury   → expensive / very  (fine dining)
//
const BUDGET_PRICE_LEVELS: Record<string, string[]> = {
  standard: ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"],
  premium:  ["PRICE_LEVEL_MODERATE",    "PRICE_LEVEL_EXPENSIVE"],
  luxury:   ["PRICE_LEVEL_EXPENSIVE",   "PRICE_LEVEL_VERY_EXPENSIVE"],
}

// Query qualifiers — nudge the text-search ranking toward the right tier
const BUDGET_QUERY_QUALIFIER: Record<string, string> = {
  standard: "popular affordable local",
  premium:  "highly rated upscale",
  luxury:   "fine dining Michelin star luxury",
}

// ── Price-level normalisation (New API enum → internal types) ─────────────────

function newPriceToTier(level: string | undefined): "budget" | "mid-range" | "luxury" {
  switch (level) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":     return "budget"
    case "PRICE_LEVEL_MODERATE":        return "mid-range"
    case "PRICE_LEVEL_EXPENSIVE":
    case "PRICE_LEVEL_VERY_EXPENSIVE":  return "luxury"
    default:                             return "mid-range"
  }
}

function newPriceToDisplay(level: string | undefined): string {
  switch (level) {
    case "PRICE_LEVEL_FREE":            return "Free"
    case "PRICE_LEVEL_INEXPENSIVE":     return "$"
    case "PRICE_LEVEL_MODERATE":        return "$$"
    case "PRICE_LEVEL_EXPENSIVE":       return "$$$"
    case "PRICE_LEVEL_VERY_EXPENSIVE":  return "$$$$"
    default:                             return "$$"
  }
}

// ── Photo URL for Places API (New) ────────────────────────────────────────────
// photo.name = "places/{placeId}/photos/{photoId}"
// The browser follows the 302 → actual CDN URL; safe for <img src=...>
function newPhotoUrl(photoName: string, key: string): string {
  return `${NEW_PHOTO_BASE}/${photoName}/media?maxWidthPx=400&key=${encodeURIComponent(key)}`
}

// ── Raw response types ────────────────────────────────────────────────────────

interface NewPlace {
  name?:             string    // resource name "places/..."
  displayName?:      { text: string; languageCode?: string }
  rating?:           number
  priceLevel?:       string    // PRICE_LEVEL_* enum
  formattedAddress?: string
  location?:         { latitude: number; longitude: number }
  photos?:           Array<{ name: string; widthPx?: number; heightPx?: number }>
  editorialSummary?: { text: string; languageCode?: string }
  types?:            string[]
  businessStatus?:   string    // "OPERATIONAL" | "CLOSED_PERMANENTLY" | ...
}

interface NewSearchResponse {
  places?: NewPlace[]
}

interface RawLegacyPlace {
  name:               string
  rating?:            number
  formatted_address:  string
  geometry:           { location: { lat: number; lng: number } }
  photos?:            Array<{ photo_reference: string }>
  price_level?:       number
  types?:             string[]
}

// ── Normalised output types ───────────────────────────────────────────────────

export interface GooglePlaceHotel {
  name:        string
  rating:      number
  price:       string
  priceLevel:  "budget" | "mid-range" | "luxury"
  address:     string
  description: string
  image:       string
  location:    { lat: number; lng: number }
  amenities:   string[]
}

export interface GooglePlaceRestaurant {
  name:        string
  rating:      number
  cuisine:     string
  price:       string
  priceLevel:  "budget" | "mid-range" | "luxury"
  address:     string
  description: string
  image:       string
  location:    { lat: number; lng: number }
}

// ── Legacy helpers (hotels — unchanged) ──────────────────────────────────────

function legacyPriceLabel(level: number | undefined): string {
  const LABELS = ["Free", "$30–60", "$70–130", "$150–280", "$300+"]
  return LABELS[level ?? 2] ?? "$70–130"
}

function legacyPriceTier(
  level: number | undefined,
  budget: string
): "budget" | "mid-range" | "luxury" {
  if (budget === "budget" || budget === "low")    return "budget"
  if (budget === "luxury" || budget === "high")   return "luxury"
  if (level === undefined)                         return "mid-range"
  if (level <= 1)                                  return "budget"
  if (level >= 3)                                  return "luxury"
  return "mid-range"
}

function legacyPhotoUrl(ref: string, key: string): string {
  return `${LEGACY_PHOTO_BASE}?maxwidth=400&photoreference=${encodeURIComponent(ref)}&key=${key}`
}

async function legacySearchPlaces(query: string, key: string): Promise<RawLegacyPlace[]> {
  try {
    const url = `${LEGACY_TEXT_SEARCH}?query=${encodeURIComponent(query)}&key=${key}`
    const res  = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn("[google-places] Legacy status:", data.status, data.error_message ?? "")
    }
    return Array.isArray(data.results) ? data.results : []
  } catch (err) {
    console.error("[google-places] Legacy fetch error:", err)
    return []
  }
}

// ── New API core fetch ────────────────────────────────────────────────────────

async function newSearchRestaurants(
  textQuery:   string,
  priceLevels: string[],
  key:         string
): Promise<NewPlace[]> {
  try {
    const body = {
      textQuery,
      includedType:   "restaurant",
      maxResultCount: 12,
      priceLevels,
      languageCode:   "en",
    }

    const res = await fetch(NEW_SEARCH_ENDPOINT, {
      method:  "POST",
      headers: {
        "Content-Type":    "application/json",
        "X-Goog-Api-Key":  key,
        "X-Goog-FieldMask": RESTAURANT_FIELD_MASK,
      },
      body:  JSON.stringify(body),
      cache: "no-store",
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "(unreadable)")
      console.error(`[google-places] New API HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const data: NewSearchResponse = await res.json()
    return data.places ?? []
  } catch (err) {
    console.error("[google-places] New API fetch error:", err)
    return []
  }
}

// ── Cuisine extractor from place types ───────────────────────────────────────

function extractCuisine(types?: string[]): string {
  if (!types?.length) return "Local"
  const MAP: Record<string, string> = {
    japanese_restaurant:       "Japanese",
    chinese_restaurant:        "Chinese",
    french_restaurant:         "French",
    italian_restaurant:        "Italian",
    thai_restaurant:           "Thai",
    indian_restaurant:         "Indian",
    mexican_restaurant:        "Mexican",
    american_restaurant:       "American",
    mediterranean_restaurant:  "Mediterranean",
    seafood_restaurant:        "Seafood",
    vegetarian_restaurant:     "Vegetarian",
    korean_restaurant:         "Korean",
    vietnamese_restaurant:     "Vietnamese",
    greek_restaurant:          "Greek",
    spanish_restaurant:        "Spanish",
    turkish_restaurant:        "Turkish",
    middle_eastern_restaurant: "Middle Eastern",
    sushi_restaurant:          "Sushi",
    steak_house:               "Steakhouse",
    fine_dining_restaurant:    "Fine Dining",
    ramen_restaurant:          "Ramen",
    pizza_restaurant:          "Pizza",
  }
  for (const t of types) {
    if (MAP[t]) return MAP[t]
  }
  return "Local"
}

// ── Budget normalisation ──────────────────────────────────────────────────────

function normalizeBudget(budget: string): "standard" | "premium" | "luxury" {
  if (budget === "budget" || budget === "low" || budget === "standard") return "standard"
  if (budget === "luxury") return "luxury"
  return "premium"   // "mid-range", "high", "premium", or anything else
}

// ── Public: fetchGoogleRestaurants (Places API New) ───────────────────────────

/**
 * Fetch real restaurants using the Google Places API (New).
 *
 * Budget controls both the text-search qualifier AND the priceLevels filter,
 * so results are budget-accurate from the ranking level, not just post-filtered.
 *
 * Fallback: if the price-filtered query returns 0 results (e.g. a small city
 * with no luxury options), a second search is issued with no price filter.
 */
export async function fetchGoogleRestaurants(
  city:         string,
  budget:       string,
  cuisineHint?: string,
  country?:     string,
): Promise<GooglePlaceRestaurant[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.warn("[google-places:restaurants] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set — skipping")
    return []
  }

  const tier        = normalizeBudget(budget)
  const priceLevels = BUDGET_PRICE_LEVELS[tier]
  const qualifier   = BUDGET_QUERY_QUALIFIER[tier] ?? ""
  const cuisinePart = cuisineHint ? `${cuisineHint} ` : ""
  const location    = country ? `${city}, ${country}` : city
  const primaryQuery = `${qualifier} ${cuisinePart}restaurants in ${location}`.replace(/\s+/g, " ").trim()

  console.log(
    `[google-places:restaurants] city="${city}" country="${country ?? "—"}" | ` +
    `budget="${budget}" → tier="${tier}" | ` +
    `priceLevels=[${priceLevels.join(", ")}] | ` +
    `query="${primaryQuery}"`
  )

  // ── Primary fetch — price-filtered ───────────────────────────────────────
  let raw = await newSearchRestaurants(primaryQuery, priceLevels, key)

  console.log(
    `[google-places:restaurants] Primary API response: ${raw.length} place(s) | ` +
    `query="${primaryQuery}"`
  )

  // ── Fallback — retry without price filter if primary returned nothing ─────
  if (raw.length === 0) {
    const fallbackQuery = `${cuisinePart}restaurants in ${location}`.replace(/\s+/g, " ").trim()
    console.warn(
      `[google-places:restaurants] 0 results for price-filtered query — ` +
      `retrying without price filter: "${fallbackQuery}"`
    )
    raw = await newSearchRestaurants(fallbackQuery, [], key)
    console.log(
      `[google-places:restaurants] Fallback response: ${raw.length} place(s)`
    )
  }

  // ── Filter out permanently closed places and entries without names ────────
  const filtered = raw.filter(
    p => p.displayName?.text && p.businessStatus !== "CLOSED_PERMANENTLY"
  )

  // ── Sort by rating, keep top 8 ────────────────────────────────────────────
  const sorted = filtered
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8)

  console.log(
    `[google-places:restaurants] Filtered: ${filtered.length} | ` +
    `After sort+slice: ${sorted.length} restaurants returned`
  )

  // ── Map to normalised output ──────────────────────────────────────────────
  return sorted.map(p => ({
    name:        p.displayName?.text ?? "Restaurant",
    rating:      p.rating            ?? 4.0,
    cuisine:     cuisineHint         ?? extractCuisine(p.types),
    price:       newPriceToDisplay(p.priceLevel),
    priceLevel:  newPriceToTier(p.priceLevel),
    address:     p.formattedAddress  ?? "",
    description: p.editorialSummary?.text
      ?? `${p.displayName?.text ?? "Restaurant"} — ${cuisineHint ?? extractCuisine(p.types)} cuisine in ${city}`,
    image:       p.photos?.[0]?.name
      ? newPhotoUrl(p.photos[0].name, key)
      : "",
    location: {
      lat: p.location?.latitude  ?? 0,
      lng: p.location?.longitude ?? 0,
    },
  }))
}

// ── Public: fetchGoogleHotels (legacy Places Text Search — unchanged) ─────────

export async function fetchGoogleHotels(
  city:   string,
  budget: string,
): Promise<GooglePlaceHotel[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return []

  const qualifier =
    budget === "budget" || budget === "low"    ? "budget hostel guesthouse" :
    budget === "luxury" || budget === "high"   ? "5-star luxury hotel"      :
                                                 "hotel"
  const places = await legacySearchPlaces(`${qualifier} in ${city}`, key)

  return places.slice(0, 8).map(p => ({
    name:        p.name,
    rating:      p.rating        ?? 4.0,
    price:       legacyPriceLabel(p.price_level),
    priceLevel:  legacyPriceTier(p.price_level, budget),
    address:     p.formatted_address,
    description: `${p.name} — centrally located in ${city}`,
    image:       p.photos?.[0]
      ? legacyPhotoUrl(p.photos[0].photo_reference, key)
      : "",
    location:    p.geometry.location,
    amenities:   ["WiFi", "Reception", "24h Service"],
  }))
}
