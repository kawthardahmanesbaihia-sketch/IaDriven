import { NextRequest, NextResponse } from "next/server"
import { analyzeImagesForTravel } from "@/lib/gemini-vision"
import { mergeAnalyses, applySquadAdjustments } from "@/lib/travel-profile-merger"
import {
  rankDestinations,
  extractProfileVibes,
  inferTravelStyle,
  EXPLORE_DESTINATIONS,
} from "@/lib/explore-destinations"

export const runtime = "nodejs"

// ── Squad destination bonuses ─────────────────────────────────────────────────
// Applied after preference scoring to reflect squad-specific fit.
// These are point additions, NOT multipliers.

const SQUAD_BONUS: Record<string, Record<string, number>> = {
  solo:    { japan: 4, vietnam: 4, morocco: 3, thailand: 3, india: 3, bali: 2, greece: 2, spain: 2, france: 1, italy: 1, dubai: 0 },
  couple:  { greece: 5, france: 5, italy: 5, bali: 4, dubai: 3, spain: 3, japan: 2, thailand: 2, morocco: 1, vietnam: 1, india: 1 },
  friends: { spain: 6, thailand: 5, greece: 4, vietnam: 4, bali: 3, morocco: 3, india: 2, japan: 2, italy: 2, dubai: 2, france: 1 },
  family:  { italy: 4, japan: 3, france: 3, dubai: 2, spain: 2, greece: 2, thailand: 2, bali: 1, vietnam: 1, india: 1, morocco: 0 },
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { images, squad } = await req.json() as {
      images: string[]
      squad?: "solo" | "couple" | "friends" | "family"
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    const clampedImages = images.slice(0, 5)
    console.log(`[explore-analyze] ${clampedImages.length} image(s) | squad="${squad ?? "none"}"`)

    // ── Step 1: Analyze each image for travel preferences ─────────────────
    // Gemini returns travel psychology signals — no location detection.
    const rawAnalyses = await analyzeImagesForTravel(clampedImages)
    console.log("GEMINI RAW ANALYSES:", JSON.stringify(rawAnalyses, null, 2))
    const validCount  = rawAnalyses.filter(Boolean).length

    console.log(`[explore-analyze] Gemini: ${validCount}/${clampedImages.length} successful`)
    for (const [i, a] of rawAnalyses.entries()) {
      if (!a) { console.log(`  Image ${i + 1}: null`); continue }
      console.log(
        `  Image ${i + 1}: styles=${JSON.stringify(a.travelStyles)} ` +
        `| budget=${a.budgetLevel} | luxury=${a.luxuryLevel} ` +
        `| culture=${a.culturalInterest} | adventure=${a.adventureLevel}`
      )
    }

    // ── Step 2: Merge into one unified travel profile ─────────────────────
    const baseProfile = mergeAnalyses(rawAnalyses)

    console.log(
      `[explore-analyze] Merged profile: ` +
      `luxury=${baseProfile.luxuryLevel} nature=${baseProfile.natureLevel} ` +
      `city=${baseProfile.cityLevel} culture=${baseProfile.culturalInterest} ` +
      `adventure=${baseProfile.adventureLevel} relax=${baseProfile.relaxationLevel} ` +
      `nightlife=${baseProfile.nightlifeInterest} social=${baseProfile.socialLevel} ` +
      `| budget=${baseProfile.budgetLevel} type=${baseProfile.travelType} ` +
      `| styles=${JSON.stringify(baseProfile.travelStyles)} ` +
      `| activities=${JSON.stringify(baseProfile.activities)} ` +
      `| climates=${JSON.stringify(baseProfile.climatePreference)}`
    )

    // ── Step 3: Apply squad adjustments to the profile ────────────────────
    const adjustedProfile = applySquadAdjustments(baseProfile, squad)

    // ── Step 4: Rank destinations by preference compatibility ─────────────
    const ranked = rankDestinations(adjustedProfile)

    // ── Step 5: Apply squad destination bonuses ───────────────────────────
    if (squad && SQUAD_BONUS[squad]) {
      for (const r of ranked) {
        r.score += SQUAD_BONUS[squad][r.id] ?? 0
      }
      ranked.sort((a, b) => b.score - a.score)
    }

    console.log(
      "[explore-analyze] Final ranking: " +
      ranked.map(r => `${r.id}=${r.score.toFixed(1)}`).join(" > ")
    )

    // ── Step 6: Compute confidence ────────────────────────────────────────
    const best   = ranked[0]
    const second = ranked[1]

    // Confidence reflects both absolute score and the gap to second place.
    // Theoretical max is ~183 (numeric + overlaps + qualitative fuzzy + bonuses).
    const scorePct  = Math.min((best.score / 170) * 100, 97)
    const gapBonus  = Math.min(((best.score - (second?.score ?? 0)) / 170) * 100 * 0.5, 10)
    const confidence = Math.round(Math.max(scorePct + gapBonus, 55))

    // ── Step 7: Build response ────────────────────────────────────────────
    const vibes      = extractProfileVibes(adjustedProfile)
    const travelStyle = inferTravelStyle(adjustedProfile)

    console.log(
      `[explore-analyze] Winner: ${best.id} | confidence=${Math.min(confidence, 97)}% ` +
      `| vibes=${JSON.stringify(vibes)}`
    )

    return NextResponse.json({
      destinationId:   best.id,
      destinationName: best.name,
      heroImage:       best.heroImage,
      flag:            best.flag,
      confidence:      Math.min(confidence, 97),
      vibes,
      travelStyle,
      cities:          best.cities,
      ranked: ranked.slice(0, 3).map(r => ({
        id:     r.id,
        name:   r.name,
        flag:   r.flag,
        cities: r.cities,
      })),
    })

  } catch (err) {
    console.error("[explore-analyze] Error:", err)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
