/**
 * Google Places Text Search wrapper — server-side only.
 *
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (available in both client and server).
 * Fetches real hotel and restaurant names, ratings, addresses, and coordinates.
 * Falls back to an empty array so callers can chain to generated fallbacks.
 */

const TEXT_SEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json"
const PHOTO_BASE  = "https://maps.googleapis.com/maps/api/place/photo"

// ─── Raw Places API shape ─────────────────────────────────────────────────────

interface RawPlace {
  name: string
  rating?: number
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
  photos?: Array<{ photo_reference: string }>
  price_level?: number   // 0 = free … 4 = very expensive
  types?: string[]
}

// ─── Normalised output types ──────────────────────────────────────────────────

export interface GooglePlaceHotel {
  name: string
  rating: number
  price: string
  priceLevel: "budget" | "mid-range" | "luxury"
  address: string
  description: string
  image: string
  location: { lat: number; lng: number }
  amenities: string[]
}

export interface GooglePlaceRestaurant {
  name: string
  rating: number
  cuisine: string
  price: string
  priceLevel: "budget" | "mid-range" | "luxury"
  address: string
  description: string
  image: string
  location: { lat: number; lng: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priceLabel(level: number | undefined): string {
  // Return a range string that parseCost() in the itinerary route can use
  const LABELS = ["Free", "$30–60", "$70–130", "$150–280", "$300+"]
  return LABELS[level ?? 2] ?? "$70–130"
}

function priceTier(
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

function photoUrl(ref: string, key: string): string {
  return `${PHOTO_BASE}?maxwidth=400&photoreference=${encodeURIComponent(ref)}&key=${key}`
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function searchPlaces(query: string, key: string): Promise<RawPlace[]> {
  try {
    const url = `${TEXT_SEARCH}?query=${encodeURIComponent(query)}&key=${key}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const text = await res.text()
    const data = JSON.parse(text)
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn("[google-places] API status:", data.status, data.error_message ?? "")
    }
    return Array.isArray(data.results) ? data.results : []
  } catch (err) {
    console.error("[google-places] fetch error:", err)
    return []
  }
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Fetch real hotels in a city using Google Places Text Search.
 * Returns [] when the API key is missing or the request fails.
 */
export async function fetchGoogleHotels(
  city: string,
  budget: string
): Promise<GooglePlaceHotel[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return []

  const qualifier =
    budget === "budget" || budget === "low"    ? "budget hostel guesthouse" :
    budget === "luxury" || budget === "high"   ? "5-star luxury hotel"      :
                                                 "hotel"
  const places = await searchPlaces(`${qualifier} in ${city}`, key)

  return places.slice(0, 8).map((p) => ({
    name:       p.name,
    rating:     p.rating ?? 4.0,
    price:      priceLabel(p.price_level),
    priceLevel: priceTier(p.price_level, budget),
    address:    p.formatted_address,
    description:`${p.name} — centrally located in ${city}`,
    image:      p.photos?.[0] ? photoUrl(p.photos[0].photo_reference, key) : "",
    location:   p.geometry.location,
    amenities:  ["WiFi", "Reception", "24h Service"],
  }))
}

/**
 * Fetch real restaurants in a city using Google Places Text Search.
 * Cuisine is derived from the user's taste preferences (or defaults to "local").
 */
export async function fetchGoogleRestaurants(
  city: string,
  budget: string,
  cuisineHint?: string
): Promise<GooglePlaceRestaurant[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return []

  const query = cuisineHint
    ? `${cuisineHint} restaurant in ${city}`
    : `restaurant in ${city}`

  const places = await searchPlaces(query, key)

  return places.slice(0, 8).map((p) => ({
    name:       p.name,
    rating:     p.rating ?? 4.2,
    cuisine:    cuisineHint ?? "Local",
    price:      priceLabel(p.price_level),
    priceLevel: priceTier(p.price_level, budget),
    address:    p.formatted_address,
    description:`${p.name} — ${cuisineHint ?? "local"} cuisine in ${city}`,
    image:      p.photos?.[0] ? photoUrl(p.photos[0].photo_reference, key) : "",
    location:   p.geometry.location,
  }))
}
