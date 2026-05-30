import type { ImageTemplateTags } from "./image-templates"

export interface CategoryQueryEntry {
  id: string
  query: string
  tags: ImageTemplateTags
}

/**
 * Per-category pools of Unsplash search queries.
 * Each entry carries the metadata tags that will be attached to images
 * returned by that query. The route tries queries in order until it
 * has collected `count` unique images.
 */
export const CATEGORY_QUERY_POOLS: Record<string, CategoryQueryEntry[]> = {
  // ── NATURE ──────────────────────────────────────────────────────────────────
  nature: [
    {
      id: "nature_landscape",
      query: "nature landscape travel scenic wilderness",
      tags: { budget: "budget", travelers: "solo", interests: ["nature", "hiking"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "adventurous" },
    },
    {
      id: "nature_mountain",
      query: "mountain peak alpine hiking trail",
      tags: { budget: "mid-range", travelers: "solo", interests: ["hiking", "mountains", "photography"], tripStyle: "adventure", climate: "cold", foodStyle: "local", environment: "mountain", vibe: "adventurous" },
    },
    {
      id: "nature_waterfall",
      query: "waterfall jungle rainforest tropical green",
      tags: { budget: "budget", travelers: "friends", interests: ["nature", "swimming", "photography"], tripStyle: "adventure", climate: "tropical", foodStyle: "local", environment: "nature", vibe: "adventurous" },
    },
    {
      id: "nature_countryside",
      query: "countryside rural road scenic peaceful valley",
      tags: { budget: "budget", travelers: "couple", interests: ["scenery", "road-trip", "relaxation"], tripStyle: "relaxed", climate: "temperate", foodStyle: "local", environment: "countryside", vibe: "peaceful" },
    },
    {
      id: "nature_forest",
      query: "forest trees trail morning sunlight peaceful",
      tags: { budget: "budget", travelers: "solo", interests: ["nature", "wellness", "hiking"], tripStyle: "wellness", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "peaceful" },
    },
    {
      id: "nature_northern_lights",
      query: "northern lights aurora borealis winter night sky",
      tags: { budget: "mid-range", travelers: "couple", interests: ["nature", "photography"], tripStyle: "relaxed", climate: "cold", foodStyle: "local", environment: "nature", vibe: "romantic" },
    },
    {
      id: "nature_desert",
      query: "desert dunes sand landscape dramatic sunset",
      tags: { budget: "mid-range", travelers: "couple", interests: ["nature", "photography", "culture"], tripStyle: "adventure", climate: "desert", foodStyle: "local", environment: "desert", vibe: "adventurous" },
    },
  ],

  // ── CITY ────────────────────────────────────────────────────────────────────
  city: [
    {
      id: "city_street",
      query: "city travel urban street photography culture",
      tags: { budget: "mid-range", travelers: "solo", interests: ["city", "photography", "culture"], tripStyle: "cultural", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
    },
    {
      id: "city_skyline",
      query: "city skyline night lights skyscrapers modern",
      tags: { budget: "mid-range", travelers: "friends", interests: ["city", "nightlife", "views"], tripStyle: "cultural", climate: "temperate", foodStyle: "diverse", environment: "city", vibe: "social" },
    },
    {
      id: "city_europe",
      query: "European historic city cobblestone architecture travel",
      tags: { budget: "mid-range", travelers: "couple", interests: ["history", "culture", "architecture"], tripStyle: "cultural", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "romantic" },
    },
    {
      id: "city_asia",
      query: "Asian city neon market street food bustling",
      tags: { budget: "budget", travelers: "solo", interests: ["culture", "food", "city"], tripStyle: "cultural", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "adventurous" },
    },
    {
      id: "city_rooftop",
      query: "rooftop bar terrace city view cocktails evening",
      tags: { budget: "mid-range", travelers: "friends", interests: ["nightlife", "city", "socializing"], tripStyle: "party", climate: "temperate", foodStyle: "diverse", environment: "city", vibe: "social" },
    },
    {
      id: "city_cafe",
      query: "sidewalk café street morning coffee culture",
      tags: { budget: "mid-range", travelers: "couple", interests: ["relaxation", "culture", "food"], tripStyle: "relaxed", climate: "temperate", foodStyle: "local", environment: "city", vibe: "peaceful" },
    },
    {
      id: "city_luxury",
      query: "luxury hotel city penthouse suite skyline view",
      tags: { budget: "luxury", travelers: "couple", interests: ["city", "luxury", "comfort"], tripStyle: "cultural", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "luxurious" },
    },
  ],

  // ── ACTIVITIES / ADVENTURE ──────────────────────────────────────────────────
 activities: [
  {
    id: "activities_surfing",
    query: "surfing beach waves ocean sport tropical travel",
    tags: {
      budget: "budget",
      travelers: "friends",
      interests: ["surfing", "beach", "ocean"],
      tripStyle: "adventure",
      climate: "tropical",
      foodStyle: "seafood",
      environment: "beach",
      vibe: "adventurous",
    },
  },

  {
    id: "activities_hiking",
    query: "hiking trekking mountains trail backpack nature",
    tags: {
      budget: "budget",
      travelers: "solo",
      interests: ["hiking", "nature", "fitness"],
      tripStyle: "adventure",
      climate: "temperate",
      foodStyle: "local",
      environment: "mountain",
      vibe: "peaceful",
    },
  },

  {
    id: "activities_luxury_resort",
    query: "luxury resort infinity pool spa private beach",
    tags: {
      budget: "luxury",
      travelers: "couple",
      interests: ["spa", "luxury", "relaxation"],
      tripStyle: "relaxed",
      climate: "tropical",
      foodStyle: "fine-dining",
      environment: "beach",
      vibe: "luxurious",
    },
  },

  {
    id: "activities_food_tour",
    query: "street food local cuisine food market culinary travel",
    tags: {
      budget: "mid-range",
      travelers: "friends",
      interests: ["food", "culture", "local-life"],
      tripStyle: "cultural",
      climate: "temperate",
      foodStyle: "street-food",
      environment: "city",
      vibe: "social",
    },
  },

  {
    id: "activities_camping",
    query: "camping forest bonfire tent outdoor adventure",
    tags: {
      budget: "budget",
      travelers: "friends",
      interests: ["camping", "nature", "outdoor"],
      tripStyle: "adventure",
      climate: "cold",
      foodStyle: "local",
      environment: "nature",
      vibe: "peaceful",
    },
  },

  {
    id: "activities_nightlife",
    query: "nightlife club party rooftop neon city night",
    tags: {
      budget: "mid-range",
      travelers: "friends",
      interests: ["party", "music", "nightlife"],
      tripStyle: "party",
      climate: "temperate",
      foodStyle: "diverse",
      environment: "city",
      vibe: "social",
    },
  },

  {
    id: "activities_museum",
    query: "museum history architecture culture art gallery",
    tags: {
      budget: "budget",
      travelers: "solo",
      interests: ["history", "culture", "art"],
      tripStyle: "cultural",
      climate: "temperate",
      foodStyle: "local",
      environment: "city",
      vibe: "cultural",
    },
  },

  {
    id: "activities_safari",
    query: "safari wildlife africa animals jeep nature",
    tags: {
      budget: "luxury",
      travelers: "family",
      interests: ["wildlife", "nature", "photography"],
      tripStyle: "adventure",
      climate: "desert",
      foodStyle: "local",
      environment: "nature",
      vibe: "adventurous",
    },
  },

  {
    id: "activities_romantic",
    query: "romantic dinner sunset couple honeymoon luxury",
    tags: {
      budget: "luxury",
      travelers: "couple",
      interests: ["romance", "relaxation", "luxury"],
      tripStyle: "relaxed",
      climate: "temperate",
      foodStyle: "fine-dining",
      environment: "beach",
      vibe: "romantic",
    },
  },

  {
    id: "activities_skiing",
    query: "skiing snow mountain winter resort adventure",
    tags: {
      budget: "mid-range",
      travelers: "friends",
      interests: ["skiing", "snow", "winter"],
      tripStyle: "adventure",
      climate: "cold",
      foodStyle: "local",
      environment: "mountain",
      vibe: "adventurous",
    },
  },
  ],


  // ── FOOD ────────────────────────────────────────────────────────────────────
  food: [
    {
      id: "food_street",
      query: "street food market travel local cuisine stalls",
      tags: { budget: "budget", travelers: "solo", interests: ["food", "culture", "street food"], tripStyle: "foodie", climate: "tropical", foodStyle: "street-food", environment: "city", vibe: "cultural" },
    },
    {
      id: "food_fine_dining",
      query: "fine dining restaurant gourmet elegant chef plating",
      tags: { budget: "luxury", travelers: "couple", interests: ["gastronomy", "luxury dining"], tripStyle: "foodie", climate: "temperate", foodStyle: "fine-dining", environment: "city", vibe: "luxurious" },
    },
    {
      id: "food_local_market",
      query: "farmers market fresh produce local ingredients food",
      tags: { budget: "budget", travelers: "solo", interests: ["food", "local culture", "markets"], tripStyle: "foodie", climate: "temperate", foodStyle: "local", environment: "city", vibe: "cultural" },
    },
    {
      id: "food_seafood",
      query: "seafood restaurant coastal harbour fresh fish",
      tags: { budget: "mid-range", travelers: "family", interests: ["seafood", "food", "coastal"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "seafood", environment: "beach", vibe: "social" },
    },
    {
      id: "food_cooking",
      query: "cooking class chef kitchen local cuisine",
      tags: { budget: "mid-range", travelers: "couple", interests: ["cooking", "culture", "food"], tripStyle: "foodie", climate: "tropical", foodStyle: "local", environment: "city", vibe: "cultural" },
    },
    {
      id: "food_vineyard",
      query: "wine vineyard winery tasting table countryside",
      tags: { budget: "luxury", travelers: "couple", interests: ["wine", "gastronomy", "scenery"], tripStyle: "foodie", climate: "mediterranean", foodStyle: "fine-dining", environment: "countryside", vibe: "romantic" },
    },
    {
      id: "food_asian",
      query: "ramen sushi dumplings Asian noodles restaurant",
      tags: { budget: "budget", travelers: "solo", interests: ["food", "Asian cuisine", "culture"], tripStyle: "foodie", climate: "tropical", foodStyle: "local", environment: "city", vibe: "cultural" },
    },
    {
      id: "food_breakfast",
      query: "brunch cafe food spread morning aesthetic",
      tags: { budget: "mid-range", travelers: "couple", interests: ["food", "relaxation", "culture"], tripStyle: "foodie", climate: "temperate", foodStyle: "local", environment: "city", vibe: "peaceful" },
    },
  ],

  // ── BEACHES ─────────────────────────────────────────────────────────────────
  beaches: [
    {
      id: "beaches_tropical",
      query: "tropical beach paradise turquoise clear water white sand",
      tags: { budget: "mid-range", travelers: "couple", interests: ["beach", "relaxation", "swimming"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "peaceful" },
    },
    {
      id: "beaches_resort",
      query: "beach resort pool ocean vacation luxury sun",
      tags: { budget: "luxury", travelers: "family", interests: ["beach", "swimming", "relaxation"], tripStyle: "relaxed", climate: "tropical", foodStyle: "fine-dining", environment: "beach", vibe: "luxurious" },
    },
    {
      id: "beaches_mediterranean",
      query: "Mediterranean sea cliff rocky beach blue water",
      tags: { budget: "mid-range", travelers: "couple", interests: ["beach", "scenery", "sailing"], tripStyle: "relaxed", climate: "mediterranean", foodStyle: "seafood", environment: "beach", vibe: "romantic" },
    },
    {
      id: "beaches_surf",
      query: "surfing beach waves sport ocean sunset",
      tags: { budget: "budget", travelers: "friends", interests: ["surfing", "beach", "sport"], tripStyle: "adventure", climate: "tropical", foodStyle: "local", environment: "beach", vibe: "adventurous" },
    },
    {
      id: "beaches_party",
      query: "beach party friends summer vacation fun volleyball",
      tags: { budget: "budget", travelers: "friends", interests: ["beach", "socializing", "sport"], tripStyle: "party", climate: "tropical", foodStyle: "diverse", environment: "beach", vibe: "social" },
    },
    {
      id: "beaches_island",
      query: "tropical island getaway boat ocean isolated paradise",
      tags: { budget: "luxury", travelers: "couple", interests: ["island", "relaxation", "diving"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "luxurious" },
    },
    {
      id: "beaches_sunset",
      query: "beach sunset golden hour ocean waves silhouette",
      tags: { budget: "budget", travelers: "couple", interests: ["photography", "relaxation", "romance"], tripStyle: "relaxed", climate: "tropical", foodStyle: "local", environment: "beach", vibe: "romantic" },
    },
  ],

  // ── CULTURE ─────────────────────────────────────────────────────────────────
 culture: [
  {
    id: "culture_islamic_architecture",
    query: "mosque islamic architecture arabic design morocco turkey",
    tags: {
      budget: "mid-range",
      travelers: "family",
      interests: ["islamic-culture", "architecture", "history"],
      tripStyle: "cultural",
      climate: "mediterranean",
      foodStyle: "local",
      environment: "city",
      vibe: "cultural"
    },
  },
  {
    id: "culture_arab_market",
    query: "arab souk bazaar spices traditional market middle east",
    tags: {
      budget: "budget",
      travelers: "friends",
      interests: ["shopping", "culture", "food"],
      tripStyle: "cultural",
      climate: "desert",
      foodStyle: "street-food",
      environment: "city",
      vibe: "social"
    },
  },

  {
    id: "culture_middle_east_night",
    query: "middle east night market lanterns arabic street culture",
    tags: {
      budget: "budget",
      travelers: "family",
      interests: ["arabic-culture", "food", "traditions"],
      tripStyle: "cultural",
      climate: "desert",
      foodStyle: "street-food",
      environment: "city",
      vibe: "social"
    },
  },
  {
    id: "culture_japanese",
    query: "japan temple kimono sakura traditional culture",
    tags: {
      budget: "luxury",
      travelers: "couple",
      interests: ["history", "culture", "photography"],
      tripStyle: "cultural",
      climate: "temperate",
      foodStyle: "local",
      environment: "city",
      vibe: "peaceful"
    },
  },
  {
    id: "culture_indian",
    query: "india colorful festival traditional dance culture",
    tags: {
      budget: "budget",
      travelers: "friends",
      interests: ["festivals", "culture", "music"],
      tripStyle: "cultural",
      climate: "tropical",
      foodStyle: "local",
      environment: "city",
      vibe: "energetic"
    },
  },
  {
    id: "culture_ottoman",
    query: "ottoman palace turkey istanbul historical interior",
    tags: {
      budget: "mid-range",
      travelers: "couple",
      interests: ["history", "architecture", "luxury"],
      tripStyle: "cultural",
      climate: "mediterranean",
      foodStyle: "local",
      environment: "city",
      vibe: "elegant"
    },
  },
  {
    id: "culture_african",
    query: "african tribe traditional clothing cultural heritage",
    tags: {
      budget: "budget",
      travelers: "solo",
      interests: ["culture", "history", "adventure"],
      tripStyle: "cultural",
      climate: "tropical",
      foodStyle: "local",
      environment: "nature",
      vibe: "authentic"
    },
  },
  {
    id: "culture_european_oldtown",
    query: "europe old town street architecture cafe culture",
    tags: {
      budget: "mid-range",
      travelers: "couple",
      interests: ["architecture", "cafes", "history"],
      tripStyle: "cultural",
      climate: "cold",
      foodStyle: "fine-dining",
      environment: "city",
      vibe: "romantic"
    },
  },
  {
    id: "culture_mediterranean",
    query: "mediterranean coastal village colorful cultural lifestyle",
    tags: {
      budget: "mid-range",
      travelers: "family",
      interests: ["culture", "sea", "food"],
      tripStyle: "cultural",
      climate: "mediterranean",
      foodStyle: "seafood",
      environment: "countryside",
      vibe: "relaxing"
    },
  },
  {
    id: "culture_andalusian",
    query: "andalusian palace arabic spanish islamic heritage",
    tags: {
      budget: "luxury",
      travelers: "couple",
      interests: ["islamic-history", "architecture", "culture"],
      tripStyle: "cultural",
      climate: "mediterranean",
      foodStyle: "fine-dining",
      environment: "city",
      vibe: "luxurious"
    },
  }
  ],
}

/**
 * Fallback queries used when category is unknown or all category queries fail.
 */
export const FALLBACK_QUERIES: CategoryQueryEntry[] = [
  {
    id: "fallback_travel",
    query: "travel vacation destination landscape scenic",
    tags: { budget: "mid-range", travelers: "couple", interests: ["travel", "scenery"], tripStyle: "relaxed", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "peaceful" },
  },
  {
    id: "fallback_adventure",
    query: "adventure outdoor explore travel nature",
    tags: { budget: "budget", travelers: "friends", interests: ["adventure", "nature"], tripStyle: "adventure", climate: "temperate", foodStyle: "local", environment: "nature", vibe: "adventurous" },
  },
  {
    id: "fallback_beach",
    query: "beach ocean tropical travel holiday",
    tags: { budget: "mid-range", travelers: "couple", interests: ["beach", "relaxation"], tripStyle: "relaxed", climate: "tropical", foodStyle: "seafood", environment: "beach", vibe: "peaceful" },
  },
]
