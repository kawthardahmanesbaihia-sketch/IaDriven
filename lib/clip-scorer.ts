/**
 * Semantic CLIP Scoring Engine
 *
 * Pipeline per image:
 *   classifyImage(url, ALL_CONCEPT_LABELS)
 *     → per-label softmax scores
 *     → semantic category scoring (category-weighted aggregation)
 *     → contradiction detection (e.g. winter_arctic vs tropical_lush)
 *     → applyGeographicReasoning() (landmark + environment multipliers)
 *
 * Multi-image: scores accumulated with recency weighting, then normalised.
 *
 * Key upgrade over the previous system:
 *   Each destination's score is now the WEIGHTED SUM of per-category scores,
 *   where landmark matches (weight 3.5) dominate over generic matches (weight 1.0).
 *   This prevents a destination from winning purely on volume of generic phrases.
 */

import { classifyImage, warmTextEmbeddings, type LabelScore } from "./clip-service"
import {
  DEST_CATEGORY_CONCEPTS,
  ALL_CONCEPT_LABELS,
  LABEL_TO_DEST,
  LABEL_TO_CATEGORY,
  DEST_PHRASE_COUNT,
  CATEGORY_WEIGHTS,
  CATEGORY_CONTRADICTIONS,
} from "./destination-knowledge-base"
import { EXPLORE_DESTINATIONS, type RankedDestination } from "./explore-destinations"
import {
  applyGeographicReasoning,
  logReasoningDebug,
  type ReasoningResult,
} from "./geo-reasoning-engine"
import { getImageCacheStats } from "./performance-cache"

// ── Startup diagnostics ───────────────────────────────────────────────────────

let _startupLogged = false

function logStartupDiagnostics(): void {
  if (_startupLogged) return
  _startupLogged = true

  const destIds     = Object.keys(DEST_CATEGORY_CONCEPTS)
  const totalPhrases= ALL_CONCEPT_LABELS.length
  const destCount   = destIds.length

  // Detect duplicate phrases (same phrase registered for more than one dest)
  const seen = new Map<string, string>()
  let dupes = 0
  for (const phrase of ALL_CONCEPT_LABELS) {
    if (seen.has(phrase)) dupes++
    else seen.set(phrase, LABEL_TO_DEST[phrase] ?? "?")
  }

  console.log(`\n${"═".repeat(60)}`)
  console.log(`[Performance] Knowledge Base`)
  console.log(`  Destinations : ${destCount}`)
  console.log(`  Total phrases: ${totalPhrases}`)
  console.log(`  Phrase dupes : ${dupes}`)
  console.log(`  Avg / dest   : ${(totalPhrases / Math.max(destCount, 1)).toFixed(1)}`)
  console.log(`  Image cache  : max ${getImageCacheStats().maxSize} entries`)
  console.log(`${"═".repeat(60)}\n`)
}

export async function prewarmTextEmbeddings(): Promise<void> {
  logStartupDiagnostics()
  await warmTextEmbeddings(ALL_CONCEPT_LABELS)
}

// ── Squad bonus table ─────────────────────────────────────────────────────────

