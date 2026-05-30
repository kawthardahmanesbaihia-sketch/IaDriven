"use client"

import { useEffect, useState, Suspense } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import type { SquadType } from "@/lib/travel-data"
import { EventsSection } from "@/components/events-section"
import { WeatherSection } from "@/components/weather-section"
import { HolidayWarning } from "@/components/holiday-warning"
import { DestinationMap } from "@/components/destination-map"
import { getCountryCode, getCountryFlagUrl } from "@/lib/destination-image-generator"
import { generateCategoryImage } from "@/lib/category-image-generator"
import { fetchCountryImage } from "@/lib/country-image-generator"
import { ItineraryGenerator } from "@/components/ItineraryGenerator"
import { DestinationDashboard } from "@/components/destination/DestinationDashboard"

interface DestinationData {
  name: string
  matchPercentage: number
  image: string
  positives: string[]
  negatives: string[]
  hotels: Array<{
    name: string
    rating: number
    description: string
    price: string
    priceLevel: "budget" | "mid-range" | "luxury"
    address: string
    amenities: string[]
    image?: string
  }>
  restaurants: Array<{
    name: string
    rating: number
    cuisine: string
    description: string
    price: string
    priceLevel: "budget" | "mid-range" | "luxury"
    address: string
    image?: string
  }>
  activities: Array<{
    name: string
    duration: string
    description: string
    rating?: number
    image?: string
  }>
  mapMarkers?: Array<{
    id: string
    name: string
    type: "hotel" | "restaurant" | "attraction"
    location: { lat: number; lng: number }
    info: { rating?: number; price?: string; cuisine?: string }
  }>
}

const SQUAD_CONFIG: Record<SquadType, { label: string; emoji: string; tagline: string }> = {
  solo:    { label: "Solo",    emoji: "👤", tagline: "Your personal adventure awaits" },
  couple:  { label: "Couple",  emoji: "💑", tagline: "A romantic escape for two" },
  friends: { label: "Friends", emoji: "👥", tagline: "Epic memories with your crew" },
  family:  { label: "Family",  emoji: "👨‍👩‍👧",  tagline: "Fun for every generation" },
}

function DestinationPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const squad = ((searchParams.get("squad") as SquadType) || "solo")
  const squadConfig = SQUAD_CONFIG[squad] ?? SQUAD_CONFIG.solo
  // city is the selected city card (e.g. "Barcelona"). Falls back to country name.
  const city = searchParams.get("city") || ""

  const [destination, setDestination] = useState<DestinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [travelDates, setTravelDates] = useState<{ start: string; end: string } | null>(null)
  const [summary, setSummary] = useState<string | undefined>()

  const getBudgetFromStorage = (): string => {
    try {
      // Prefer the budget written by upload/single page after analysis
      const direct = sessionStorage.getItem("selectedBudget")
      if (direct) return direct

      const prefs = localStorage.getItem("single_mode_preferences")
      if (prefs) {
        const parsed = JSON.parse(prefs)
        return parsed.budget || "medium"
      }
    } catch {}
    return "medium"
  }

  useEffect(() => {
    const loadDestination = async () => {
      // The URL param is always the canonical country name — never allow stale
      // sessionStorage to override it. This prevents old sessions (e.g. Brazil)
      // from bleeding into a new selection (e.g. Spain).
      const countryNameFromUrl = decodeURIComponent(params.id as string)
      const isNumericIndex = !isNaN(parseInt(countryNameFromUrl, 10))

      const results = sessionStorage.getItem("analysisResults")
      const selectedCountryData = sessionStorage.getItem("selectedCountry")
      const dates = sessionStorage.getItem("travelDates")
      const budget = getBudgetFromStorage()

      let country: any = null
      let countryIndex = -1

      // Use sessionStorage ONLY when the stored name matches the URL — prevents
      // Brazil/stale data from overriding a freshly chosen Spain URL.
      if (selectedCountryData) {
        try {
          const selected = JSON.parse(selectedCountryData)
          const nameMatches = selected.name?.toLowerCase() === countryNameFromUrl.toLowerCase()
          if (nameMatches && selected.name) {
            country = selected
            countryIndex = selected.index ?? -1
          }
        } catch {}
      }

      // Fallback: search analysis results by the URL country name
      if (!country && results) {
        try {
          const parsed = JSON.parse(results)
          const countries = parsed.countries || []
          if (isNumericIndex) {
            const index = parseInt(countryNameFromUrl, 10)
            country = countries[index]
            countryIndex = index
          } else {
            const foundIndex = countries.findIndex(
              (c: any) => c.name.toLowerCase() === countryNameFromUrl.toLowerCase()
            )
            if (foundIndex >= 0) {
              country = countries[foundIndex]
              countryIndex = foundIndex
            }
          }
          if (parsed.summary) setSummary(parsed.summary)
        } catch {}
      }

      // Last resort: create a minimal stub so the API call can still run
      if (!country) {
        country = { name: countryNameFromUrl, matchPercentage: 0, image: "", tags: [], climate: "temperate" }
      }

      if (dates) {
        try {
          const parsedDates = JSON.parse(dates)
          setTravelDates({ start: parsedDates.start, end: parsedDates.end })
        } catch {}
      }

      try {
        const squadPreference = squad === "solo" ? "solo travel" : `${squad} travel`
        const detailsResponse = await fetch("/api/destination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryCode: country.code || getCountryCode(country.name) || "US",
            countryName: country.name,
            city: city || undefined,   // passes the selected city (e.g. "Barcelona")
            climate: country.climate || "temperate",
            activities: country.activities || [],
            userPreferences: [squadPreference, ...(country.tags || [])],
            budget,
            squad,
          }),
          cache: "no-store",
        })

        let details: any = {}
        if (detailsResponse.ok) {
          const detailsText = await detailsResponse.text()
          try {
            details = JSON.parse(detailsText)
          } catch {
            console.error("[destination] Non-JSON response from /api/destination:", detailsText.slice(0, 200))
          }
        }

        const [countryImg, hotelImg, restaurantImg, activityImg] = await Promise.all([
          fetchCountryImage(country.name),
          generateCategoryImage(country.name, "hotels"),
          generateCategoryImage(country.name, "restaurants"),
          generateCategoryImage(country.name, "activities"),
        ])

        setDestination({
          name: country.name,
          matchPercentage: Math.round(country.matchPercentage || 0),
          image: details.destinationImage || countryImg || country.image,
          positives: country.positives || ["Matches your travel preferences", "Great outdoor activities available", "Excellent local cuisine scene"],
          negatives: details.negatives || country.negatives || ["Can be crowded during peak seasons", "Limited public transportation in some areas", "Language barriers may exist"],
          hotels: (details.hotels || []).slice(0, 6).map((h: any, idx: number) => ({
            name: h.name,
            rating: h.rating || 4.5,
            description: h.description || "Great accommodation",
            price: h.price || "$$$",
            priceLevel: h.priceLevel || "luxury",
            address: h.address || "Unknown Address",
            amenities: h.amenities || [],
            image: h.image || (idx === 0 ? hotelImg : undefined),
          })),
          restaurants: (details.restaurants || []).slice(0, 6).map((r: any, idx: number) => ({
            name: r.name,
            rating: r.rating || 4.5,
            cuisine: r.cuisine || "International",
            description: r.description || "Great dining experience",
            price: r.price || "$$",
            priceLevel: r.priceLevel || "luxury",
            address: r.address || "Unknown Address",
            image: r.image || (idx === 0 ? restaurantImg : undefined),
          })),
          activities: (details.activities || []).slice(0, 6).map((a: any, idx: number) => ({
            name: a.title || a.name,
            duration: a.duration || "Half day",
            description: a.description || "Exciting activity",
            rating: a.rating,
            image: idx === 0 ? activityImg : undefined,
          })),
          mapMarkers: details.mapMarkers || generateMapMarkersFromData(
            details.hotels || [],
            details.restaurants || [],
            details.activities || [],
            country.name
          ),
        })
      } catch {
        setDestination({
          name: country.name,
          matchPercentage: Math.round(country.matchPercentage || 0),
          image: country.image,
          positives: country.positives || ["Matches your travel preferences", "Great outdoor activities available", "Excellent local cuisine scene"],
          negatives: country.negatives || ["Can be crowded during peak seasons", "Limited public transportation in some areas"],
          hotels: [{ name: "Hotel", rating: 4.5, description: "Great accommodation", price: "$$$", priceLevel: "luxury", address: "City Center, " + country.name, amenities: ["WiFi", "Restaurant", "Gym"], image: undefined }],
          restaurants: [{ name: "Restaurant", rating: 4.5, cuisine: "Local", description: "Great dining", price: "$$", priceLevel: "luxury", address: "City Center, " + country.name, image: undefined }],
          activities: [{ name: "Activity", duration: "Full day", description: "Exciting experience", image: undefined }],
        })
      }

      setLoading(false)
    }

    loadDestination()
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Sparkles className="h-10 w-10 text-green-500" />
          </motion.div>
          <p className="text-sm text-muted-foreground font-medium">Loading destination…</p>
        </div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Destination not found</p>
          <Button asChild>
            <Link href="/results">Back to Results</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DestinationDashboard
      destination={destination}
      summary={summary}
      squadLabel={squadConfig.label}
      squadEmoji={squadConfig.emoji}
      squadTagline={squadConfig.tagline}
      backHref="/results"
      backLabel="Back to Results"
      holidayWarning={
        travelDates ? (
          <HolidayWarning
            countryCode={getCountryCode(destination.name)}
            countryName={destination.name}
            startDate={new Date(travelDates.start)}
            endDate={new Date(travelDates.end)}
          />
        ) : undefined
      }
      weatherContent={
        travelDates ? (
          <WeatherSection
            country={destination.name}
            startDate={travelDates.start}
            endDate={travelDates.end}
          />
        ) : undefined
      }
      eventsContent={
        travelDates ? (
          <EventsSection
            country={destination.name}
            startDate={travelDates.start}
            endDate={travelDates.end}
            userPreferences={["culture", "food", "adventure"]}
          />
        ) : undefined
      }
      mapContent={
        destination.mapMarkers ? (
          <DestinationMap markers={destination.mapMarkers} countryName={destination.name} />
        ) : undefined
      }
      itineraryContent={
        <ItineraryGenerator
          destinationName={destination.name}
          hotels={destination.hotels}
          restaurants={destination.restaurants}
          activities={destination.activities}
          initialBudget={getBudgetFromStorage()}
          initialDates={travelDates ?? undefined}
        />
      }
    />
  )
}

