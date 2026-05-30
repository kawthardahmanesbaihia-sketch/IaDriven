"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Calendar, Utensils, Compass, Music, CheckCircle, PlusCircle, Dumbbell, Flame, Star, Users } from "lucide-react"
import { useState } from "react"

interface Event {
  title: string
  category: "Culture" | "Food" | "Adventure" | "Music" | "Festival" | string
  date: string
  matchPct: number
  description?: string
}

/* Light + dark class pairs for each category — covers all travel-data event types */
const CATEGORY_STYLE: Record<string, { wrap: string; icon: React.ElementType }> = {
  Culture:   { wrap: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Compass  },
  Cultural:  { wrap: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Compass  },
  Food:      { wrap: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", icon: Utensils },
  Adventure: { wrap: "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300",   icon: Compass  },
  Music:     { wrap: "bg-pink-100   text-pink-700   dark:bg-pink-900/30   dark:text-pink-300",    icon: Music    },
  Festival:  { wrap: "bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300",   icon: Calendar },
  Gaming:    { wrap: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",  icon: Star     },
  Dance:     { wrap: "bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300",    icon: Users    },
  Sport:     { wrap: "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300",   icon: Dumbbell },
  Wellness:  { wrap: "bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-300",    icon: Flame    },
  Art:       { wrap: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",  icon: Star     },
}
const FALLBACK = { wrap: "bg-muted text-muted-foreground", icon: Calendar }

const SAMPLE_EVENTS: Event[] = [
  { title: "Cherry Blossom Festival",  category: "Culture",   date: "Apr 1–15",  matchPct: 95, description: "Japan's iconic sakura season — a once-in-a-lifetime experience." },
  { title: "Ramen & Sake Expo",        category: "Food",      date: "Apr 20",    matchPct: 88, description: "Taste regional ramen styles from across Japan." },
  { title: "Fuji Trails Open Season",  category: "Adventure", date: "May 1–Sep", matchPct: 80, description: "Hike Japan's iconic peak with guided mountain trails." },
  { title: "Tokyo Jazz Nights",        category: "Music",     date: "Apr 10–12", matchPct: 72, description: "World-class jazz musicians at iconic Tokyo venues." },
]

interface EventsPanelProps {
  eventsContent?: ReactNode
  events?: Event[]
}

export function EventsPanel({ eventsContent, events }: EventsPanelProps) {
  const [added, setAdded] = useState<Set<number>>(new Set())
  const displayEvents = events ?? SAMPLE_EVENTS

  const toggle = (i: number) =>
    setAdded((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Events During Your Trip</h2>
        <p className="text-sm text-muted-foreground">Local events matched to your interests</p>
      </div>

      {/* Existing EventsSection component if provided */}
      {eventsContent && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-border">
          {eventsContent}
        </div>
      )}

      {/* Premium event cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {displayEvents.map((event, i) => {
          const style = CATEGORY_STYLE[event.category] ?? FALLBACK
          const Icon = style.icon
          const isAdded = added.has(i)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              /* bg-card + border-border auto-switch */
              className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${style.wrap}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.wrap}`}>
                    {event.category}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{event.date}</span>
              </div>

              <h3 className="font-bold text-card-foreground text-sm mb-1">{event.title}</h3>
              {event.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{event.description}</p>
              )}

              {/* Match progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-muted-foreground">Match for you</span>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">{event.matchPct}%</span>
                </div>
                {/* bg-muted auto-switches */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${event.matchPct}%` }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                  />
                </div>
              </div>

              <button
                onClick={() => toggle(i)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isAdded
                    ? "bg-green-500 text-white hover:bg-green-600"
                    /* bg-muted + border-border auto-switch */
                    : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                }`}
              >
                {isAdded ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Added to trip</>
                ) : (
                  <><PlusCircle className="w-3.5 h-3.5" /> Add to trip</>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