const SQUAD_BONUS: Record<string, Record<string, number>> = {
  solo: {
    japan: 4, vietnam: 4, morocco: 3, thailand: 3, india: 3, bali: 2, greece: 2, spain: 2,
    newzealand: 2, jordan: 2, france: 1, italy: 1, switzerland: 1, iceland: 5, norway: 4,
    southafrica: 4, finland: 5, sweden: 4, canada: 4, kenya: 4, tanzania: 4, australia: 3,
    portugal: 3, turkey: 2, egypt: 2, peru: 4, southkorea: 4, singapore: 2, netherlands: 2,
    croatia: 3, nepal: 5, mexico: 3, cuba: 3, costarica: 4, botswana: 4, namibia: 4,
    mongolia: 5, georgia: 3, armenia: 3, bhutan: 5, alaska: 4, greenland: 4,
  },
  couple: {
    maldives: 8, seychelles: 8, greece: 5, france: 5, italy: 5, bali: 5, switzerland: 3,
    dubai: 3, spain: 3, japan: 2, thailand: 2, borabora: 8, fiji: 5, mauritius: 6,
    norway: 3, southafrica: 2, finland: 3, sweden: 3, canada: 2, kenya: 3, tanzania: 4,
    australia: 3, portugal: 4, turkey: 3, peru: 2, southkorea: 2, singapore: 3,
    netherlands: 3, croatia: 4, mexico: 3, cuba: 3, costarica: 2, botswana: 3,
  },
  friends: {
    spain: 6, thailand: 5, greece: 4, vietnam: 4, bali: 3, morocco: 3, india: 2, japan: 2,
    italy: 2, dubai: 2, france: 1, newzealand: 3, switzerland: 1, iceland: 4, norway: 3,
    southafrica: 5, finland: 3, sweden: 3, canada: 5, kenya: 5, tanzania: 5, australia: 4,
    portugal: 4, turkey: 3, egypt: 3, peru: 3, southkorea: 4, singapore: 4, netherlands: 3,
    croatia: 4, nepal: 3, mexico: 5, cuba: 5, costarica: 4, botswana: 4, namibia: 3,
    hongkong: 4, colombia: 4, jamaica: 4,
  },
  family: {
    italy: 4, japan: 3, france: 3, switzerland: 3, dubai: 2, spain: 2, greece: 2,
    thailand: 2, bali: 1, vietnam: 1, india: 1, newzealand: 2,
    iceland: 3, norway: 3, southafrica: 3, finland: 3, sweden: 3, canada: 5,
    kenya: 3, tanzania: 3, australia: 5, portugal: 3, turkey: 2, egypt: 2,
    peru: 2, southkorea: 3, singapore: 4, netherlands: 3, croatia: 3, mexico: 3,
    costarica: 4, botswana: 3, unitedstates: 4,
  },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryScore {
  category:   string
  rawScore:   number   // mean phrase score for this category
  weighted:   number   // rawScore × CATEGORY_WEIGHTS[category]
  topPhrase:  string
  topPhraseScore: number
}

interface PerImageScores {
  destScores:          Record<string, number>
  destCategoryScores:  Record<string, Record<string, CategoryScore>>
  globalCategoryScores:Record<string, number>   // category → mean across all dests
  activatedCategories: string[]                  // categories significantly above baseline
  topLabels:           Record<string, string>
  rawLabelScores:      LabelScore[]
  imageUrl:            string
}

// ── Per-image semantic scoring ────────────────────────────────────────────────

async function scoreOneImage(imageUrl: string): Promise<PerImageScores> {
  const t0 = Date.now()
  const labelScores: LabelScore[] = await classifyImage(imageUrl, ALL_CONCEPT_LABELS)
  const tClassify = Date.now() - t0
  console.log(`[CLIP] Classified ${labelScores.length} phrases in ${tClassify}ms — ${imageUrl.substring(0, 70)}`)

  // Build O(1) score lookup
  const tScore0 = Date.now()
  const scoreMap: Record<string, number> = {}
  for (const ls of labelScores) scoreMap[ls.label] = ls.score

  // ── Stage 1: Coarse candidate selection via LABEL_TO_DEST ─────────────────
  // Scan top-150 labels to find which destinations have relevant phrases.
  // Non-candidate destinations (none of their phrases in top-150) score near-zero
  // in practice and are safely approximated as 0.
  const candidateSet = new Set<string>()
  for (const ls of labelScores.slice(0, 150)) {
    const d = LABEL_TO_DEST[ls.label]
    if (d) candidateSet.add(d)
  }
  // Always include every destination — fall through to full scoring.
  // Destinations absent from top-150 will have a near-zero total anyway.
  const allDestIds = Object.keys(DEST_CATEGORY_CONCEPTS)

  // ── Stage 2: Category-weighted scoring per destination ────────────────────
  const destScores: Record<string, number> = {}
  const destCategoryScores: Record<string, Record<string, CategoryScore>> = {}
  const topLabels: Record<string, string> = {}

  for (const destId of allDestIds) {
    const categories = DEST_CATEGORY_CONCEPTS[destId]
    // Fast path: skip full loop for non-candidates; assign 0
    if (!candidateSet.has(destId)) {
      destScores[destId]         = 0
      destCategoryScores[destId] = {}
      topLabels[destId]          = ""
      continue
    }

    let totalWeightedScore = 0
    const catScores: Record<string, CategoryScore> = {}
    let bestPhrase = ""
    let bestScore  = 0

    for (const [category, phrases] of Object.entries(categories)) {
      if (phrases.length === 0) continue
      const weight   = CATEGORY_WEIGHTS[category] ?? 1.0
      let sum        = 0
      let catTop     = phrases[0]
      let catTopScore= 0

      for (const phrase of phrases) {
        const s = scoreMap[phrase] ?? 0
        sum += s
        if (s > catTopScore) { catTopScore = s; catTop = phrase }
      }

      const rawScore   = sum / phrases.length
      const weighted   = rawScore * weight

      catScores[category] = { category, rawScore, weighted, topPhrase: catTop, topPhraseScore: catTopScore }
      totalWeightedScore += weighted

      if (catTopScore > bestScore) { bestScore = catTopScore; bestPhrase = catTop }
    }

    destScores[destId]         = totalWeightedScore
    destCategoryScores[destId] = catScores
    topLabels[destId]          = bestPhrase
  }
  console.log(`[Timing] Category scoring: ${Date.now() - tScore0}ms (${candidateSet.size}/${allDestIds.length} candidates)`)

  // ── Step 2: Global category scores (mean across all dests) ───────────────
  const globalCategoryScores: Record<string, number> = {}
  const catAccum: Record<string, { sum: number; count: number }> = {}

  for (const catMap of Object.values(destCategoryScores)) {
    for (const cs of Object.values(catMap)) {
      if (!catAccum[cs.category]) catAccum[cs.category] = { sum: 0, count: 0 }
      catAccum[cs.category].sum   += cs.rawScore
      catAccum[cs.category].count += 1
    }
  }
  for (const [cat, acc] of Object.entries(catAccum)) {
    globalCategoryScores[cat] = acc.count > 0 ? acc.sum / acc.count : 0
  }

  // ── Step 3: Detect activated categories ──────────────────────────────────
  // A category is "activated" if its global score is ≥ 1.8× the mean
  const catValues  = Object.values(globalCategoryScores)
  const catMean    = catValues.reduce((a, b) => a + b, 0) / Math.max(catValues.length, 1)
  const ACTIVATION_THRESHOLD = catMean * 1.8

  const activatedCategories = Object.entries(globalCategoryScores)
    .filter(([, s]) => s >= ACTIVATION_THRESHOLD)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat)

  // ── Step 4: Contradiction suppression ────────────────────────────────────
  const catRankMap: Record<string, number> = {}
  activatedCategories.forEach((cat, i) => { catRankMap[cat] = i })

  for (const contradiction of CATEGORY_CONTRADICTIONS) {
    const dominantRank = catRankMap[contradiction.dominant]
    if (dominantRank === undefined) continue   // not activated
    const isTopContradiction = dominantRank < 3  // top-3 categories only

    if (isTopContradiction) {
      for (const incompatDest of contradiction.incompatible) {
        if (destScores[incompatDest] !== undefined) {
          const before = destScores[incompatDest]
          destScores[incompatDest] *= contradiction.penaltyMultiplier
          console.log(
            `[Semantic] Contradiction: ${contradiction.dominant} activated → penalise ${incompatDest} ` +
            `${before.toFixed(4)} → ${destScores[incompatDest].toFixed(4)}`
          )
        }
      }
    }
  }

  // ── Structured semantic logs ──────────────────────────────────────────────
  const top10Labels = labelScores.slice(0, 10)
    .map(ls => `"${ls.label.substring(0, 45)}"(${ls.score.toFixed(4)})`)
  console.log(`[CLIP] Top labels: ${top10Labels.join(" | ")}`)

  if (activatedCategories.length > 0) {
    const catLog = activatedCategories.slice(0, 6)
      .map(cat => `${cat}=${globalCategoryScores[cat].toFixed(5)}`)
    console.log(`[Semantic] Activated categories: ${catLog.join(" | ")}`)
  }

  const topDests = Object.entries(destScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, s]) => `${id}(${s.toFixed(4)},"${topLabels[id]?.substring(0, 35)}")`)
  console.log(`[CountryScores] Pre-reasoning top-5: ${topDests.join(" | ")}`)

  return {
    destScores,
    destCategoryScores,
    globalCategoryScores,
    activatedCategories,
    topLabels,
    rawLabelScores: labelScores,
    imageUrl,
  }
}