export default function DestinationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              <Sparkles className="h-10 w-10 text-green-500" />
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium">Loading destination…</p>
          </div>
        </div>
      }
    >
      <DestinationPageInner />
    </Suspense>
  )
}

function generateMapMarkersFromData(
  hotels: any[],
  restaurants: any[],
  activities: any[],
  countryName: string
): Array<{
  id: string
  name: string
  type: "hotel" | "restaurant" | "attraction"
  location: { lat: number; lng: number }
  info: { rating?: number; price?: string; cuisine?: string }
}> {
  const markers: Array<{
    id: string
    name: string
    type: "hotel" | "restaurant" | "attraction"
    location: { lat: number; lng: number }
    info: { rating?: number; price?: string; cuisine?: string }
  }> = []

  const hash = countryName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const baseLat = 20 + (hash % 40)
  const baseLng = -20 + (hash % 80)

  hotels.slice(0, 3).forEach((hotel, index) => {
    markers.push({
      id: `hotel-${index}`,
      name: hotel.name || `Hotel ${index + 1}`,
      type: "hotel",
      location: { lat: baseLat + index * 0.01, lng: baseLng + index * 0.01 },
      info: { rating: hotel.rating || 4.5, price: hotel.price || "$$$" },
    })
  })

  restaurants.slice(0, 3).forEach((restaurant, index) => {
    markers.push({
      id: `restaurant-${index}`,
      name: restaurant.name || `Restaurant ${index + 1}`,
      type: "restaurant",
      location: { lat: baseLat + 0.02 + index * 0.01, lng: baseLng - 0.01 + index * 0.01 },
      info: { rating: restaurant.rating || 4.5, price: restaurant.price || "$$", cuisine: restaurant.cuisine || "Local" },
    })
  })

  activities.slice(0, 3).forEach((activity, index) => {
    markers.push({
      id: `activity-${index}`,
      name: activity.name || activity.title || `Activity ${index + 1}`,
      type: "attraction",
      location: { lat: baseLat - 0.01 + index * 0.02, lng: baseLng + 0.02 + index * 0.01 },
      info: { rating: activity.rating || 4.5 },
    })
  })

  return markers
}
