/**
 * HotelBeds Unified API Client
 *
 * Covers three products:
 *   • Hotel Content API  — hotel names, stars, location, facilities
 *   • Activities API     — excursions & experiences at a destination
 *   • Transfers API      — airport ↔ hotel transfer options
 *
 * Authentication: HMAC-SHA256
 *   Headers:  Api-key: {key}
 *             X-Signature: hex(SHA256(key + secret + epoch_seconds))
 *
 * Required env vars (per product):
 *   HOTELBEDS_HOTELS_API_KEY     / HOTELBEDS_HOTELS_SECRET
 *   HOTELBEDS_ACTIVITIES_API_KEY / HOTELBEDS_ACTIVITIES_SECRET
 *   HOTELBEDS_TRANSFERS_API_KEY  / HOTELBEDS_TRANSFERS_SECRET
 *
 * If the secret is absent the function logs a clear warning and returns [].
 * It NEVER returns generated or hardcoded placeholder data.
 */

import crypto from "crypto"

// ─── Base URLs ────────────────────────────────────────────────────────────────
// Using test environment — switch to api.hotelbeds.com once certified

const BASE_HOTELS     = "https://api.test.hotelbeds.com/hotel-content-api/1.0"
const BASE_ACTIVITIES = "https://api.test.hotelbeds.com/activities-api/1.0"
const BASE_TRANSFERS  = "https://api.test.hotelbeds.com/transfer-api/1.0"

// ─── HMAC helper ─────────────────────────────────────────────────────────────

function makeSignature(apiKey: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  return crypto
    .createHash("sha256")
    .update(apiKey + secret + timestamp)
    .digest("hex")
}

function makeHeaders(apiKey: string, secret: string): Record<string, string> {
  return {
    "Api-key":      apiKey,
    "X-Signature":  makeSignature(apiKey, secret),
    "Accept":       "application/json",
    "Content-Type": "application/json",
  }
}

// ─── Destination code mapping ─────────────────────────────────────────────────
// HotelBeds uses its own 3-letter codes distinct from IATA.
// Keys are normalised to lowercase for lookup.

const DEST_CODES: Record<string, string> = {
  // Spain
  "barcelona": "BCN",  "madrid": "MAD",  "seville": "SEV",   "valencia": "VLC",
  "ibiza": "IBI",      "granada": "GRA",  "bilbao": "BIO",    "toledo": "TOL",
  "málaga": "AGP",     "malaga": "AGP",
  // France
  "paris": "PAR",      "nice": "NCE",     "lyon": "LYS",      "marseille": "MRS",
  "bordeaux": "BOD",   "cannes": "CEQ",   "chamonix": "GVA",
  // Italy
  "rome": "ROM",       "venice": "VCE",   "florence": "FLR",  "milan": "MIL",
  "naples": "NAP",     "amalfi": "SAL",   "bologna": "BLQ",
  // Japan
  "tokyo": "TYO",      "kyoto": "UKY",    "osaka": "OSA",     "sapporo": "CTS",
  "hiroshima": "HIJ",  "nara": "UKY",
  // Greece
  "athens": "ATH",     "santorini": "JTR","mykonos": "JMK",   "crete": "HER",
  "rhodes": "RHO",     "corfu": "CFU",    "thessaloniki": "SKG",
  // Turkey
  "istanbul": "IST",   "cappadocia": "KYA","bodrum": "BJV",   "antalya": "AYT",
  "izmir": "ADB",
  // Thailand
  "bangkok": "BKK",    "phuket": "HKT",   "chiang mai": "CNX","koh samui": "USM",
  "krabi": "KBV",      "pai": "CNX",
  // Indonesia
  "bali": "DPS",       "jakarta": "CGK",  "lombok": "LOP",    "ubud": "DPS",
  "seminyak": "DPS",
  // Morocco
  "marrakech": "RAK",  "casablanca": "CMN","fes": "FEZ",      "agadir": "AGA",
  "fez": "FEZ",        "essaouira": "ESU",
  // Portugal
  "lisbon": "LIS",     "porto": "OPO",    "algarve": "FAO",   "sintra": "LIS",
  // UAE
  "dubai": "DXB",      "abu dhabi": "AUH",
  // USA
  "new york": "NYC",   "los angeles": "LAX","miami": "MIA",   "chicago": "CHI",
  "las vegas": "LAS",  "san francisco": "SFO","new orleans": "MSY","honolulu": "HNL",
  // Australia
  "sydney": "SYD",     "melbourne": "MEL","cairns": "CNS",   "brisbane": "BNE",
  "gold coast": "OOL",
  // New Zealand
  "auckland": "AKL",   "queenstown": "ZQN","rotorua": "ROT",
  // India
  "goa": "GOI",        "mumbai": "BOM",   "delhi": "DEL",    "jaipur": "JAI",
  "varanasi": "VNS",   "kerala": "COK",
  // Vietnam
  "hanoi": "HAN",      "ho chi minh city": "SGN","da nang": "DAD","hội an": "DAD",
  "ha long bay": "HAN",
  // Brazil
  "rio de janeiro": "RIO","são paulo": "SAO","salvador": "SSA",
  // Mexico
  "mexico city": "MEX","cancún": "CUN",   "cancun": "CUN",   "tulum": "CUN",
  "oaxaca": "OAX",
  // South Africa
  "cape town": "CPT",  "johannesburg": "JNB","kruger": "MQP",
  // Singapore
  "singapore": "SIN",
  // Switzerland
  "zurich": "ZRH",     "geneva": "GVA",   "interlaken": "BRN","zermatt": "ZRH",
  // Croatia
  "dubrovnik": "DBV",  "split": "SPU",    "hvar": "SPU",     "zagreb": "ZAG",
  // Peru
  "lima": "LIM",       "cusco": "CUZ",    "machu picchu": "CUZ",
}