// ── Geographic reasoning ──────────────────────────────────────────────────────

function applyReasoningToImage(pi: PerImageScores): ReasoningResult {
  const destIds  = Object.keys(DEST_CATEGORY_CONCEPTS)
  const reasoning = applyGeographicReasoning(pi.destScores, pi.rawLabelScores, destIds)

  for (const destId of destIds) {
    pi.destScores[destId] = (pi.destScores[destId] ?? 0) * (reasoning.multipliers[destId] ?? 1.0)
  }

  const topAfter = Object.entries(pi.destScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, s]) => `${id}(${s.toFixed(4)})`)
  console.log(`[Reasoning] Post-reasoning top-5: ${topAfter.join(" | ")}`)

  return reasoning
}

// ── Multi-image aggregation ───────────────────────────────────────────────────

function aggregateScores(perImage: PerImageScores[]): Record<string, number> {
  const totals: Record<string, number> = {}
  let totalWeight = 0

  for (let i = 0; i < perImage.length; i++) {
    const weight = 1 + i * 0.1   // image 1=1.0×, image 2=1.1×, image 5=1.4×
    totalWeight += weight
    for (const [destId, score] of Object.entries(perImage[i].destScores)) {
      totals[destId] = (totals[destId] ?? 0) + score * weight
    }
  }
  for (const id of Object.keys(totals)) {
    totals[id] /= totalWeight
  }
  return totals
}

