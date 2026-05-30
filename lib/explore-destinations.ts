/**
 * Explore Destination Profiles & Scoring Engine
 *
 * Each destination is described by numeric preference scores (0–100) that mirror
 * the dimensions produced by the Gemini travel-psychology analysis, plus rich
 * qualitative identity arrays that enable fuzzy signal matching.
 *
 * Scoring formula per destination:
 *   1. Numeric dimension similarity     — how closely each user level matches the dest score
 *   2. Travel-style overlap bonus       — how many of the user's style signals the dest satisfies
 *   3. Activity overlap bonus           — same for detected activities
 *   4. Climate overlap bonus            — same for climate preferences
 *   5. Budget compatibility multiplier  — rewards finding affordable/luxury matches
 *   6. Family-friendly bonus            — if user profile signals family travel
 *   7. Region affinity bonus            — if Gemini-detected regions align with destination
 *   8. Architecture identity match      — fuzzy match between detected arch style and dest identity
 *   9. Atmosphere match                 — fuzzy match between detected atmosphere and dest tags
 *  10. Emotional vibe match             — fuzzy match between traveler emotional state and dest profile
 *  11. Cultural context match           — fuzzy match between detected cultural context and dest identity
 *  12. Negative penalty                 — penalises strong profile-destination incompatibility
 */

import type { MergedTravelProfile } from "./travel-profile-merger"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CityHint {
  name: string
  tagline: string
  bestFor: string[]
  budgetFit: "budget" | "mid-range" | "luxury" | "all"
}

export interface ExploreDestination {
  id: string
  name: string
  flag: string
  heroImage: string
  region: string          // broad geographic region
  scores: {
    luxury: number       // 0-100: how luxury/upscale the destination is
    nature: number       // 0-100: natural landscapes, wildlife, outdoors
    city: number         // 0-100: urban energy, metropolis vibe
    relaxation: number   // 0-100: beach chill, slow pace, ease
    adventure: number    // 0-100: trekking, extremes, raw exploration
    social: number       // 0-100: meeting people, group energy
    nightlife: number    // 0-100: bars, clubs, late-night scenes
    cultural: number     // 0-100: history, art, architecture, traditions
    food: number         // 0-100: cuisine quality and diversity
    beach: number        // 0-100: coastal and beach quality
    budget: number       // 0-100: higher = more budget-friendly
    family: number       // 0-100: suitability for families with children
    romance: number      // 0-100: couples / romantic getaway quality
    wellness: number     // 0-100: spas, yoga, mindfulness, healing
  }
  climates: string[]           // matches climatePreference values from Gemini
  travelStyles: string[]       // matches travelStyles values from Gemini
  activities: string[]         // matches activities values from Gemini
  cities: CityHint[]           // top cities inside this destination
  atmosphereTags: string[]     // visual/sensory atmosphere: ["ancient", "sun-drenched", ...]
  architectureIdentity: string[] // architectural vocabulary: ["islamic", "moorish", ...]
  culturalIdentity: string[]   // cultural aesthetic identity: ["north-african", "arab", ...]
  emotionalProfile: string[]   // emotional states this destination evokes: ["inspired", ...]
}

export interface RankedDestination {
  id: string
  name: string
  flag: string
  heroImage: string
  score: number
  cities: CityHint[]
}

// ── Destination data ──────────────────────────────────────────────────────────

