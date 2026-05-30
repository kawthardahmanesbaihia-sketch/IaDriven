"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Hotel, Utensils, MapPin, Star } from "lucide-react"
import { useState } from "react"

interface Marker {
  id: string
  name: string
  type: "hotel" | "restaurant" | "attraction"
  location: { lat: number; lng: number }
  info: { rating?: number; price?: string; cuisine?: string }
}

/* Light + dark class pairs for each type */
const TYPE_STYLE = {
  hotel: {
    label: "Hotel",
    icon: Hotel,
    wrap:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    dot:    "bg-blue-500",
  },
  restaurant: {
    label: "Restaurant",
    icon: Utensils,
    wrap:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    dot:    "bg-orange-500",
  },
  attraction: {
    label: "Attraction",
    icon: MapPin,
    wrap:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    dot:    "bg-green-500",
  },
}

interface MapSectionProps {
  mapContent?: ReactNode
  markers?: Marker[]
}

export function MapSection({ mapContent, markers }: MapSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Explore the Map</h2>
        <p className="text-sm text-muted-foreground">Hotels, restaurants & attractions near you</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Map container — bg-muted auto-switches to dark bg */}
        <div className="flex-1 min-h-[340px] rounded-2xl overflow-hidden border border-border shadow-sm bg-muted">
          {mapContent ?? (
            <div className="w-full h-full min-h-[340px] flex items-center justify-center bg-muted">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Map loading…</p>
              </div>
            </div>
          )}
        </div>

        {/* Place list */}
        {markers && markers.length > 0 && (
          <div className="lg:w-72 space-y-2 overflow-y-auto max-h-[400px]">
            {markers.map((m) => {
              const style = TYPE_STYLE[m.type] ?? TYPE_STYLE.attraction
              const Icon = style.icon
              const isActive = activeId === m.id
              return (
                <motion.button
                  key={m.id}
                  onClick={() => setActiveId(isActive ? null : m.id)}
                  whileHover={{ x: 3 }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.wrap}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-card-foreground truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${style.wrap}`}>
                          {style.label}
                        </span>
                        {m.info.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {m.info.rating}
                          </span>
                        )}
                      </div>
                      {m.info.cuisine && (
                        <p className="text-xs text-muted-foreground mt-0.5">{m.info.cuisine}</p>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${style.dot} mt-2 shrink-0`} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