// ── Score normalisation ───────────────────────────────────────────────────────

function normaliseScores(raw: Record<string, number>): Record<string, number> {
  const values = Object.values(raw)
  const max    = Math.max(...values)
  const min    = Math.min(...values)
  const range  = max - min
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = range > 0 ? ((v - min) / range) * 100 : 50
  }
  return out
}

// ── Confidence ────────────────────────────────────────────────────────────────

function computeConfidence(ranked: { score: number }[]): number {
  const top    = ranked[0]?.score ?? 0
  const second = ranked[1]?.score ?? 0
  const gap    = top - second
  return Math.round(Math.min(96, Math.max(55, top * 0.72 + gap * 0.5)))
}

// ── Explainable reasoning bullets ────────────────────────────────────────────

function buildExplanation(
  destId: string,
  perImage: PerImageScores[],
  reasoningResults: ReasoningResult[],
): string[] {
  const dest    = EXPLORE_DESTINATIONS[destId]
  const bullets: string[] = []

  // Landmark match
  for (const r of reasoningResults) {
    const lmMatch = r.debug.landmarkMatches.find(m => m.toLowerCase().includes(destId))
    if (lmMatch) {
      const landmarkName = lmMatch.split(" (phrase:")[0]
      bullets.push(`Landmark detected: ${landmarkName}`)
      break
    }
  }

  // Best category activation
  const bestCatEntries: Array<{ category: string; score: number; phrase: string }> = []
  for (const pi of perImage) {
    const catMap = pi.destCategoryScores[destId]
    if (!catMap) continue
    for (const cs of Object.values(catMap)) {
      if (cs.weighted > 0) {
        bestCatEntries.push({ category: cs.category, score: cs.weighted, phrase: cs.topPhrase })
      }
    }
  }
  bestCatEntries.sort((a, b) => b.score - a.score)

  const topEntry = bestCatEntries[0]
  if (topEntry && bullets.length === 0) {
    const catLabel = topEntry.category.replace(/_/g, " ")
    bullets.push(`Strong visual match: ${catLabel} — "${topEntry.phrase}"`)
  } else if (topEntry) {
    const catLabel = topEntry.category.replace(/_/g, " ")
    bullets.push(`Also matched: ${catLabel}`)
  }

  // Second category
  const secondEntry = bestCatEntries.find(e => e.category !== topEntry?.category)
  if (secondEntry && bullets.length < 3) {
    const catLabel = secondEntry.category.replace(/_/g, " ")
    bullets.push(`Visual signal: ${catLabel}`)
  }

  // Destination profile bullets
  if (dest) {
    if (dest.scores.nature > 88)   bullets.push(`${dest.name} offers world-class natural scenery`)
    if (dest.scores.cultural > 90) bullets.push(`Rich cultural heritage matches your selections`)
    if (dest.scores.beach > 88)    bullets.push(`Exceptional beaches align with your visual choices`)
    if (dest.environmentTypes.some(e => ["savanna", "wildlife"].includes(e)))
      bullets.push(`Wildlife and safari experiences match your images`)
    if (dest.environmentTypes.some(e => ["aurora", "northern-lights"].includes(e)))
      bullets.push(`Northern Lights and Arctic scenery fit your visual mood`)
  }

  return bullets.slice(0, 4)
}

