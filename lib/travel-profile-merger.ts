/**
 * Travel Profile Merger
 *
 * Combines multiple per-image TravelPreferenceAnalysis results into a single
 * weighted MergedTravelProfile. Numeric fields are averaged; categorical fields
 * are frequency-counted so signals that appear across many images carry more
 * weight than signals that appear in only one.
 */

import type { TravelPreferenceAnalysis } from "./gemini-vision"

// ── Public types ──────────────────────────────────────────────────────────────

export interface MergedTravelProfile {
  // ── Averaged numeric preference levels (0–100) ────────────────────────────
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

  // ── Frequency maps: value → how many images surfaced this signal ──────────
  travelStyles: Record<string, number>
  activities: Record<string, number>
  climatePreference: Record<string, number>
  possibleRegions: Record<string, number>   // broad regions — never country names
  atmosphere: Record<string, number>        // visual mood signals
  emotionalVibe: Record<string, number>     // traveler emotional state
  architectureStyle: Record<string, number> // architectural style — never location
  culturalContext: Record<string, number>   // broad cultural aesthetic — never country
  explorationStyle: Record<string, number>  // how the traveler explores

  // ── Most-frequent categorical values ─────────────────────────────────────
  budgetLevel: "low" | "medium" | "high" | "ultra"
  travelType: "solo" | "couple" | "friends" | "family"
  familyFriendly: boolean

  // ── Meta ─────────────────────────────────────────────────────────────────
  avgConfidence: number   // average Gemini confidence across images
  imageCount: number      // how many analyses contributed
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type NumericKey = keyof Pick<
  TravelPreferenceAnalysis,
  | "luxuryLevel" | "natureLevel" | "cityLevel" | "relaxationLevel"
  | "adventureLevel" | "socialLevel" | "nightlifeInterest" | "culturalInterest"
  | "romanticAffinity" | "foodExplorationAffinity" | "confidenceLevel"
>

function avgField(analyses: TravelPreferenceAnalysis[], field: NumericKey): number {
  return Math.round(
    analyses.reduce((sum, a) => sum + (a[field] as number), 0) / analyses.length
  )
}

function countItems(lists: string[][]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const list of lists) {
    for (const item of list) {
      counts[item] = (counts[item] ?? 0) + 1
    }
  }
  return counts
}

function mostCommon<T extends string>(values: T[]): T {
  if (values.length === 0) return values[0]
  const counts: Record<string, number> = {}
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as T
}

// ── Fallback profile used when Gemini returns all nulls ───────────────────────

function defaultProfile(): MergedTravelProfile {
  return {
    luxuryLevel: 50,
    natureLevel: 50,
    cityLevel: 50,
    relaxationLevel: 55,
    adventureLevel: 45,
    socialLevel: 50,
    nightlifeInterest: 30,
    culturalInterest: 65,
    romanticAffinity: 40,
    foodExplorationAffinity: 50,
    travelStyles: {},
    activities: {},
    climatePreference: {},
    possibleRegions: {},
    atmosphere: {},
    emotionalVibe: {},
    architectureStyle: {},
    culturalContext: {},
    explorationStyle: {},
    budgetLevel: "medium",
    travelType: "couple",
    familyFriendly: false,
    avgConfidence: 0.5,
    imageCount: 0,
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Merge multiple per-image analyses into one unified travel preference profile.
 * Images that produce null analyses (API failure) are silently skipped.
 * If all analyses fail, returns a neutral default profile.
 */
export function mergeAnalyses(
  analyses: Array<TravelPreferenceAnalysis | null>
): MergedTravelProfile {
  const valid = analyses.filter(Boolean) as TravelPreferenceAnalysis[]

  if (valid.length === 0) return defaultProfile()

  return {
    luxuryLevel:       avgField(valid, "luxuryLevel"),
    natureLevel:       avgField(valid, "natureLevel"),
    cityLevel:         avgField(valid, "cityLevel"),
    relaxationLevel:   avgField(valid, "relaxationLevel"),
    adventureLevel:    avgField(valid, "adventureLevel"),
    socialLevel:       avgField(valid, "socialLevel"),
    nightlifeInterest: avgField(valid, "nightlifeInterest"),
    culturalInterest:  avgField(valid, "culturalInterest"),

    romanticAffinity:       avgField(valid, "romanticAffinity"),
    foodExplorationAffinity: avgField(valid, "foodExplorationAffinity"),

    travelStyles:      countItems(valid.map(a => a.travelStyles)),
    activities:        countItems(valid.map(a => a.activities)),
    climatePreference: countItems(valid.map(a => a.climatePreference)),
    possibleRegions:   countItems(valid.map(a => a.possibleRegions ?? [])),
    atmosphere:        countItems(valid.map(a => a.atmosphere ?? [])),
    emotionalVibe:     countItems(valid.map(a => a.emotionalVibe ?? [])),
    architectureStyle: countItems(valid.map(a => a.architectureStyle ?? [])),
    culturalContext:   countItems(valid.map(a => a.culturalContext ?? [])),
    explorationStyle:  countItems(valid.map(a => a.explorationStyle ?? [])),

    budgetLevel:    mostCommon(valid.map(a => a.budgetLevel)),
    travelType:     mostCommon(valid.map(a => a.travelType)),
    familyFriendly: valid.filter(a => a.familyFriendly).length > valid.length / 2,

    avgConfidence: valid.reduce((s, a) => s + (a.confidenceLevel ?? 0.7), 0) / valid.length,
    imageCount: valid.length,
  }
}

/**
 * Apply squad-type adjustments to a merged profile.
 * Returns a new profile — does not mutate the input.
 */
export function applySquadAdjustments(
  profile: MergedTravelProfile,
  squad: "solo" | "couple" | "friends" | "family" | null | undefined
): MergedTravelProfile {
  if (!squad) return profile

  const p = { ...profile }

  switch (squad) {
    case "solo":
      p.adventureLevel    = Math.min(100, p.adventureLevel + 8)
      p.socialLevel       = Math.max(0,   p.socialLevel - 8)
      break
    case "couple":
      p.relaxationLevel   = Math.min(100, p.relaxationLevel + 8)
      p.culturalInterest  = Math.min(100, p.culturalInterest + 5)
      p.travelStyles = { ...p.travelStyles, romantic: (p.travelStyles.romantic ?? 0) + 2 }
      break
    case "friends":
      p.socialLevel       = Math.min(100, p.socialLevel + 12)
      p.nightlifeInterest = Math.min(100, p.nightlifeInterest + 10)
      p.adventureLevel    = Math.min(100, p.adventureLevel + 5)
      break
    case "family":
      p.familyFriendly    = true
      p.relaxationLevel   = Math.min(100, p.relaxationLevel + 10)
      p.adventureLevel    = Math.max(0,   p.adventureLevel - 10)
      break
  }

  return p
}
