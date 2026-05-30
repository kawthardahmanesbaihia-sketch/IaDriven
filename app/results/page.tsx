"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { DestinationHeroSection } from "@/components/destination-hero-section"
import type { SquadType } from "@/lib/travel-data"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { generateCategoryImage } from "@/lib/category-image-generator"
import { fetchCountryImages } from "@/lib/country-image-generator"
import { useTaste } from "@/hooks/useTaste"
import { usePackages, getTopMatches } from "@/hooks/usePackages"
import { PackageCard } from "@/components/PackageCard"

interface AnalysisResults {
  countries: Array<{
    name: string
    matchPercentage: number
    reason: string
    image: string
    tags: string[]
    climate: string
    vibe: string
  }>
  summary: string
}

const squad: SquadType = "solo"
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "21 days"]

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [maxBudget, setMaxBudget] = useState<number | "">("")
  const [durationFilter, setDurationFilter] = useState<string>("")
  const { loadTasteProfile } = useTaste()
  const { packages } = usePackages()
  const [tasteProfile, setTasteProfile] = useState<ReturnType<typeof loadTasteProfile>>(null)

  useEffect(() => {
    setTasteProfile(loadTasteProfile())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const storedResults = sessionStorage.getItem("analysisResults")
      if (storedResults) {
        try {
          const parsed = JSON.parse(storedResults)

          if (parsed.countries) {
            const countryNames = parsed.countries.map((c: any) => c.name)
            const countryImages = await fetchCountryImages(countryNames)

            setResults({
              ...parsed,
              countries: parsed.countries.map((c: any) => ({
                ...c,
                image: countryImages[c.name] || c.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
              })),
            })
          } else if (parsed.suggestedCountry) {
            const imgUrl = await generateCategoryImage(parsed.suggestedCountry.name, "city")
            setResults({
              countries: [{
                name: parsed.suggestedCountry.name,
                matchPercentage: parsed.suggestedCountry.confidence * 100,
                reason: parsed.summary,
                image: imgUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
                tags: parsed.inferredFromImages || [],
                climate: "Temperate",
                vibe: "Cultural",
              }],
              summary: parsed.summary,
            })
          }
        } catch (error) {
          console.error("Error parsing results:", error)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Effective index: fall back to first destination until user makes a selection
  const effectiveIndex = selectedCountry ?? 0
  // Used only for package filtering — null means "no explicit selection yet"
  const selectedCountryName = selectedCountry !== null ? (results?.countries[selectedCountry]?.name ?? null) : null

  const filteredPackages = packages.filter(pkg => {
    if (selectedCountryName && pkg.destination.toLowerCase() !== selectedCountryName.toLowerCase()) return false
    if (maxBudget !== "" && pkg.price > maxBudget) return false
    if (durationFilter && pkg.duration !== durationFilter) return false
    return true
  })
  const packageRecommendations = tasteProfile
    ? getTopMatches(filteredPackages.length > 0 ? filteredPackages : packages, tasteProfile, 6)
    : []
  const displayPackages = filteredPackages.length > 0 ? filteredPackages.slice(0, 6) : packageRecommendations

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No results found. Please try again.</p>
          <Button asChild>
            <Link href="/explore">Start Over</Link>
          </Button>
        </div>
      </div>
    )
  }

  const activeCountry = results.countries[effectiveIndex]

  return (
    <div className="relative min-h-screen">
      <AnimatedBackgroundElements />

      {/* Full-width cinematic hero */}
      <div className="relative z-10">
        <DestinationHeroSection
          countries={results.countries}
          selectedCountry={effectiveIndex}
          onCountrySelect={(index) => {
            setSelectedCountry(index)
            try {
              const key = "exploredDestinations"
              const prev = JSON.parse(localStorage.getItem(key) || "[]") as string[]
              const next = [...prev, results.countries[index]?.name].filter(Boolean).slice(-100)
              localStorage.setItem(key, JSON.stringify(next))
            } catch {}
          }}
          renderExploreButton={(country, index, city) => (
            <motion.div whileHover={{ x: 6 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-full px-8 py-6 text-base font-semibold"
              >
                <Link
                  href={`/destination/${encodeURIComponent(country.name)}?squad=${squad}&city=${encodeURIComponent(city)}`}
                  onClick={() => {
                    sessionStorage.setItem(
                      "selectedCountry",
                      JSON.stringify({
                        index,
                        name: country.name,
                        city,
                        climate: country.climate,
                        vibe: country.vibe,
                        matchPercentage: country.matchPercentage,
                        image: country.image,
                        tags: country.tags,
                        timestamp: Date.now(),
                      })
                    )
                  }}
                  className="flex items-center gap-3"
                >
                  Explore {city}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          )}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-10 space-y-8">

        {/* Action Buttons */}
        {activeCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-6">
              <h3 className="text-xl font-bold mb-1">Plan Your Trip to {activeCountry.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Dive deeper into your destination or create a personalised itinerary.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/itinerary">
                    <Calendar className="mr-2 h-5 w-5" />
                    Generate Day-by-Day Itinerary
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link href={`/destination/${encodeURIComponent(activeCountry.name)}?squad=${squad}`}>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Full Destination Guide
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Why These Destinations */}
        {results.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 bg-gradient-to-br from-primary/10 via-card/50 to-card/50 p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold">Why These Destinations?</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{results.summary}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Available Travel Packages */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Available Travel Packages</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedCountryName
                      ? `Showing packages for ${selectedCountryName}`
                      : "Packages matched to your travel preferences"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={durationFilter}
                    onChange={e => setDurationFilter(e.target.value)}
                    className="text-sm border rounded px-2 py-1 bg-background"
                  >
                    <option value="">Any duration</option>
                    {DURATIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Max budget $"
                    value={maxBudget}
                    onChange={e => setMaxBudget(e.target.value === "" ? "" : Number(e.target.value))}
                    className="text-sm border rounded px-2 py-1 bg-background w-32"
                    min={0}
                  />
                  {(durationFilter || maxBudget !== "") && (
                    <button
                      type="button"
                      onClick={() => { setDurationFilter(""); setMaxBudget("") }}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {displayPackages.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {displayPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      showMatchScore={!selectedCountryName}
                      onBook={(bookedPkg) => {
                        console.log("Booking package:", bookedPkg)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No packages match your current filters. Try adjusting the budget or duration.
                </p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pt-2"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/explore">Try Again</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