// ── Vibes extraction ──────────────────────────────────────────────────────────

function extractVibes(perImage: PerImageScores[], topDestId: string): string[] {
  // Use the top-activated semantic categories as vibes
  const catCount: Record<string, number> = {}
  for (const pi of perImage) {
    for (const cat of pi.activatedCategories) {
      catCount[cat] = (catCount[cat] ?? 0) + 1
    }
  }

  const CATEGORY_TO_VIBE: Record<string, string> = {
    winter_arctic:        "aurora / arctic adventure",
    wildlife_fauna:       "wildlife safari",
    seasonal_spectacle:   "seasonal natural spectacle",
    coastal_marine:       "tropical beach & ocean",
    tropical_lush:        "tropical jungle & rainforest",
    ancient_ruins:        "ancient civilisations",
    volcanic_geothermal:  "volcanic & geothermal",
    desert_arid:          "desert adventure",
    luxury_premium:       "luxury travel",
    nightlife_urban:      "city nightlife",
    landmarks:            "iconic landmarks",
    spiritual_religious:  "cultural & spiritual",
    adventure_extreme:    "adventure & extreme sports",
    urban_environment:    "modern city life",
    natural_landscapes:   "dramatic natural landscapes",
    water_features:       "waterfalls & glacial lakes",
    cultural_traditional: "vibrant local culture",
  }

  const vibes = Object.entries(catCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat]) => CATEGORY_TO_VIBE[cat] ?? cat.replace(/_/g, " "))

  if (vibes.length === 0) {
    const dest = EXPLORE_DESTINATIONS[topDestId]
    return dest?.travelStyles.slice(0, 3) ?? ["adventure", "cultural", "nature"]
  }
  return vibes
}

// ── Confidence debug log ──────────────────────────────────────────────────────

