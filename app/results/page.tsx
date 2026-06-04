"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Calendar, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  MapPin, Star, Utensils, Hotel, Activity,
  Mountain, Waves, Landmark, Camera, Globe, Sun,
  BarChart3, Heart, RefreshCw,
} from "lucide-react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Destination {
  name: string
  code?: string
  city?: string
  matchPercentage: number
  reason: string
  image?: string
  tags?: string[]
  climate: string
  vibe: string
  positives?: string[]
  negatives?: string[]
  activities?: string[]
  foodHighlights?: string[]
  hotels?: Array<{ name: string; style: string; activity_level: string }>
  confidenceBreakdown?: { activity: number; climate: number; mood: number; food: number }
}

interface SessionData {
  countries: Destination[]
  summary: string
  userProfile?: {
    dominantMood: string
    preferredClimate: string
    preferredEnvironment: string
    activityLevel: string
    foodPreferences: string[]
  }
  selectedDestinationDetails?: {
    hotels?: Array<{ name: string; priceLevel: string; rating?: number }>
    restaurants?: Array<{ name: string; cuisine?: string; priceLevel: string }>
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function countryCodeToFlag(code: string): string {
  if (!code || code.length < 2) return "🌍"
  try {
    const points = code.toUpperCase().slice(0, 2).split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    return String.fromCodePoint(...points)
  } catch {
    return "🌍"
  }
}

function getClimateInfo(climate: string): { label: string; emoji: string; season: string } {
  const map: Record<string, { label: string; emoji: string; season: string }> = {
    tropical:      { label: "Tropical",       emoji: "🌴", season: "Nov – Apr" },
    mediterranean: { label: "Mediterranean",  emoji: "☀️", season: "Apr – Oct" },
    temperate:     { label: "Temperate",      emoji: "🌤️", season: "May – Sep" },
    cold:          { label: "Alpine",         emoji: "❄️", season: "Jun – Aug" },
    desert:        { label: "Desert",         emoji: "🏜️", season: "Oct – Mar" },
    varied:        { label: "Diverse",        emoji: "🌍", season: "Year-round" },
  }
  return map[climate?.toLowerCase()] ?? { label: "Mixed", emoji: "🌍", season: "Year-round" }
}

function getBudgetLabel(hotels?: Destination["hotels"]): { label: string; emoji: string } {
  const style = hotels?.[0]?.style
  if (style === "budget")  return { label: "Budget-Friendly", emoji: "💵" }
  if (style === "luxury")  return { label: "Luxury",          emoji: "💎" }
  return                          { label: "Mid-Range",        emoji: "💰" }
}

function getActivityIcon(activity: string) {
  const a = activity.toLowerCase()
  if (/beach|surf|ocean|sea|swim|coast|diving|water/.test(a)) return Waves
  if (/hik|trek|mountain|climb|alpine|ski/.test(a)) return Mountain
  if (/cultur|museum|histor|art|temple|cathedral|palace/.test(a)) return Landmark
  if (/food|cuisine|restaurant|dining|market|gastronomy/.test(a)) return Utensils
  if (/photo|scenic|viewpoint|landscape/.test(a)) return Camera
  if (/city|urban|nightlife|shopping|tour/.test(a)) return Globe
  if (/wildlife|safari|nature|park|jungle/.test(a)) return Sun
  return Activity
}

// ── Static attractions database ───────────────────────────────────────────────

const CITY_ATTRACTIONS: Record<string, Array<{ name: string; description: string; emoji: string }>> = {
  Paris:         [{ name: "Eiffel Tower",        description: "The iron lattice symbol of France standing 330m above the city",             emoji: "🗼" }, { name: "Louvre Museum",           description: "World's most visited museum, home to the Mona Lisa and 35,000 artworks",  emoji: "🏛️" }, { name: "Sacré-Cœur & Montmartre", description: "Hilltop basilica in the bohemian artist district with sweeping city views",  emoji: "⛪" }, { name: "Seine River Cruise",       description: "Glide past Notre-Dame and illuminated Parisian monuments at dusk",          emoji: "🚢" }],
  Tokyo:         [{ name: "Senso-ji Temple",      description: "Tokyo's oldest Buddhist temple in historic Asakusa, founded in 645 AD",     emoji: "⛩️" }, { name: "Shibuya Crossing",         description: "The world's busiest pedestrian scramble — a defining Tokyo moment",        emoji: "🚦" }, { name: "Shinjuku Gyoen",           description: "Peaceful national garden blending French, English and Japanese landscapes",  emoji: "🌸" }, { name: "teamLab Planets",          description: "Mind-bending immersive digital art museum unlike anything else on earth",   emoji: "🎨" }],
  Rome:          [{ name: "Colosseum",            description: "Ancient amphitheater that once staged gladiatorial battles for 80,000",       emoji: "🏟️" }, { name: "Vatican & Sistine Chapel", description: "Michelangelo's breathtaking ceiling fresco in the world's smallest state",   emoji: "✝️" }, { name: "Trevi Fountain",           description: "Baroque masterpiece — toss a coin to guarantee your return to Rome",        emoji: "⛲" }, { name: "Borghese Gallery",         description: "Intimate gallery with Bernini sculptures and Caravaggio paintings",          emoji: "🖼️" }],
  Barcelona:     [{ name: "Sagrada Família",      description: "Gaudí's unfinished masterpiece — a basilica unlike any other in the world",  emoji: "🕌" }, { name: "Park Güell",               description: "Mosaic-covered terraces and surreal architecture on a Barcelona hillside",   emoji: "🌈" }, { name: "La Boqueria Market",       description: "Vibrant covered market on La Rambla bursting with tapas and fresh produce",  emoji: "🥘" }, { name: "Gothic Quarter",           description: "Medieval maze of streets hiding Roman ruins, cathedrals and hidden plazas",  emoji: "🏰" }],
  Bali:          [{ name: "Tanah Lot Temple",     description: "Sea temple perched on a rocky offshore islet, especially stunning at sunset",emoji: "🌅" }, { name: "Tegallalang Rice Terraces",description: "Stunning stepped rice paddies carved into the hillside above Ubud",          emoji: "🌾" }, { name: "Uluwatu Kecak Dance",      description: "Clifftop Balinese fire ceremony performed at sunset above the Indian Ocean", emoji: "🔥" }, { name: "Sacred Monkey Forest",     description: "Ancient forest sanctuary with 700 long-tailed macaques and temple ruins",   emoji: "🐒" }],
  Dubai:         [{ name: "Burj Khalifa",         description: "World's tallest building at 828m with an observation deck for infinite views",emoji: "🏙️" }, { name: "Dubai Gold Souk",          description: "Traditional market glittering with gold jewellery in the historic creek area",emoji: "⚓" }, { name: "Desert Safari",            description: "Dune bashing at sunset followed by a Bedouin camp dinner under the stars",   emoji: "🏜️" }, { name: "Palm Jumeirah",            description: "Man-made island archipelago with luxury hotels, clubs and the Atlantis",     emoji: "🌴" }],
  Bangkok:       [{ name: "Grand Palace",         description: "Magnificent royal complex housing the sacred Emerald Buddha since 1782",      emoji: "👑" }, { name: "Floating Markets",         description: "Damnoen Saduak vendors selling food from wooden boats on canal waterways",   emoji: "🛶" }, { name: "Khao San Road",            description: "Legendary backpacker street — street food, bars and cultural crossroads",    emoji: "🎉" }, { name: "Wat Arun",                 description: "Temple of Dawn with mosaic spires on the banks of the Chao Phraya River",   emoji: "⛩️" }],
  Kyoto:         [{ name: "Fushimi Inari Shrine", description: "Thousands of vermillion torii gates winding up a mountain through cedar forest",emoji: "⛩️" }, { name: "Arashiyama Bamboo Grove",  description: "Towering bamboo stalks create an otherworldly rustling green corridor",       emoji: "🎋" }, { name: "Kinkaku-ji",               description: "Gold-leaf covered Zen temple perfectly reflected in the surrounding pond",    emoji: "🏯" }, { name: "Gion District",            description: "Historic geisha district where maiko still walk lantern-lit cobblestone streets",emoji: "🌸" }],
  Amsterdam:     [{ name: "Rijksmuseum",          description: "Dutch national museum housing Rembrandt's Night Watch and Vermeer masterpieces",emoji: "🎨" }, { name: "Anne Frank House",         description: "The secret annex where Anne Frank wrote her diary — a profound historic site",emoji: "📖" }, { name: "Jordaan District",         description: "Charming canal-side neighbourhood with galleries, markets and brown cafes",   emoji: "🌷" }, { name: "Canal Boat Tour",          description: "See Amsterdam from the water — 17th-century gabled houses and 1,500 bridges",emoji: "⚓" }],
  Istanbul:      [{ name: "Hagia Sophia",         description: "Byzantine masterpiece that has been cathedral, mosque and museum across 1,500 years",emoji: "🕌" }, { name: "Grand Bazaar",             description: "One of the world's oldest covered markets with 4,000 shops and vivid colour",emoji: "🛍️" }, { name: "Bosphorus Cruise",         description: "Sail between Europe and Asia watching Ottoman palaces glide by",             emoji: "🚢" }, { name: "Topkapi Palace",           description: "Lavish Ottoman royal palace housing the Imperial Treasury and sacred relics", emoji: "🏛️" }],
  Marrakech:     [{ name: "Jemaa el-Fnaa",        description: "UNESCO square that transforms at night into a festival of music and food",    emoji: "🎭" }, { name: "Majorelle Garden",         description: "Electric blue garden sanctuary once owned by Yves Saint Laurent",            emoji: "🌵" }, { name: "Medina Souks",             description: "Labyrinthine market alleyways selling spices, lanterns and handcrafted goods", emoji: "🧺" }, { name: "Bahia Palace",             description: "19th-century riad palace with ornate mosaic courtyards and stucco ceilings", emoji: "🏯" }],
  Santorini:     [{ name: "Oia Sunset",           description: "World-famous caldera views and blue-domed churches at the most romantic village",emoji: "🌅" }, { name: "Akrotiri Ruins",           description: "Preserved Minoan Bronze Age city buried by the same eruption that shaped the island",emoji: "🏺" }, { name: "Red Beach",                description: "Dramatic rust-red volcanic cliffs framing a unique beach accessible by boat",  emoji: "🏖️" }, { name: "Caldera Hot Springs",      description: "Soak in naturally warm volcanic waters with cliff views in Palea Kameni",     emoji: "♨️" }],
  Lisbon:        [{ name: "Belém Tower",          description: "16th-century limestone fortress on the Tagus — Portugal's Age of Discovery icon",emoji: "🗼" }, { name: "Alfama & Fado Houses",     description: "Ancient Moorish district of steep alleys and melancholic fado music",         emoji: "🎵" }, { name: "Sintra Palaces",           description: "Fairy-tale palaces and Moorish castles in the misty Serra mountains",         emoji: "🏰" }, { name: "Time Out Market",          description: "The world's best food hall bringing Lisbon's top chefs under one roof",        emoji: "🍽️" }],
  Prague:        [{ name: "Prague Castle",        description: "World's largest ancient castle complex dominating the skyline since the 9th century",emoji: "🏰" }, { name: "Charles Bridge",           description: "Baroque-statued 14th-century bridge across the Vltava — magical at sunrise",  emoji: "🌉" }, { name: "Old Town Square",          description: "Gothic and Baroque architecture surrounding the famous Astronomical Clock",     emoji: "⏰" }, { name: "Josefov",                  description: "The beautifully preserved Jewish Quarter with six synagogues and a cemetery",  emoji: "✡️" }],
  Sydney:        [{ name: "Sydney Opera House",   description: "Jørn Utzon's sail-shaped masterpiece on Bennelong Point — Australia's icon",   emoji: "🎭" }, { name: "Bondi to Coogee Walk",     description: "Spectacular 6km clifftop coastal walk past rock pools and ocean sculptures",   emoji: "🏖️" }, { name: "Taronga Zoo",              description: "World-class zoo with harbour views where you can meet native Australian wildlife",emoji: "🦘" }, { name: "Royal Botanic Garden",     description: "26 hectares of lush gardens on the harbour with views of the Opera House",     emoji: "🌿" }],
  Singapore:     [{ name: "Gardens by the Bay",   description: "Futuristic park with 18-storey Supertrees and the world's largest glass greenhouses",emoji: "🌿" }, { name: "Hawker Centres",           description: "UNESCO-recognised street food culture where Michelin dishes cost under $5",     emoji: "🍜" }, { name: "Marina Bay Sands",         description: "The iconic three-tower hotel with an infinity pool 200m above the city",        emoji: "🏙️" }, { name: "Chinatown & Little India", description: "Vibrant cultural enclaves with temples, street markets and Asian flavours",      emoji: "🏮" }],
  London:        [{ name: "British Museum",       description: "Eight million objects spanning two million years of history — free admission",  emoji: "🏛️" }, { name: "Tower of London",          description: "900-year-old royal fortress housing the Crown Jewels and centuries of history",  emoji: "👑" }, { name: "Borough Market",           description: "London's oldest food market under Southwark Bridge — a foodie paradise",        emoji: "🥩" }, { name: "Tate Modern",              description: "World-class contemporary art in a converted Bankside power station",            emoji: "🎨" }],
  Phuket:        [{ name: "Phang Nga Bay",        description: "Dramatic limestone karst islands rising from emerald water — James Bond Island",emoji: "⛵" }, { name: "Big Buddha",               description: "45m white marble Maravija statue visible from across the island",              emoji: "🪷" }, { name: "Old Phuket Town",          description: "Colourful Sino-Portuguese shophouses, street art and local restaurants",        emoji: "🏘️" }, { name: "Phi Phi Islands",          description: "Impossibly turquoise lagoons surrounded by sheer limestone cliffs — paradise",  emoji: "🏝️" }],
  "New York":    [{ name: "Central Park",         description: "843 acres of green escape in Manhattan — the world's most visited urban park",  emoji: "🌳" }, { name: "The High Line",            description: "Elevated park on a 1930s freight rail line with art, gardens and Hudson views",  emoji: "🚂" }, { name: "The Met",                  description: "One of the world's largest museums spanning 5,000 years of human creativity",   emoji: "🎨" }, { name: "Brooklyn Bridge",          description: "Iconic 1883 suspension bridge — walk across for classic Manhattan skyline shots", emoji: "🌉" }],
}

function getAttractions(city: string, activities?: string[]) {
  // Exact match first
  for (const key of Object.keys(CITY_ATTRACTIONS)) {
    if (key.toLowerCase() === city.toLowerCase()) return CITY_ATTRACTIONS[key]
  }
  // Partial match
  for (const [key, attractions] of Object.entries(CITY_ATTRACTIONS)) {
    if (city.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(city.toLowerCase())) {
      return attractions
    }
  }
  // Fallback: derive from activities
  const fallback = (activities ?? []).slice(0, 4).map((a) => ({
    name: a.charAt(0).toUpperCase() + a.slice(1),
    description: `Experience the best of ${city}'s ${a.toLowerCase()} scene`,
    emoji: "📍",
  }))
  return fallback.length > 0
    ? fallback
    : [{ name: `${city} Old Town`, description: `Explore the historic heart of ${city}`, emoji: "🏛️" }]
}

// ── Score bar component ───────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const FALLBACK = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"

export default function ResultsPage() {
  const [data, setData] = useState<SessionData | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [galleryLoading, setGalleryLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const raw = sessionStorage.getItem("analysisResults")
        if (!raw) return

        const parsed: SessionData = JSON.parse(raw)
        if (!parsed.countries?.[0]) return

        setData(parsed)

        // Fetch gallery images through the server-side API route
        const dest = parsed.countries[0]
        const city    = dest.city    || dest.name
        const country = dest.name
        setGalleryLoading(true)
        try {
          const res = await fetch(
            `/api/destination-gallery?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
          )
          if (res.ok) {
            const json = await res.json()
            setGalleryImages(json.images ?? [])
          }
        } catch {}
        setGalleryLoading(false)
      } catch (e) {
        console.error("[results] Error loading:", e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const dest = data?.countries[0]
  const allPhotos = [dest?.image || FALLBACK, ...galleryImages].filter(Boolean)

  const prevPhoto = useCallback(() => setActivePhoto((p) => (p - 1 + allPhotos.length) % allPhotos.length), [allPhotos.length])
  const nextPhoto = useCallback(() => setActivePhoto((p) => (p + 1) % allPhotos.length), [allPhotos.length])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Sparkles className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <p className="text-muted-foreground font-medium">Finding your perfect destination…</p>
        </div>
      </div>
    )
  }

  if (!data || !dest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No results found.</p>
          <Button asChild><Link href="/single">Start Over</Link></Button>
        </div>
      </div>
    )
  }

  // ── Debug ─────────────────────────────────────────────────────────────────
  console.log("DESTINATION", dest)
  console.log("DESTINATION TAGS", dest?.tags)
  console.log("ACTIVITIES", dest?.activities)

  // ── Derived data ───────────────────────────────────────────────────────────
  const city       = dest.city || dest.name
  const flag       = countryCodeToFlag(dest.code || "")
  const climate    = getClimateInfo(dest.climate)
  const budget     = getBudgetLabel(dest.hotels)
  const match      = Math.round(dest.matchPercentage)
  const breakdown  = dest.confidenceBreakdown
  const positives  = dest.positives ?? [dest.reason].filter(Boolean)
  const activities = (dest.activities ?? []).slice(0, 6)
  const attractions = getAttractions(city, dest.activities)
  const squad      = "solo"

  // Hotels & restaurants — prefer selectedDestinationDetails if available
  const sdHotels      = data.selectedDestinationDetails?.hotels ?? []
  const sdRestaurants = data.selectedDestinationDetails?.restaurants ?? []
  const hotels        = sdHotels.length > 0
    ? sdHotels
    : (dest.hotels ?? []).map((h) => ({ name: h.name, priceLevel: h.style as any, rating: undefined }))
  const restaurants = sdRestaurants

  console.log("HOTELS", hotels)
  console.log("RESTAURANTS", restaurants)
  console.log("GALLERY", galleryImages)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: "85vh", minHeight: 560 }}>
        {/* Background image with smooth cross-fade */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activePhoto}
            src={allPhotos[activePhoto] || FALLBACK}
            alt={`${city} photo ${activePhoto + 1}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1,  scale: 1    }}
            exit={  { opacity: 0,  scale: 0.98  }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = FALLBACK }}
          />
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
          <Button asChild variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/15 backdrop-blur-sm border border-white/20 rounded-full">
            <Link href="/single">
              <ChevronLeft className="h-4 w-4 mr-1" /> Start over
            </Link>
          </Button>

          {/* Match badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          >
            <Star className="h-4 w-4 fill-current" />
            {match}% AI Match
          </motion.div>
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI discovered your perfect destination
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <MapPin className="h-6 w-6 text-primary shrink-0" />
              <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-lg">
                {city}
              </h1>
            </div>

            <p className="text-2xl md:text-3xl font-semibold text-white/90 drop-shadow">
              {dest.name} {flag}
            </p>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
              {[
                { icon: climate.emoji, text: climate.label },
                { icon: budget.emoji,  text: budget.label  },
                { icon: "🗓️",          text: climate.season },
                { icon: "✨",           text: dest.vibe     },
              ].map(({ icon, text }) => (
                <span
                  key={text}
                  className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-sm font-medium"
                >
                  {icon} {text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Gallery nav arrows ─── */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* ── Thumbnail strip ─── */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* CTA buttons row */}
          <div className="flex items-center justify-center gap-3 px-6 pb-4">
            <Button
              asChild size="lg"
              className="rounded-full px-7 py-5 text-sm font-semibold shadow-lg"
            >
              <Link href="/itinerary">
                <Calendar className="mr-2 h-4 w-4" />
                Generate Itinerary
              </Link>
            </Button>
            <Button
              asChild variant="outline" size="lg"
              className="rounded-full px-7 py-5 text-sm font-semibold bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              onClick={() => {
                sessionStorage.setItem("selectedCountry", JSON.stringify({
                  index: 0, name: dest.name, city,
                  climate: dest.climate, vibe: dest.vibe,
                  matchPercentage: dest.matchPercentage, image: dest.image ?? null,
                  tags: dest.tags ?? [], timestamp: Date.now(),
                }))
              }}
            >
              <Link href={`/destination/${encodeURIComponent(dest.name)}?squad=${squad}&city=${encodeURIComponent(city)}`}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Full Destination Guide
              </Link>
            </Button>
          </div>

