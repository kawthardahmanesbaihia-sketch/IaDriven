import type { ImageTemplateTags } from "./image-templates"

export interface PreferenceScores {
  budget: Record<string, number>
  travelers: Record<string, number>
  interests: Record<string, number>
  tripStyle: Record<string, number>
  climate: Record<string, number>
  foodStyle: Record<string, number>
  environment: Record<string, number>
  vibe: Record<string, number>
}

export interface TravelProfile {
  budget: ImageTemplateTags["budget"]
  travelers: ImageTemplateTags["travelers"]
  interests: string[]
  tripStyle: ImageTemplateTags["tripStyle"]
  climate: ImageTemplateTags["climate"]
  foodStyle: ImageTemplateTags["foodStyle"]
  environment: ImageTemplateTags["environment"]
  vibe: ImageTemplateTags["vibe"]
  selectionCount: number
  rawScores: PreferenceScores
}

export function createEmptyScores(): PreferenceScores {
  return {
    budget: {},
    travelers: {},
    interests: {},
    tripStyle: {},
    climate: {},
    foodStyle: {},
    environment: {},
    vibe: {},
  }
}

export function accumulateScore(scores: PreferenceScores, tags: ImageTemplateTags): PreferenceScores {
  const next = structuredClone(scores)

  inc(next.budget, tags.budget)
  inc(next.travelers, tags.travelers)
  for (const interest of tags.interests) inc(next.interests, interest)
  inc(next.tripStyle, tags.tripStyle)
  inc(next.climate, tags.climate)
  inc(next.foodStyle, tags.foodStyle)
  inc(next.environment, tags.environment)
  inc(next.vibe, tags.vibe)

  return next
}

function inc(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1
}

function top(map: Record<string, number>): string {
  return Object.entries(map).sort(([, a], [, b]) => b - a)[0]?.[0] ?? ""
}

function topN(map: Record<string, number>, n: number): string[] {
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([k]) => k)
}

export function buildTravelProfile(scores: PreferenceScores, selectionCount: number): TravelProfile {
  return {
    budget: (top(scores.budget) as ImageTemplateTags["budget"]) || "mid-range",
    travelers: (top(scores.travelers) as ImageTemplateTags["travelers"]) || "solo",
    interests: topN(scores.interests, 5),
    tripStyle: (top(scores.tripStyle) as ImageTemplateTags["tripStyle"]) || "relaxed",
    climate: (top(scores.climate) as ImageTemplateTags["climate"]) || "temperate",
    foodStyle: (top(scores.foodStyle) as ImageTemplateTags["foodStyle"]) || "local",
    environment: (top(scores.environment) as ImageTemplateTags["environment"]) || "city",
    vibe: (top(scores.vibe) as ImageTemplateTags["vibe"]) || "cultural",
    selectionCount,
    rawScores: scores,
  }
}

export function profileToPrompt(profile: TravelProfile): string {
  return [
    `Travel Profile Summary:`,
    `- Budget level: ${profile.budget}`,
    `- Traveling as: ${profile.travelers}`,
    `- Trip style: ${profile.tripStyle}`,
    `- Preferred climate: ${profile.climate}`,
    `- Preferred environment: ${profile.environment}`,
    `- Vibe preference: ${profile.vibe}`,
    `- Food preference: ${profile.foodStyle}`,
    `- Top interests: ${profile.interests.join(", ")}`,
    `- Based on ${profile.selectionCount} image selections`,
  ].join("\n")
}