function logConfidenceDebug(ranked: RankedDestination[], confidence: number): void {
  console.log(`\n[Confidence]`)
  console.log(`  Final confidence: ${confidence}%`)
  console.log(`  Top-3 scores: ${ranked.slice(0, 3).map(r => `${r.id}(${r.score.toFixed(1)})`).join(" > ")}`)
  const gap = (ranked[0]?.score ?? 0) - (ranked[1]?.score ?? 0)
  console.log(`  Score gap #1–#2: ${gap.toFixed(1)} pts`)
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface CLIPRankingResult {
  ranked:       RankedDestination[]
  confidence:   number
  vibes:        string[]
  travelStyle:  string
  imageCount:   number
  processingMs: number
}

export async function rankDestinationsByCLIP(
  imageUrls: string[],
  squad?: "solo" | "couple" | "friends" | "family"
): Promise<CLIPRankingResult> {
  const t0   = Date.now()
  const urls = imageUrls.slice(0, 5).filter(Boolean)
  if (urls.length === 0) throw new Error("No image URLs provided")

  // ── Score each image in parallel ──────────────────────────────────────────
  const tEmbed = Date.now()
  const perImageResults = await Promise.all(urls.map(scoreOneImage))
  console.log(`[Timing] Image embedding + scoring (all ${urls.length} images parallel): ${Date.now() - tEmbed}ms`)

  // ── Apply geographic reasoning per image ──────────────────────────────────
  const tReason = Date.now()
  const reasoningResults: ReasoningResult[] = perImageResults.map(pi => applyReasoningToImage(pi))
  logReasoningDebug(reasoningResults, urls.length)
  console.log(`[Timing] Geographic reasoning: ${Date.now() - tReason}ms`)

  // ── Aggregate ──────────────────────────────────────────────────────────────
  const tAgg = Date.now()
  const aggregated = aggregateScores(perImageResults)

  console.log(`[Timing] Aggregation: ${Date.now() - tAgg}ms`)

  const topAgg = Object.entries(aggregated)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, s]) => `${id}=${s.toFixed(5)}`)
  console.log(`[CLIP-scorer] Aggregated (post-reasoning, top-8): ${topAgg.join(" | ")}`)

  // ── Normalise ──────────────────────────────────────────────────────────────
  const normalised = normaliseScores(aggregated)

  // ── Squad bonus ────────────────────────────────────────────────────────────
  if (squad && SQUAD_BONUS[squad]) {
    for (const destId of Object.keys(normalised)) {
      normalised[destId] += SQUAD_BONUS[squad][destId] ?? 0
    }
  }

  // ── Build RankedDestination[] ─────────────────────────────────────────────
  const sortedIds = Object.entries(normalised)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)

  const ranked: RankedDestination[] = sortedIds.map(destId => {
    const dest  = EXPLORE_DESTINATIONS[destId]
    const score = normalised[destId]
    if (!dest) return null as unknown as RankedDestination

    const explanation = buildExplanation(destId, perImageResults, reasoningResults)

    return {
      id:        dest.id,
      name:      dest.name,
      flag:      dest.flag,
      heroImage: dest.heroImage,
      score,
      cities:    dest.cities,
      explanation,
      scoreBreakdown: {
        environment:  Math.round(score * 0.30),
        activities:   Math.round(score * 0.20),
        climate:      Math.round(score * 0.15),
        travelStyle:  Math.round(score * 0.10),
        mood:         Math.round(score * 0.10),
        terrain:      Math.round(score * 0.05),
        cityStyle:    Math.round(score * 0.03),
        architecture: Math.round(score * 0.03),
        food:         Math.round(score * 0.02),
        landmark: 0, region: 0, cultural: 0, emotional: 0, numeric: 0, penalty: 0,
      },
    }
  }).filter(Boolean)

  const confidence  = computeConfidence(ranked)
  const topDest     = ranked[0]
  const vibes       = extractVibes(perImageResults, topDest?.id ?? "")
  const travelStyle = EXPLORE_DESTINATIONS[topDest?.id ?? ""]?.travelStyles[0] ?? "adventure"

  logConfidenceDebug(ranked, confidence)

  const processingMs = Date.now() - t0
  console.log(
    `[Pipeline] Source=CLIP_SEMANTIC | images=${urls.length} | ${processingMs}ms | conf=${confidence}% | ` +
    `top3: ${ranked.slice(0, 3).map((r, i) => `#${i + 1} ${r.name}(${r.score.toFixed(1)})`).join(" | ")}`
  )

  return { ranked, confidence, vibes, travelStyle, imageCount: urls.length, processingMs }
}
