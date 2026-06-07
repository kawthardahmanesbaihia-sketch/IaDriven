/**
 * Startup environment validation.
 * Logs clear warnings/errors for missing env vars rather than silently failing.
 * Call validateEnv() at startup in any module that needs env awareness.
 */

interface EnvStatus {
  valid:    boolean
  missing:  string[]
  warnings: string[]
}

let _status: EnvStatus | null = null

const REQUIRED_FOR_AUTH = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const
const OPTIONAL_FEATURES = [
  { key: "GEMINI_API_KEY",              feature: "destination text summaries" },
  { key: "UNSPLASH_ACCESS_KEY",         feature: "image template library" },
  { key: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", feature: "maps and restaurant search" },
  { key: "HOTELBEDS_HOTELS_API_KEY",    feature: "hotel data" },
  { key: "OPENWEATHER_API_KEY",         feature: "weather forecasts" },
  { key: "HUGGINGFACE_API_KEY",         feature: "BLIP image captioning fallback" },
] as const

export function validateEnv(): EnvStatus {
  if (_status) return _status

  const missing:  string[] = []
  const warnings: string[] = []

  for (const key of REQUIRED_FOR_AUTH) {
    if (!process.env[key]) missing.push(key)
  }

  for (const { key, feature } of OPTIONAL_FEATURES) {
    if (!process.env[key]) {
      warnings.push(`${key} not set — ${feature} will be unavailable`)
    }
  }

  if (missing.length > 0) {
    console.error(
      `[ENV] CRITICAL: Missing required environment variables: ${missing.join(", ")}\n` +
      `      Authentication routes (login/signup) will not function without these.`
    )
  }

  for (const w of warnings) {
    console.warn(`[ENV] ${w}`)
  }

  if (missing.length === 0 && warnings.length === 0) {
    console.log("[ENV] All environment variables validated ✓")
  }

  _status = { valid: missing.length === 0, missing, warnings }
  return _status
}

/**
 * Assert a specific env var exists. Throws a clear error if missing.
 * Use in specific route handlers that cannot function without the var.
 */
export function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) {
    throw new Error(
      `[ENV] Required environment variable "${key}" is not set. ` +
      `This route cannot function without it.`
    )
  }
  return val
}