export const EXPLORE_DESTINATIONS: Record<string, ExploreDestination> = {
  japan: {
    id: "japan",
    name: "Japan",
    flag: "🇯🇵",
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",
    region: "East Asia",
    scores: {
      luxury: 72, nature: 68, city: 88, relaxation: 58, adventure: 63,
      social: 62, nightlife: 65, cultural: 96, food: 93, beach: 22,
      budget: 40, family: 78, romance: 72, wellness: 78,
    },
    climates: ["temperate", "cold"],
    travelStyles: ["urban", "cultural", "spiritual", "wellness", "adventure", "food"],
    activities: ["food", "history", "museums", "photography", "cycling", "hiking", "shopping"],
    cities: [
      { name: "Tokyo",     tagline: "Electric neon megacity",       bestFor: ["city exploration", "food", "nightlife"], budgetFit: "all" },
      { name: "Kyoto",     tagline: "Ancient temples and gardens",   bestFor: ["temples", "culture", "history"],          budgetFit: "mid-range" },
      { name: "Osaka",     tagline: "Street food capital",           bestFor: ["street food", "nightlife", "shopping"],   budgetFit: "budget" },
      { name: "Nara",      tagline: "Deer parks and pagodas",        bestFor: ["nature", "culture", "day trips"],          budgetFit: "budget" },
      { name: "Hiroshima", tagline: "History and resilience",        bestFor: ["history", "culture", "peace"],             budgetFit: "budget" },
    ],
    atmosphereTags: ["serene", "precise", "neon-lit", "zen", "ancient", "futuristic", "minimalist"],
    architectureIdentity: ["japanese", "zen", "shinto", "pagoda", "east-asian", "modernist", "minimalist", "wooden-temple"],
    culturalIdentity: ["east-asian", "japanese", "shinto", "buddhist", "far-eastern"],
    emotionalProfile: ["awestruck", "serene", "curious", "inspired", "contemplative"],
  },

  france: {
    id: "france",
    name: "France",
    flag: "🇫🇷",
    heroImage: "https://images.unsplash.com/photo-1431274172761-fcdab704f2e0?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 88, nature: 55, city: 83, relaxation: 72, adventure: 38,
      social: 78, nightlife: 78, cultural: 92, food: 96, beach: 52,
      budget: 32, family: 72, romance: 96, wellness: 65,
    },
    climates: ["temperate", "mediterranean", "warm"],
    travelStyles: ["luxury", "romantic", "cultural", "urban", "food", "relaxed"],
    activities: ["food", "history", "shopping", "museums", "photography", "cycling", "wellness", "cooking"],
    cities: [
      { name: "Paris",     tagline: "City of light and romance",     bestFor: ["romance", "art", "food"],             budgetFit: "mid-range" },
      { name: "Nice",      tagline: "French Riviera glamour",        bestFor: ["beach", "food", "relaxation"],        budgetFit: "mid-range" },
      { name: "Lyon",      tagline: "Culinary capital of France",    bestFor: ["food", "culture", "history"],         budgetFit: "mid-range" },
      { name: "Bordeaux",  tagline: "Wine country paradise",         bestFor: ["wine", "gastronomy", "relaxation"],   budgetFit: "luxury" },
      { name: "Marseille", tagline: "Raw Mediterranean port city",   bestFor: ["beach", "food", "culture"],           budgetFit: "budget" },
    ],
    atmosphereTags: ["romantic", "elegant", "warm", "artistic", "grand", "cosmopolitan", "sun-drenched"],
    architectureIdentity: ["haussmann", "gothic", "baroque", "classical", "european", "renaissance", "french-classical"],
    culturalIdentity: ["western-european", "latin", "french", "mediterranean"],
    emotionalProfile: ["romantic", "inspired", "refined", "enchanted", "sophisticated"],
  },

  thailand: {
    id: "thailand",
    name: "Thailand",
    flag: "🇹🇭",
    heroImage: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 55, nature: 73, city: 65, relaxation: 78, adventure: 75,
      social: 82, nightlife: 88, cultural: 77, food: 90, beach: 88,
      budget: 82, family: 68, romance: 72, wellness: 80,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["adventure", "social", "budget", "coastal", "wellness", "cultural", "backpacker"],
    activities: ["beach", "diving", "food", "nightlife", "wellness", "water-sports", "hiking", "festivals"],
    cities: [
      { name: "Bangkok",    tagline: "Vibrant temple-meets-neon capital", bestFor: ["temples", "street food", "nightlife"], budgetFit: "budget" },
      { name: "Chiang Mai", tagline: "Cultural mountain north",            bestFor: ["temples", "trekking", "wellness"],    budgetFit: "budget" },
      { name: "Phuket",     tagline: "Beach and diving paradise",          bestFor: ["beach", "diving", "nightlife"],       budgetFit: "mid-range" },
      { name: "Koh Samui",  tagline: "Island relaxation and luxury",       bestFor: ["beach", "wellness", "relaxation"],    budgetFit: "mid-range" },
      { name: "Pai",        tagline: "Hippie valley in the hills",          bestFor: ["nature", "relaxation", "culture"],   budgetFit: "budget" },
    ],
    atmosphereTags: ["tropical", "vibrant", "lush", "warm", "spiritual", "colorful", "buzzing"],
    architectureIdentity: ["thai", "buddhist-temple", "south-east-asian", "ornate", "tropical", "traditional"],
    culturalIdentity: ["south-east-asian", "thai", "buddhist", "tropical-asian"],
    emotionalProfile: ["energized", "free", "adventurous", "blissful", "curious"],
  },

  italy: {
    id: "italy",
    name: "Italy",
    flag: "🇮🇹",
    heroImage: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=1600&q=80",
    region: "Southern Europe",
    scores: {
      luxury: 78, nature: 62, city: 82, relaxation: 68, adventure: 45,
      social: 83, nightlife: 72, cultural: 95, food: 98, beach: 57,
      budget: 43, family: 82, romance: 92, wellness: 63,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["cultural", "food", "romantic", "luxury", "family", "urban", "relaxed"],
    activities: ["food", "history", "museums", "shopping", "photography", "beach", "cycling", "cooking"],
    cities: [
      { name: "Rome",      tagline: "Eternal city of ancient wonders", bestFor: ["history", "food", "culture"],         budgetFit: "mid-range" },
      { name: "Florence",  tagline: "Renaissance art and architecture", bestFor: ["art", "history", "food"],             budgetFit: "mid-range" },
      { name: "Venice",    tagline: "Floating city of canals",          bestFor: ["romance", "culture", "photography"],  budgetFit: "luxury" },
      { name: "Milan",     tagline: "Fashion and design capital",        bestFor: ["shopping", "food", "nightlife"],      budgetFit: "luxury" },
      { name: "Amalfi",    tagline: "Cliffside coastal paradise",        bestFor: ["beach", "scenery", "relaxation"],     budgetFit: "luxury" },
    ],
    atmosphereTags: ["romantic", "grand", "sun-drenched", "ancient", "artistic", "warm", "monumental"],
    architectureIdentity: ["roman", "renaissance", "baroque", "classical", "mediterranean", "gothic", "neoclassical", "italian"],
    culturalIdentity: ["western-european", "latin", "mediterranean", "italian", "southern-european"],
    emotionalProfile: ["inspired", "romantic", "awestruck", "enchanted", "nostalgic"],
  },

  morocco: {
    id: "morocco",
    name: "Morocco",
    flag: "🇲🇦",
    heroImage: "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=1600&q=80",
    region: "North Africa",
    scores: {
      luxury: 52, nature: 68, city: 62, relaxation: 53, adventure: 82,
      social: 67, nightlife: 38, cultural: 92, food: 82, beach: 42,
      budget: 73, family: 62, romance: 67, wellness: 68,
    },
    climates: ["desert", "warm", "mediterranean"],
    travelStyles: ["cultural", "adventure", "spiritual", "budget", "backpacker", "road-trip"],
    activities: ["history", "hiking", "shopping", "food", "photography", "festivals", "wellness"],
    cities: [
      { name: "Marrakech",    tagline: "Imperial souk city",           bestFor: ["culture", "food", "souks"],         budgetFit: "budget" },
      { name: "Fez",          tagline: "Ancient medina maze",          bestFor: ["history", "culture", "crafts"],     budgetFit: "budget" },
      { name: "Chefchaouen",  tagline: "The blue pearl of the Rif",    bestFor: ["photography", "culture", "hiking"], budgetFit: "budget" },
      { name: "Essaouira",    tagline: "Breezy Atlantic coastal town", bestFor: ["beach", "relaxation", "culture"],   budgetFit: "budget" },
      { name: "Merzouga",     tagline: "Sahara desert gateway",        bestFor: ["adventure", "nature", "camping"],   budgetFit: "mid-range" },
    ],
    atmosphereTags: ["ancient", "warm", "mystical", "sun-drenched", "earthy", "vibrant", "desert"],
    architectureIdentity: ["islamic", "moorish", "arabic", "arab-inspired", "medina", "islamic-inspired", "north-african", "riad"],
    culturalIdentity: ["north-african", "arab", "berber", "islamic", "maghrebi", "arabic"],
    emotionalProfile: ["inspired", "awestruck", "curious", "adventurous", "transported"],
  },

  bali: {
    id: "bali",
    name: "Bali",
    flag: "🇮🇩",
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 67, nature: 87, city: 38, relaxation: 92, adventure: 73,
      social: 67, nightlife: 62, cultural: 80, food: 77, beach: 90,
      budget: 67, family: 57, romance: 88, wellness: 94,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["wellness", "nature", "spiritual", "romantic", "coastal", "adventure", "relaxed"],
    activities: ["beach", "wellness", "hiking", "diving", "water-sports", "photography", "festivals", "yoga"],
    cities: [
      { name: "Ubud",      tagline: "Art, rice terraces, and wellness", bestFor: ["wellness", "culture", "nature"],  budgetFit: "mid-range" },
      { name: "Seminyak",  tagline: "Beach clubs and sunset dining",    bestFor: ["beach", "nightlife", "dining"],   budgetFit: "mid-range" },
      { name: "Canggu",    tagline: "Surf and digital nomad hub",       bestFor: ["surfing", "beach", "social"],     budgetFit: "budget" },
      { name: "Nusa Dua",  tagline: "Luxury peninsula resorts",         bestFor: ["beach", "luxury", "relaxation"],  budgetFit: "luxury" },
      { name: "Uluwatu",   tagline: "Cliff temples and surf breaks",    bestFor: ["surfing", "culture", "views"],    budgetFit: "mid-range" },
    ],
    atmosphereTags: ["lush", "spiritual", "tropical", "serene", "mystical", "verdant", "sacred"],
    architectureIdentity: ["balinese", "hindu-temple", "south-east-asian", "tropical", "traditional", "carved-stone", "ornate"],
    culturalIdentity: ["south-east-asian", "balinese", "hindu", "indonesian", "tropical-asian"],
    emotionalProfile: ["serene", "blissful", "spiritual", "rejuvenated", "inspired"],
  },

  greece: {
    id: "greece",
    name: "Greece",
    flag: "🇬🇷",
    heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80",
    region: "Mediterranean",
    scores: {
      luxury: 68, nature: 65, city: 72, relaxation: 85, adventure: 52,
      social: 75, nightlife: 72, cultural: 90, food: 85, beach: 93,
      budget: 55, family: 72, romance: 90, wellness: 68,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["romantic", "cultural", "coastal", "relaxed", "urban", "adventure"],
    activities: ["beach", "history", "museums", "photography", "diving", "water-sports", "food", "sailing"],
    cities: [
      { name: "Santorini",    tagline: "Volcanic caldera romance",       bestFor: ["romance", "views", "relaxation"],    budgetFit: "luxury" },
      { name: "Athens",       tagline: "Cradle of civilisation",         bestFor: ["history", "culture", "food"],        budgetFit: "mid-range" },
      { name: "Mykonos",      tagline: "Cosmopolitan party island",      bestFor: ["nightlife", "beach", "socialising"], budgetFit: "luxury" },
      { name: "Rhodes",       tagline: "Medieval walled city and beach", bestFor: ["history", "beach", "culture"],       budgetFit: "mid-range" },
      { name: "Thessaloniki", tagline: "Northern food and culture gem",  bestFor: ["food", "culture", "nightlife"],      budgetFit: "budget" },
    ],
    atmosphereTags: ["sun-drenched", "whitewashed", "ancient", "coastal", "romantic", "breezy", "blue"],
    architectureIdentity: ["greek", "classical", "neoclassical", "cycladic", "whitewashed", "ancient-greek", "hellenic", "mediterranean"],
    culturalIdentity: ["mediterranean", "greek", "southern-european", "aegean", "hellenic"],
    emotionalProfile: ["romantic", "serene", "awestruck", "blissful", "inspired"],
  },

  spain: {
    id: "spain",
    name: "Spain",
    flag: "🇪🇸",
    heroImage: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&q=80",
    region: "Western Europe",
    scores: {
      luxury: 72, nature: 60, city: 88, relaxation: 70, adventure: 58,
      social: 90, nightlife: 95, cultural: 88, food: 93, beach: 80,
      budget: 55, family: 75, romance: 78, wellness: 60,
    },
    climates: ["mediterranean", "warm", "temperate"],
    travelStyles: ["urban", "cultural", "food", "social", "relaxed", "coastal"],
    activities: ["food", "nightlife", "history", "museums", "beach", "festivals", "shopping", "photography"],
    cities: [
      { name: "Barcelona",      tagline: "Gaudí, beach, and nightlife",    bestFor: ["architecture", "beach", "nightlife"],  budgetFit: "mid-range" },
      { name: "Madrid",         tagline: "Art museums and vibrant plazas", bestFor: ["art", "food", "nightlife"],            budgetFit: "mid-range" },
      { name: "Seville",        tagline: "Flamenco soul of Andalusia",     bestFor: ["culture", "food", "nightlife"],        budgetFit: "mid-range" },
      { name: "Ibiza",          tagline: "World-class party island",       bestFor: ["nightlife", "beach", "music"],         budgetFit: "luxury" },
      { name: "San Sebastián",  tagline: "Pintxos and beach perfection",   bestFor: ["food", "beach", "culture"],            budgetFit: "luxury" },
    ],
    atmosphereTags: ["vibrant", "sun-drenched", "warm", "festive", "social", "colorful", "energetic"],
    architectureIdentity: ["art-nouveau", "modernisme", "gaudi", "moorish", "baroque", "mediterranean", "spanish", "mudejar"],
    culturalIdentity: ["western-european", "mediterranean", "latin", "iberian", "southern-european", "spanish"],
    emotionalProfile: ["energized", "free", "joyful", "inspired", "social"],
  },

  dubai: {
    id: "dubai",
    name: "Dubai",
    flag: "🇦🇪",
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",
    region: "Middle East",
    scores: {
      luxury: 97, nature: 35, city: 95, relaxation: 68, adventure: 62,
      social: 72, nightlife: 68, cultural: 58, food: 82, beach: 72,
      budget: 15, family: 78, romance: 72, wellness: 80,
    },
    climates: ["desert", "warm"],
    travelStyles: ["luxury", "urban", "shopping", "adventure", "wellness"],
    activities: ["shopping", "diving", "water-sports", "wellness", "nightlife", "photography", "food"],
    cities: [
      { name: "Downtown Dubai",  tagline: "Burj Khalifa and the Dubai Mall", bestFor: ["luxury", "shopping", "dining"],   budgetFit: "luxury" },
      { name: "Dubai Marina",    tagline: "Waterfront yacht playground",     bestFor: ["beach", "nightlife", "sports"],   budgetFit: "luxury" },
      { name: "Deira",           tagline: "Old Dubai soul and gold souks",   bestFor: ["culture", "shopping", "food"],    budgetFit: "mid-range" },
      { name: "Jumeirah",        tagline: "Beachfront luxury strip",         bestFor: ["beach", "wellness", "dining"],    budgetFit: "luxury" },
      { name: "Abu Dhabi",       tagline: "Capital grandeur and heritage",   bestFor: ["culture", "luxury", "beaches"],   budgetFit: "luxury" },
    ],
    atmosphereTags: ["futuristic", "grand", "gleaming", "desert", "opulent", "monumental", "urban"],
    architectureIdentity: ["modernist", "futurist", "islamic-inspired", "arabic", "skyscraper", "middle-eastern", "arab-inspired", "glass-steel"],
    culturalIdentity: ["arab", "arabic", "middle-eastern", "gulf", "emirati", "islamic"],
    emotionalProfile: ["awestruck", "impressed", "energized", "glamorous", "bold"],
  },

  vietnam: {
    id: "vietnam",
    name: "Vietnam",
    flag: "🇻🇳",
    heroImage: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80",
    region: "Southeast Asia",
    scores: {
      luxury: 45, nature: 80, city: 65, relaxation: 72, adventure: 78,
      social: 72, nightlife: 70, cultural: 85, food: 93, beach: 82,
      budget: 92, family: 68, romance: 68, wellness: 72,
    },
    climates: ["tropical", "warm"],
    travelStyles: ["budget", "cultural", "adventure", "backpacker", "food", "nature"],
    activities: ["food", "history", "beach", "hiking", "photography", "water-sports", "festivals", "cycling"],
    cities: [
      { name: "Hanoi",          tagline: "Chaotic charm of the north",   bestFor: ["history", "culture", "food"],      budgetFit: "budget" },
      { name: "Ho Chi Minh City", tagline: "Frenetic southern powerhouse", bestFor: ["urban", "food", "nightlife"],    budgetFit: "budget" },
      { name: "Hoi An",         tagline: "Lantern-lit ancient town",     bestFor: ["culture", "food", "tailoring"],    budgetFit: "budget" },
      { name: "Da Nang",        tagline: "Modern beach city",            bestFor: ["beach", "food", "surfing"],        budgetFit: "budget" },
      { name: "Ha Long Bay",    tagline: "Emerald limestone karsts",     bestFor: ["nature", "kayaking", "scenery"],   budgetFit: "mid-range" },
    ],
    atmosphereTags: ["lush", "ancient", "tropical", "chaotic", "colorful", "misty", "verdant"],
    architectureIdentity: ["vietnamese", "south-east-asian", "colonial", "traditional", "lantern", "wooden", "french-colonial"],
    culturalIdentity: ["south-east-asian", "vietnamese", "confucian", "tropical-asian", "indochinese"],
    emotionalProfile: ["curious", "adventurous", "inspired", "energized", "free"],
  },

  india: {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    heroImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80",
    region: "South Asia",
    scores: {
      luxury: 60, nature: 78, city: 75, relaxation: 55, adventure: 75,
      social: 78, nightlife: 42, cultural: 98, food: 90, beach: 65,
      budget: 88, family: 62, romance: 55, wellness: 90,
    },
    climates: ["tropical", "desert", "warm", "temperate"],
    travelStyles: ["cultural", "spiritual", "budget", "adventure", "wellness", "backpacker"],
    activities: ["history", "wellness", "hiking", "food", "photography", "festivals", "yoga", "cycling"],
    cities: [
      { name: "Delhi",   tagline: "Mughal heritage meets modern chaos",  bestFor: ["history", "culture", "food"],      budgetFit: "budget" },
      { name: "Mumbai",  tagline: "Maximum city, maximum energy",        bestFor: ["urban", "food", "nightlife"],      budgetFit: "budget" },
      { name: "Goa",     tagline: "Beaches, spice, and chill vibes",     bestFor: ["beach", "nightlife", "relaxation"], budgetFit: "budget" },
      { name: "Jaipur",  tagline: "Pink city of Rajput grandeur",        bestFor: ["culture", "history", "shopping"],  budgetFit: "budget" },
      { name: "Kerala",  tagline: "Backwaters and ayurvedic wellness",   bestFor: ["nature", "wellness", "backwaters"], budgetFit: "mid-range" },
    ],
    atmosphereTags: ["ancient", "mystical", "colorful", "sacred", "chaotic", "vibrant", "spiritual"],
    architectureIdentity: ["mughal", "hindu-temple", "indo-islamic", "rajput", "dravidian", "colonial", "ornate", "south-asian"],
    culturalIdentity: ["south-asian", "indian", "hindu", "mughal", "vedic", "dravidian"],
    emotionalProfile: ["awestruck", "spiritual", "inspired", "overwhelmed", "curious"],
  },
}

// ── Region → destination mapping ──────────────────────────────────────────────
// Used to give a small score boost when Gemini-detected broad regions align
// with a destination's geographic area.

const REGION_TO_DESTINATIONS: Record<string, string[]> = {
  "Mediterranean":   ["greece", "france", "italy", "spain"],
  "Western Europe":  ["france", "spain", "italy"],
  "Southern Europe": ["italy", "greece", "spain"],
  "Eastern Europe":  [],
  "North Africa":    ["morocco"],
  "Arab World":      ["morocco", "dubai"],
  "Middle East":     ["dubai"],
  "East Asia":       ["japan"],
  "Southeast Asia":  ["thailand", "bali", "vietnam"],
  "South Asia":      ["india"],
  "Tropical":        ["thailand", "bali", "vietnam", "india"],
  "Caribbean":       [],
  "South America":   [],
  "Nordic":          [],
  "Oceania":         [],
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

function countTotal(map: Record<string, number>): number {
  return Object.values(map).reduce((s, c) => s + c, 0)
}

function overlapScore(
  userMap: Record<string, number>,
  destList: string[],
  maxPts: number
): number {
  const total = countTotal(userMap)
  if (total === 0) return 0
  let matched = 0
  for (const [key, count] of Object.entries(userMap)) {
    if (destList.includes(key)) matched += count
  }
  return (matched / total) * maxPts
}

function budgetMultiplier(
  userBudget: MergedTravelProfile["budgetLevel"],
  destBudgetScore: number
): number {
  switch (userBudget) {
    case "ultra":
      return destBudgetScore < 40 ? 1.18 : destBudgetScore > 70 ? 0.82 : 1.0
    case "high":
      return destBudgetScore < 50 ? 1.10 : destBudgetScore > 75 ? 0.92 : 1.0
    case "low":
      return destBudgetScore > 70 ? 1.18 : destBudgetScore < 40 ? 0.82 : 1.0
    case "medium":
    default:
      return 1.0
  }
}

/**
 * Fuzzy overlap between a frequency-weighted profile map and a destination identity list.
 * A match is counted if the profile term is a substring of (or equal to) a dest term, or
 * vice-versa — so "islamic" matches "islamic-inspired", "arab" matches "arabic", etc.
 * Returns a score from 0–maxPts proportional to the weighted matched fraction.
 */
function fuzzyOverlapScore(
  profileMap: Record<string, number>,
  destList: string[],
  maxPts: number
): number {
  const total = countTotal(profileMap)
  if (total === 0 || destList.length === 0) return 0
  let matched = 0
  for (const [key, count] of Object.entries(profileMap)) {
    const kLower = key.toLowerCase()
    const hit = destList.some(d => {
      const dLower = d.toLowerCase()
      return dLower === kLower || dLower.includes(kLower) || kLower.includes(dLower)
    })
    if (hit) matched += count
  }
  return (matched / total) * maxPts
}

/**
 * Compute a penalty for strong profile-destination incompatibility.
 * Returns a non-negative number subtracted from the final score.
 * Capped at 20 pts so it can never flip a genuinely good match.
 */
function penaltyScore(
  profile: MergedTravelProfile,
  dest: ExploreDestination
): number {
  let penalty = 0

  // Extreme budget mismatch
  if (profile.budgetLevel === "low"   && dest.scores.budget < 25) penalty += 10
  if (profile.budgetLevel === "ultra" && dest.scores.budget > 80) penalty +=  6

  // Cultural, non-party profile in a pure nightlife-dominant destination
  if (
    profile.culturalInterest > 75 &&
    profile.nightlifeInterest < 25 &&
    dest.scores.nightlife > 88
  ) penalty += 7

  // Deep relaxation seeker vs intense urban megacity with low relaxation score
  if (
    profile.relaxationLevel > 80 &&
    profile.adventureLevel < 25 &&
    dest.scores.city > 90 &&
    dest.scores.relaxation < 50
  ) penalty += 5

  // High-adventure profile in a pure relaxation paradise
  if (
    profile.adventureLevel > 80 &&
    profile.relaxationLevel < 25 &&
    dest.scores.relaxation > 85 &&
    dest.scores.adventure < 55
  ) penalty += 6

  // Deep nature lover in a near-zero nature destination
  if (profile.natureLevel > 80 && dest.scores.nature < 40) penalty += 5

  // Urban maximalist in a remote / rural destination
  if (profile.cityLevel > 80 && dest.scores.city < 50) penalty += 5

  return Math.min(penalty, 20)
}

// ── Main ranking function ─────────────────────────────────────────────────────

/**
 * Score all destinations against the merged user profile and return them sorted
 * best-first. The `topN` parameter controls how many to return (default all).
 * Theoretical max score is ~183 pts (numeric ~96 + overlaps ~60 + qualitative ~53 + bonuses ~15 − penalty 0).
 */
export function rankDestinations(
  profile: MergedTravelProfile,
  topN: number = Object.keys(EXPLORE_DESTINATIONS).length
): RankedDestination[] {
  const results: RankedDestination[] = []

  for (const dest of Object.values(EXPLORE_DESTINATIONS)) {
    let score = 0

    // ── 1. Numeric dimension similarity (main signal) ─────────────────────
    // Pairs: [userScore, destScore, weight]
    const dims: [number, number, number][] = [
      [profile.culturalInterest,  dest.scores.cultural,     1.3],
      [profile.luxuryLevel,       dest.scores.luxury,       1.2],
      [profile.adventureLevel,    dest.scores.adventure,    1.2],
      [profile.natureLevel,       dest.scores.nature,       1.0],
      [profile.cityLevel,         dest.scores.city,         1.0],
      [profile.relaxationLevel,   dest.scores.relaxation,   1.0],
      [profile.nightlifeInterest, dest.scores.nightlife,    1.0],
      [profile.socialLevel,       dest.scores.social,       0.8],
    ]

    for (const [user, dst, w] of dims) {
      const closeness = 1 - Math.abs(user - dst) / 100  // 0–1
      const interest  = user / 100                        // 0–1
      score += closeness * interest * w * 14
    }

    // ── 2. Travel-style overlap (up to 25 pts) ────────────────────────────
    score += overlapScore(profile.travelStyles, dest.travelStyles, 25)

    // ── 3. Activity overlap (up to 20 pts) ───────────────────────────────
    score += overlapScore(profile.activities, dest.activities, 20)

    // ── 4. Climate overlap (up to 15 pts) ────────────────────────────────
    score += overlapScore(profile.climatePreference, dest.climates, 15)

    // ── 5. Budget compatibility ───────────────────────────────────────────
    score *= budgetMultiplier(profile.budgetLevel, dest.scores.budget)

    // ── 6. Family-friendly bonus ─────────────────────────────────────────
    if (profile.familyFriendly && dest.scores.family > 72) score += 6

    // ── 7. Region affinity bonus (up to 9 pts) ───────────────────────────
    // Gemini-detected broad regions nudge scores toward geographically
    // consistent destinations. Small bonus — never overrides preferences.
    const regionTotal = countTotal(profile.possibleRegions ?? {})
    if (regionTotal > 0) {
      let regionMatched = 0
      for (const [region, count] of Object.entries(profile.possibleRegions ?? {})) {
        const targets = REGION_TO_DESTINATIONS[region] ?? []
        if (targets.includes(dest.id)) regionMatched += count
      }
      score += (regionMatched / regionTotal) * 9
    }

    // ── 8. Architecture identity match (up to 18 pts) ───────────────────
    // Key discriminator: "islamic" → Morocco/Dubai, "roman" → Italy, etc.
    score += fuzzyOverlapScore(profile.architectureStyle ?? {}, dest.architectureIdentity, 18)

    // ── 9. Atmosphere match (up to 12 pts) ───────────────────────────────
    score += fuzzyOverlapScore(profile.atmosphere ?? {}, dest.atmosphereTags, 12)

    // ── 10. Emotional vibe match (up to 8 pts) ───────────────────────────
    score += fuzzyOverlapScore(profile.emotionalVibe ?? {}, dest.emotionalProfile, 8)

    // ── 11. Cultural context match (up to 15 pts) ────────────────────────
    // Strong regional signal: "north-african" → Morocco, "east-asian" → Japan
    score += fuzzyOverlapScore(profile.culturalContext ?? {}, dest.culturalIdentity, 15)

    // ── 12. Negative penalty ─────────────────────────────────────────────
    score -= penaltyScore(profile, dest)

    results.push({
      id: dest.id, name: dest.name, flag: dest.flag,
      heroImage: dest.heroImage, score, cities: dest.cities,
    })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

/**
 * Extract vibe labels from the merged profile for display in the result card.
 */
export function extractProfileVibes(profile: MergedTravelProfile): string[] {
  const byFreq = (map: Record<string, number>) =>
    Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([k]) => k)

  return [
    ...byFreq(profile.travelStyles).slice(0, 3),
    ...byFreq(profile.activities).slice(0, 3),
  ].slice(0, 6)
}

/**
 * Convert a merged profile's budgetLevel + luxuryLevel into a travelStyle
 * string for the response payload.
 */
export function inferTravelStyle(profile: MergedTravelProfile): string {
  const topStyle = Object.entries(profile.travelStyles)
    .sort(([, a], [, b]) => b - a)[0]?.[0]
  return topStyle ?? (profile.luxuryLevel > 70 ? "luxury" : profile.adventureLevel > 65 ? "adventure" : "cultural")
}
