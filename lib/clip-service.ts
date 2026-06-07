/**
 * CLIP Service — singleton model management for @xenova/transformers
 *
 * Uses Xenova/clip-vit-base-patch32 (quantized ~87 MB).
 * Model is downloaded once, cached to .cache/transformers, and held in memory
 * for the lifetime of the Node.js process.
 *
 * Cross-modal note: Both text and image embeddings come out of CLIP's shared
 * 512-dim projection space, so cosine similarity between them is meaningful
 * (higher = image content matches that text description).
 */

import { pipeline, env } from "@xenova/transformers"

// ── Model configuration ───────────────────────────────────────────────────────

env.allowRemoteModels = true
// Writable in dev; Vercel Lambda uses /tmp
env.cacheDir = process.env.TRANSFORMERS_CACHE ?? "./.cache/transformers"

const MODEL = "Xenova/clip-vit-base-patch32"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LabelScore {
  label: string
  score: number
}

type ClassificationPipeline = (
  image: string,
  labels: string[],
  options?: Record<string, unknown>
) => Promise<LabelScore[]>

// ── Singleton state ───────────────────────────────────────────────────────────

let _classifier: ClassificationPipeline | null = null
let _initPromise: Promise<ClassificationPipeline> | null = null

function buildInitPromise(): Promise<ClassificationPipeline> {
  console.log("[CLIP] Loading model — this may take a moment on first run…")
  return pipeline("zero-shot-image-classification", MODEL, {
    quantized: true,
  } as Record<string, unknown>).then(p => {
    console.log("[CLIP] Model ready")
    _classifier = p as unknown as ClassificationPipeline
    return _classifier
  })
}

export async function getClassifier(): Promise<ClassificationPipeline> {
  if (_classifier) return _classifier
  if (!_initPromise) _initPromise = buildInitPromise()
  return _initPromise
}

/**
 * Start loading the model in the background so it's warm before the first
 * user request.  Safe to call multiple times — only loads once.
 */
export function prewarm(): void {
  if (!_classifier && !_initPromise) {
    _initPromise = buildInitPromise().catch(err => {
      console.error("[CLIP] Pre-warm failed:", err)
      _initPromise = null
      throw err
    })
  }
}

// ── Text-embedding cache ──────────────────────────────────────────────────────

let _textEmbeddingsWarmed = false

/**
 * Pre-compute text embeddings for all concept labels.
 * Call this once after prewarm() to eliminate the ~200-500ms penalty on the
 * first real inference request.  Subsequent requests reuse the internal cache.
 */
export async function warmTextEmbeddings(labels: string[]): Promise<void> {
  if (_textEmbeddingsWarmed) return
  try {
    const t0 = Date.now()
    const clf = await getClassifier()
    // 1×1 transparent GIF — minimal image, maximum label throughput
    const TINY = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    await clf(TINY, labels)
    _textEmbeddingsWarmed = true
    console.log(`[CLIP] Text encoder warmed: ${labels.length} labels pre-computed in ${Date.now() - t0}ms`)
  } catch (e) {
    console.warn("[CLIP] Text embedding warmup skipped (will warm on first real request):", String(e))
  }
}

// ── Image classification ──────────────────────────────────────────────────────

/**
 * Run CLIP zero-shot classification for one image against a set of text labels.
 *
 * @param imageUrl  Publicly reachable URL (or data: URI).
 *                  Unsplash URLs are transformed to 336px thumbnails to speed
 *                  up download — CLIP resizes to 224px internally anyway.
 * @param labels    Text descriptions to score the image against.
 * @returns         Array sorted by score descending.
 */
export async function classifyImage(
  imageUrl: string,
  labels: string[]
): Promise<LabelScore[]> {
  const classifier = await getClassifier()
  // Resize Unsplash source to 336px for fast download; CLIP will resize to 224px
  const url = imageUrl.includes("unsplash.com")
    ? imageUrl.replace(/[?&]w=\d+/, "").replace(/[?&]q=\d+/, "").replace(/\??$/, "?w=336&q=75")
    : imageUrl

  const results = await classifier(url, labels)
  const sorted = Array.isArray(results) ? results : []

  // Debug: log top-10 raw CLIP labels so we can see what the model "sees"
  const top10 = sorted.slice(0, 10).map(l => `"${l.label}"=${l.score.toFixed(4)}`).join(", ")
  console.log(`[CLIP-labels] Top-10 for ${url.substring(0, 70)}: ${top10}`)

  return sorted
}

// ── Cosine similarity utility (for raw Float32Array embeddings if needed) ─────

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : Math.max(-1, Math.min(1, dot / denom))
}