export function getDestinationCode(cityOrCountry: string): string | null {
  const key = cityOrCountry.toLowerCase().trim()
  return DEST_CODES[key] ?? null
}

// ─── Public interfaces ────────────────────────────────────────────────────────

export interface HotelbedsHotel {
  code:        string
  name:        string
  categoryCode: string          // star rating code e.g. "5EST"
  stars:       number           // derived 1-5
  address:     string
  description: string
  location:    { lat: number; lng: number }
  phone:       string
  web:         string
  image:       string
  amenities:   string[]
}

export interface HotelbedsActivity {
  code:        string
  name:        string
  description: string
  duration:    string
  price:       string
  currency:    string
  image:       string
  category:    string
}

export interface HotelbedsTransfer {
  code:        string
  name:        string
  vehicle:     string
  capacity:    number
  price:       string
  currency:    string
  duration:    string
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

export async function fetchHotelbedsHotels(
  cityOrCountry: string,
  budget: string = "mid-range"
): Promise<HotelbedsHotel[]> {
  const apiKey = process.env.HOTELBEDS_HOTELS_API_KEY
  const secret = process.env.HOTELBEDS_HOTELS_SECRET

  if (!apiKey) {
    console.warn("[HotelBeds Hotels] HOTELBEDS_HOTELS_API_KEY not set — skipping")
    return []
  }
  if (!secret) {
    console.warn("[HotelBeds Hotels] HOTELBEDS_HOTELS_SECRET not set — skipping (key present but HMAC auth incomplete)")
    return []
  }

  const destCode = getDestinationCode(cityOrCountry)
  if (!destCode) {
    console.warn(`[HotelBeds Hotels] No destination code for "${cityOrCountry}" — skipping`)
    return []
  }

  const categoryFilter = budget === "budget" || budget === "low"
    ? "1EST,2EST"
    : budget === "luxury" || budget === "high"
    ? "4EST,5EST"
    : "3EST,4EST"

  const url = [
    `${BASE_HOTELS}/hotels`,
    `?destinationCode=${destCode}`,
    `&fields=name,categoryCode,coordinates,address,phones,web,images,facilities,description`,
    `&language=ENG`,
    `&from=1&to=20`,
    `&categoryCodes=${categoryFilter}`,
    `&useSecondaryLanguage=false`,
  ].join("")

  console.log(`[HotelBeds Hotels] dest=${destCode} budget=${budget} categoryFilter=${categoryFilter}`)
  console.log("HotelBeds URL:", url)

  try {
    const res = await fetch(url, {
      headers: makeHeaders(apiKey, secret),
      cache:   "no-store",
    })

    console.log("HotelBeds Status:", res.status)
    console.log(`[HotelBeds Hotels] Response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[HotelBeds Hotels] HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch {
      console.error("[HotelBeds Hotels] Non-JSON response")
      return []
    }

    const raw: any[] = data?.hotels ?? []
    console.log(`[HotelBeds Hotels] hotels count: ${raw.length}`)
    console.log(`[HotelBeds Hotels] first hotel: ${raw[0]?.name?.content ?? raw[0]?.name ?? "(none)"}`)

    return raw.slice(0, 8).map((h: any) => {
      const stars = parseStars(h.categoryCode)
      return {
        code:         String(h.code ?? ""),
        name:         String(h.name?.content ?? h.name ?? ""),
        categoryCode: String(h.categoryCode ?? ""),
        stars,
        address:      formatAddress(h.address),
        description:  String(h.description?.content ?? h.description ?? ""),
        location: {
          lat: parseFloat(h.coordinates?.latitude  ?? 0),
          lng: parseFloat(h.coordinates?.longitude ?? 0),
        },
        phone:      h.phones?.[0]?.phoneNumber ?? "",
        web:        h.web ?? "",
        image:      h.images?.[0]?.path
          ? `http://photos.hotelbeds.com/giata/bigger/${h.images[0].path}`
          : "",
        amenities:  extractAmenities(h.facilities ?? []),
      }
    })
  } catch (err) {
    console.error("[HotelBeds Hotels] Fetch error:", err)
    return []
  }
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function fetchHotelbedsActivities(
  cityOrCountry: string,
  fromDate?: string,
  toDate?: string
): Promise<HotelbedsActivity[]> {
  const apiKey = process.env.HOTELBEDS_ACTIVITIES_API_KEY
  const secret = process.env.HOTELBEDS_ACTIVITIES_SECRET

  if (!apiKey) {
    console.warn("[HotelBeds Activities] HOTELBEDS_ACTIVITIES_API_KEY not set — skipping")
    return []
  }
  if (!secret) {
    console.warn("[HotelBeds Activities] HOTELBEDS_ACTIVITIES_SECRET not set — skipping (key present but HMAC auth incomplete)")
    return []
  }

  const destCode = getDestinationCode(cityOrCountry)
  if (!destCode) {
    console.warn(`[HotelBeds Activities] No destination code for "${cityOrCountry}" — skipping`)
    return []
  }

  // Default to a 14-day window from today when no dates provided
  const today    = new Date()
  const from     = fromDate ?? today.toISOString().split("T")[0]
  const twoWeeks = new Date(today.getTime() + 14 * 86400000)
  const to       = toDate ?? twoWeeks.toISOString().split("T")[0]

  // Activities API v3 — POST with JSON body (NOT the old GET query-string format)
  // Correct path: activity-api/3.0  (not activities-api/1.0)
  const url = "https://api.test.hotelbeds.com/activity-api/3.0/activities"

  const requestBody = {
    filters: [{ searchFilterItems: [{ type: "destination", value: destCode }] }],
    from,
    to,
    language: "en",
    pagination: { itemsPerPage: 20, page: 1 },
    order: "DEFAULT",
  }

  console.log(`[HotelBeds Activities] dest=${destCode} from=${from} to=${to}`)
  console.log("HotelBeds URL:", url)
  console.log("[HotelBeds Activities] body:", JSON.stringify(requestBody))

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: makeHeaders(apiKey, secret),
      body:    JSON.stringify(requestBody),
      cache:   "no-store",
    })

    console.log("HotelBeds Status:", res.status)
    console.log(`[HotelBeds Activities] Response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[HotelBeds Activities] HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch {
      console.error("[HotelBeds Activities] Non-JSON response")
      return []
    }

    // v3 API response: { activities: [...] }  or  { activitiesContent: [...] }
    const raw: any[] = data?.activities ?? data?.activitiesContent ?? []
    console.log(`[HotelBeds Activities] activities count: ${raw.length}`)
    console.log(`[HotelBeds Activities] first activity: ${raw[0]?.name ?? "(none)"}`)
    if (raw.length === 0) {
      console.warn("[HotelBeds Activities] Zero results — response keys:", Object.keys(data ?? {}))
    }

    return raw.slice(0, 10).map((a: any) => {
      // v3 modalities live under a.modalities[] or a.amountsFrom[]
      const modality  = a.modalities?.[0]
      const priceFrom = a.amountsFrom?.[0]
      const price     = modality?.prices?.[0] ?? priceFrom
      return {
        code:        String(a.serviceCode ?? a.code ?? ""),
        name:        String(a.name ?? ""),
        description: String(
          a.description?.substring(0, 300) ??
          a.content?.description?.substring(0, 300) ??
          ""
        ),
        duration:    formatDuration(modality?.duration ?? a.operationDays),
        price:       price
          ? `${price.amount ?? price.totalAmount ?? ""} ${price.currency ?? price.currencyIsoCode ?? ""}`.trim()
          : "",
        currency:    String(price?.currency ?? price?.currencyIsoCode ?? ""),
        image:       a.images?.[0]?.url ?? a.coverImage ?? "",
        category:    a.activityFactsheetType ?? a.categories?.[0]?.name ?? "Activity",
      }
    })
  } catch (err) {
    console.error("[HotelBeds Activities] Fetch error:", err)
    return []
  }
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export async function fetchHotelbedsTransfers(
  originAirportIATA: string,
  destinationCode:   string,
  date:              string,
  adults:            number = 2
): Promise<HotelbedsTransfer[]> {
  const apiKey = process.env.HOTELBEDS_TRANSFERS_API_KEY
  const secret = process.env.HOTELBEDS_TRANSFERS_SECRET

  if (!apiKey) {
    console.warn("[HotelBeds Transfers] HOTELBEDS_TRANSFERS_API_KEY not set — skipping")
    return []
  }
  if (!secret) {
    console.warn("[HotelBeds Transfers] HOTELBEDS_TRANSFERS_SECRET not set — skipping (key present but HMAC auth incomplete)")
    return []
  }

  // Transfers Booking API uses GET with path parameters (not POST with body).
  // Format: /availability/{lang}/from/{fromType}/{fromCode}/to/{toType}/{toCode}/{datetime}/{adults}/{children}/{infants}
  // NOTE: If this returns 403 "Access to this API has been disallowed", the Transfers
  // product is not activated on the account. Contact HotelBeds support to enable it.
  const outboundDateTime = `${date}T12:00:00`
  const url = [
    `${BASE_TRANSFERS}/availability`,
    `/en`,
    `/from/IATA/${originAirportIATA}`,
    `/to/ATLAS/${destinationCode}`,
    `/${outboundDateTime}`,
    `/${adults}/0/0`,
  ].join("")

  console.log(`[HotelBeds Transfers] origin=${originAirportIATA} dest=${destinationCode} date=${date}`)
  console.log("HotelBeds URL:", url)

  try {
    const res = await fetch(url, {
      method:  "GET",
      headers: makeHeaders(apiKey, secret),
      cache:   "no-store",
    })

    console.log("HotelBeds Status:", res.status)
    console.log(`[HotelBeds Transfers] Response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[HotelBeds Transfers] HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch {
      console.error("[HotelBeds Transfers] Non-JSON response")
      return []
    }

    // v1 response shape: { transfers: [...] } — each has id, category, vehicle, price
    const raw: any[] = data?.transfers ?? data?.services ?? []
    console.log(`[HotelBeds Transfers] transfers count: ${raw.length}`)
    console.log(`[HotelBeds Transfers] first transfer: ${raw[0]?.category?.name ?? raw[0]?.vehicle?.code ?? "(none)"}`)
    if (raw.length === 0) {
      console.warn("[HotelBeds Transfers] Zero results — response keys:", Object.keys(data ?? {}))
    }

    return raw.slice(0, 5).map((t: any) => ({
      code:     String(t.id ?? t.code ?? ""),
      name:     String(t.category?.name ?? t.name ?? "Transfer"),
      vehicle:  String(t.vehicle?.code ?? t.vehicleType ?? ""),
      capacity: parseInt(String(t.vehicle?.capacity ?? t.maxPax ?? "4"), 10),
      price:    t.price
        ? `${t.price.net ?? t.price.total ?? ""} ${t.price.currency ?? t.price.currencyId ?? ""}`.trim()
        : "",
      currency: String(t.price?.currency ?? t.price?.currencyId ?? ""),
      duration: formatDuration(t.transferTime ?? t.duration),
    }))
  } catch (err) {
    console.error("[HotelBeds Transfers] Fetch error:", err)
    return []
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseStars(categoryCode: string): number {
  const m = (categoryCode ?? "").match(/^(\d)/)
  return m ? parseInt(m[1], 10) : 3
}

function formatAddress(address: any): string {
  if (typeof address === "string") return address
  if (!address) return ""
  const parts = [address.content, address.street, address.city].filter(Boolean)
  return parts.join(", ")
}

function formatDuration(raw: any): string {
  if (!raw) return ""
  if (typeof raw === "string") return raw
  // HotelBeds duration is sometimes an object { hours, minutes }
  if (typeof raw === "object") {
    const h = raw.hours ?? 0
    const m = raw.minutes ?? 0
    if (h && m) return `${h}h ${m}m`
    if (h)      return `${h}h`
    if (m)      return `${m}m`
  }
  return String(raw)
}

function extractAmenities(facilities: any[]): string[] {
  return facilities
    .slice(0, 6)
    .map((f: any) => f.facilityName?.content ?? f.name ?? "")
    .filter(Boolean)
}

// ─── IATA airport lookup (used by Transfers) ──────────────────────────────────
// Maps HotelBeds destination codes to their nearest major airport IATA code.

export const DEST_TO_AIRPORT: Record<string, string> = {
  BCN: "BCN", MAD: "MAD", NCE: "NCE", LYS: "LYS", MRS: "MRS", BOD: "BOD",
  PAR: "CDG", ROM: "FCO", VCE: "VCE", FLR: "FLR", MIL: "MXP", NAP: "NAP",
  TYO: "NRT", UKY: "ITM", OSA: "KIX", CTS: "CTS",
  ATH: "ATH", JTR: "JTR", JMK: "JMK", HER: "HER", RHO: "RHO",
  IST: "IST", AYT: "AYT", BJV: "BJV",
  BKK: "BKK", HKT: "HKT", CNX: "CNX", USM: "USM",
  DPS: "DPS", CGK: "CGK",
  RAK: "RAK", CMN: "CMN", FEZ: "FEZ",
  LIS: "LIS", OPO: "OPO",
  DXB: "DXB", AUH: "AUH",
  NYC: "JFK", LAX: "LAX", MIA: "MIA", CHI: "ORD", LAS: "LAS", SFO: "SFO",
  SYD: "SYD", MEL: "MEL", CNS: "CNS",
  AKL: "AKL", ZQN: "ZQN",
  BOM: "BOM", DEL: "DEL", GOI: "GOI",
  HAN: "HAN", SGN: "SGN",
  RIO: "GIG", SAO: "GRU",
  MEX: "MEX", CUN: "CUN",
  CPT: "CPT", JNB: "JNB",
  SIN: "SIN",
  ZRH: "ZRH", GVA: "GVA",
  DBV: "DBV", SPU: "SPU",
  LIM: "LIM", CUZ: "CUZ",
}
