"use client"

import { motion } from "framer-motion"
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface Hotel {
  name: string
  rating: number
  description: string
  price: string
  priceLevel: "budget" | "mid-range" | "luxury"
  address: string
  amenities: string[]
  image?: string
}

const PRICE_COLORS: Record<string, string> = {
  luxury:      "bg-amber-500 text-white",
  "mid-range": "bg-green-500 text-white",
  budget:      "bg-blue-500 text-white",
}

export function HotelsCarousel({ hotels }: { hotels: Hotel[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -296 : 296, behavior: "smooth" })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          {/* Semantic classes auto-switch in dark mode */}
          <h2 className="text-xl font-bold text-foreground">Recommended Hotels</h2>
          <p className="text-sm text-muted-foreground">{hotels.length} properties found</p>
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
        {hotels.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 px-2">No hotel data available.</p>
        )}
        {hotels.map((hotel, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            /* bg-card = #F5F7F6 light / #17394B dark, border-border auto-switches */
            className="shrink-0 w-72 snap-start bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-muted">
              {hotel.image ? (
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-5xl">🏨</span>
                </div>
              )}
              {/* Price badge — bg-background auto-switches */}
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-xs font-bold text-foreground">{hotel.price}</span>
              </div>
              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${PRICE_COLORS[hotel.priceLevel] ?? "bg-muted text-foreground"}`}>
                {hotel.priceLevel.charAt(0).toUpperCase() + hotel.priceLevel.slice(1)}
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-card-foreground text-sm leading-tight">{hotel.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-card-foreground">{hotel.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground truncate">{hotel.address}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {hotel.description}
              </p>
              {hotel.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hotel.amenities.slice(0, 3).map((a, j) => (
                    /* bg-muted + text-muted-foreground auto-switch */
                    <span key={j} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              )}
              <button className="w-full py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-400/10 dark:hover:bg-green-400/20 text-green-700 dark:text-green-400 text-xs font-semibold transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