          {/* Photo thumbnails */}
          {allPhotos.length > 1 && (
            <div className="flex gap-2 px-6 pb-5 overflow-x-auto scrollbar-none justify-center">
              {allPhotos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activePhoto
                      ? "border-white scale-105 shadow-lg shadow-white/20"
                      : "border-white/30 opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              {galleryLoading && (
                <div className="flex-shrink-0 h-14 w-20 rounded-lg bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-white animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── WHY THIS DESTINATION ───────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Why {city} matches you</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI reasoning */}
            <div className="space-y-4">
              {data.summary && (
                <div className="rounded-2xl bg-muted/50 border p-6">
                  <p className="text-muted-foreground leading-relaxed text-sm">{data.summary}</p>
                </div>
              )}
              {positives.length > 0 && (
                <div className="space-y-2.5">
                  {positives.slice(0, 5).map((pos, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                      <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm leading-snug">{pos}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Match breakdown */}
            <div className="rounded-2xl bg-card border p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Match breakdown</h3>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
                    <motion.circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - match / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{match}%</span>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                </div>
              </div>

              {breakdown && (
                <div className="space-y-3">
                  <ScoreBar label="Activities"  value={breakdown.activity} color="bg-blue-500"   />
                  <ScoreBar label="Climate"     value={breakdown.climate}  color="bg-amber-500"  />
                  <ScoreBar label="Mood & Vibe" value={breakdown.mood}     color="bg-violet-500" />
                  <ScoreBar label="Food Scene"  value={breakdown.food}     color="bg-rose-500"   />
                </div>
              )}

              {/* User preference tags */}
              {(dest.tags?.length ?? 0) > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Your preferences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(dest.tags ?? []).slice(0, 8).map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── FAMOUS ATTRACTIONS ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Famous Attractions</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {attractions.map((a, i) => {
              const photo = allPhotos[i + 1] || allPhotos[0] || FALLBACK
              return (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl overflow-hidden border bg-card hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={photo}
                      alt={a.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = FALLBACK }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 text-2xl">{a.emoji}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 leading-snug">{a.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{a.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ── RECOMMENDED ACTIVITIES ─────────────────────────────────────── */}
        {activities.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Recommended Activities</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity, i) => {
                const Icon = getActivityIcon(activity)
                return (
                  <motion.div
                    key={activity}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm capitalize leading-snug">{activity}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{city}, {dest.name}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* ── HOTELS & RESTAURANTS ───────────────────────────────────────── */}
        {(hotels.length > 0 || restaurants.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Hotel className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Where to Stay & Eat</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Hotels */}
              {hotels.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    🏨 Hotels
                  </h3>
                  <div className="space-y-3">
                    {hotels.slice(0, 5).map((h, i) => {
                      const pl = (h as any).priceLevel || (h as any).style || "medium"
                      const priceEmoji = pl === "low" || pl === "budget" ? "💵" : pl === "high" || pl === "luxury" ? "💎" : "💰"
                      const priceLabel = pl === "low" || pl === "budget" ? "Budget" : pl === "high" || pl === "luxury" ? "Luxury" : "Mid-Range"
                      const rating = (h as any).rating
                      return (
                        <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Hotel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-snug">{h.name}</p>
                              {rating && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="text-xs text-muted-foreground">{rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                            {priceEmoji} {priceLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Restaurants */}
              {restaurants.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    🍽️ Restaurants
                  </h3>
                  <div className="space-y-3">
                    {restaurants.slice(0, 5).map((r, i) => {
                      const pl = r.priceLevel || "medium"
                      const priceEmoji = pl === "low" ? "💵" : pl === "high" ? "💎" : "💰"
                      return (
                        <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                              <Utensils className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-snug">{r.name}</p>
                              {r.cuisine && <p className="text-xs text-muted-foreground mt-0.5">{r.cuisine}</p>}
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2.5 py-1">
                            {priceEmoji}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* If only hotels, fill restaurants side with food highlights */}
              {restaurants.length === 0 && dest.foodHighlights && dest.foodHighlights.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    🍽️ Local Cuisine
                  </h3>
                  <div className="space-y-3">
                    {dest.foodHighlights.slice(0, 5).map((food, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                        <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <Utensils className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <p className="font-medium text-sm capitalize">{food}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden border-2 border-primary/20 relative"
        >
          {/* Background photo */}
          <div className="absolute inset-0">
            <img
              src={allPhotos[2] || allPhotos[0] || FALLBACK}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = FALLBACK }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/95 dark:to-primary/80" />
          </div>

          <div className="relative z-10 p-10 md:p-14 text-center text-primary-foreground">
            <div className="text-5xl mb-4">{flag}</div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Ready for {city}?
            </h2>
            <p className="text-primary-foreground/80 max-w-md mx-auto mb-8 leading-relaxed">
              Your AI-matched destination awaits. Build a personalised itinerary or explore everything {city} has to offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild size="lg"
                className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-bold shadow-xl"
              >
                <Link href="/itinerary">
                  <Calendar className="mr-2 h-5 w-5" />
                  Generate Day-by-Day Itinerary
                </Link>
              </Button>
              <Button
                asChild size="lg" variant="outline"
                className="border-white/50 text-white hover:bg-white/15 rounded-full px-8 py-6 text-base font-bold"
                onClick={() => {
                  sessionStorage.setItem("selectedCountry", JSON.stringify({
                    index: 0, name: dest.name, city,
                    climate: dest.climate, vibe: dest.vibe,
                    matchPercentage: dest.matchPercentage, image: dest.image ?? null,
                    tags: dest.tags ?? [], timestamp: Date.now(),
                  }))
                }}
              >
                <Link href={`/destination/${encodeURIComponent(dest.name)}?squad=${squad}&city=${encodeURIComponent(city)}`}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Full Destination Guide
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* ── BACK LINK ──────────────────────────────────────────────────── */}
        <div className="text-center pb-4">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/single">← Try a different preference set</Link>
          </Button>
        </div>

      </div>
    </div>
  )
}
