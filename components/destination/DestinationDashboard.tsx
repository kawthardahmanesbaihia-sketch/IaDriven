"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DestinationSidebar, MobileBottomNav } from "./DestinationSidebar"
import { DestinationHero } from "./DestinationHero"
import { NavTabs } from "./NavTabs"
import { OverviewSection } from "./OverviewSection"
import { HotelsCarousel } from "./HotelsCarousel"
import { RestaurantsCarousel } from "./RestaurantsCarousel"
import { ActivitiesGrid } from "./ActivitiesGrid"
import { EventsPanel } from "./EventsPanel"
import { MapSection } from "./MapSection"
import { ItinerarySection } from "./ItinerarySection"
import { AIInsightBox } from "./AIInsightBox"

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

interface SquadEvent {
  title: string
  category: string
  date: string
  matchPct: number
  description?: string
}

interface SquadItineraryDay {
  day: number
  theme: string
  morning: string
  afternoon: string
  evening: string
  icon: string
}

interface DestinationDashboardProps {
  destination: DestinationData
  summary?: string
  squadTagline?: string
  squadLabel?: string
  squadEmoji?: string
  squadEvents?: SquadEvent[]
  squadItinerary?: SquadItineraryDay[]
  weatherBadge?: string
  backHref?: string
  backLabel?: string
  weatherContent?: ReactNode
  eventsContent?: ReactNode
  mapContent?: ReactNode
  itineraryContent?: ReactNode
  holidayWarning?: ReactNode
}

const SECTION_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export function DestinationDashboard({
  destination,
  summary,
  squadTagline,
  squadLabel,
  squadEmoji,
  squadEvents,
  squadItinerary,
  weatherBadge,
  backHref,
  backLabel,
  weatherContent,
  eventsContent,
  mapContent,
  itineraryContent,
  holidayWarning,
}: DestinationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return (
          <motion.div key="overview" {...SECTION_VARIANTS}>
            {holidayWarning && <div className="px-6 pt-6">{holidayWarning}</div>}
            <OverviewSection
              positives={destination.positives}
              negatives={destination.negatives}
              weatherContent={weatherContent}
            />
            <AIInsightBox
              destinationName={destination.name}
              summary={summary}
              positives={destination.positives}
            />
          </motion.div>
        )
      case "hotels":
        return (
          <motion.div key="hotels" {...SECTION_VARIANTS}>
            <HotelsCarousel hotels={destination.hotels} />
          </motion.div>
        )
      case "restaurants":
        return (
          <motion.div key="restaurants" {...SECTION_VARIANTS}>
            <RestaurantsCarousel restaurants={destination.restaurants} />
          </motion.div>
        )
      case "activities":
        return (
          <motion.div key="activities" {...SECTION_VARIANTS}>
            <ActivitiesGrid activities={destination.activities} />
          </motion.div>
        )
      case "events":
        return (
          <motion.div key="events" {...SECTION_VARIANTS}>
            <EventsPanel eventsContent={eventsContent} events={squadEvents} />
          </motion.div>
        )
      case "map":
        return (
          <motion.div key="map" {...SECTION_VARIANTS}>
            <MapSection mapContent={mapContent} markers={destination.mapMarkers} />
          </motion.div>
        )
      case "plan":
        return (
          <motion.div key="plan" {...SECTION_VARIANTS}>
            <ItinerarySection generatorContent={itineraryContent} travelDays={squadItinerary} />
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex bg-background min-h-screen">
      {/* Sidebar — sticky so it stays while page scrolls */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <DestinationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          destinationName={destination.name}
          backHref={backHref}
          backLabel={backLabel}
        />
      </div>

      {/* Main content — natural scroll */}
      <div className="flex-1 min-w-0">
        {/* Hero */}
        <DestinationHero
          name={destination.name}
          matchPercentage={destination.matchPercentage}
          image={destination.image}
          tagline={squadTagline}
          squadLabel={squadLabel}
          squadEmoji={squadEmoji}
          weatherBadge={weatherBadge}
        />

        {/* Tab bar — sticky under hero */}
        <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Section content */}
        <div className="pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
