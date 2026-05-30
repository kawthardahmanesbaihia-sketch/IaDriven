"use client"

import { motion } from "framer-motion"
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface Restaurant {
  name: string
  rating: number
  cuisine: string
  description: string
  price: string
  priceLevel: "budget" | "mid-range" | "luxury"
  address: string
  image?: string
}

/* Light & dark variants — matched to travel-data cuisine strings */
const CUISINE_TAGS: Record<string, string> = {
  // Japanese
  "Japanese":              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Innovative Japanese":   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Ramen":                 "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Izakaya":               "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Sushi Conveyor":        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Japanese with Entertainment": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  // French / European
  "French":                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "French-Balinese":       "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "French-Moroccan":       "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Fine Dining":           "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Italian":               "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Italian-Mediterranean": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  // Asian
  "Thai":                  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Thai Street Food":      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Balinese":              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Seafood":               "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  // Moroccan / African
  "Moroccan":              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Contemporary Moroccan": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Moroccan Street Food":  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  // Generic
  "Street Food":           "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Local":                 "bg-muted text-muted-foreground",
}
const DEFAULT_TAG = "bg-muted text-muted-foreground"

export function RestaurantsCarousel({ restaurants }: { restaurants: Restaurant[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -296 : 296, behavior: "smooth" })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Must-Try Restaurants</h2>
          <p className="text-sm text-muted-foreground">{restaurants.length} places curated for you</p>
        </div>
        <div className="flex gap-1">
          {(["left", "right"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
            >
              {dir === "left"
                ? <ChevronLeft className="w-4 h-4 text-foreground" />
                : <ChevronRight className="w-4 h-4 text-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {restaurants.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 px-2">No restaurant data available.</p>
        )}
        {restaurants.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="shrink-0 w-72 snap-start bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              {r.image ? (
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                /* bg-muted auto-switches */
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-5xl">🍜</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-xs font-bold text-foreground">{r.price}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-card-foreground text-sm">{r.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-card-foreground">{r.rating}</span>
                </div>
              </div>
              {/* Cuisine tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.cuisine.split(",").map((c, j) => {
                  const tag = c.trim()
                  const cls = CUISINE_TAGS[tag] ?? DEFAULT_TAG
                  return (
                    <span key={j} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}>
                      {tag}
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground truncate">{r.address}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {r.description}
              </p>
              <button className="w-full py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 dark:bg-orange-400/10 dark:hover:bg-orange-400/20 text-orange-700 dark:text-orange-400 text-xs font-semibold transition-colors">
                Reserve a Table
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
