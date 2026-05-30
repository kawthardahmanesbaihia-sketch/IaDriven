"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Sunrise, Coffee, UtensilsCrossed, Sunset, Moon, MapPin } from "lucide-react"

interface DayActivity {
  time: string
  title: string
  description: string
  icon: React.ElementType
  color: string
}

interface ItineraryDay {
  day: number
  label: string
  activities: DayActivity[]
}

const SAMPLE_ITINERARY: ItineraryDay[] = [
  {
    day: 1,
    label: "Arrival & First Impressions",
    activities: [
      { time: "Afternoon", title: "Check-in & Settle",  description: "Arrive at your hotel, drop off luggage, and freshen up.", icon: MapPin,          color: "bg-blue-500"   },
      { time: "Evening",   title: "Local Dinner",       description: "Head to a nearby izakaya for an authentic Japanese dinner.", icon: UtensilsCrossed, color: "bg-orange-500" },
      { time: "Night",     title: "Explore the area",   description: "A short walk around the neighborhood to get familiar.",    icon: Moon,            color: "bg-purple-500" },
    ],
  },
  {
    day: 2,
    label: "Culture & History",
    activities: [
      { time: "Morning",   title: "Temple Visit",       description: "Explore a historic temple and its serene gardens.",         icon: Sunrise,         color: "bg-amber-500"  },
      { time: "Midday",    title: "Tea Ceremony",       description: "Participate in a traditional Japanese tea ceremony.",       icon: Coffee,          color: "bg-green-500"  },
      { time: "Afternoon", title: "Museum Tour",        description: "Visit the national museum for local art and history.",      icon: MapPin,          color: "bg-blue-500"   },
      { time: "Evening",   title: "Fine Dining",        description: "Kaiseki (multi-course) cuisine at a renowned restaurant.", icon: UtensilsCrossed, color: "bg-orange-500" },
    ],
  },
  {
    day: 3,
    label: "Nature & Relaxation",
    activities: [
      { time: "Morning",   title: "Sunrise Hike",       description: "Trek to a nearby viewpoint for breathtaking sunrise views.", icon: Sunrise,         color: "bg-amber-500"  },
      { time: "Afternoon", title: "Onsen Retreat",      description: "Relax in a traditional hot spring bath.",                   icon: Sunset,          color: "bg-rose-500"   },
      { time: "Evening",   title: "Farewell Dinner",    description: "Celebrate your last night with a special meal.",            icon: UtensilsCrossed, color: "bg-orange-500" },
    ],
  },
]

interface TravelDay {
  day: number
  theme: string
  morning: string
  afternoon: string
  evening: string
  icon: string
}

interface ItinerarySectionProps {
  generatorContent?: ReactNode
  travelDays?: TravelDay[]
}

const TIME_SLOTS: { color: string; icon: React.ElementType }[] = [
  { color: "bg-amber-500",  icon: Sunrise        },
  { color: "bg-blue-500",   icon: Coffee         },
  { color: "bg-purple-500", icon: Moon           },
]

export function ItinerarySection({ generatorContent, travelDays }: ItinerarySectionProps) {
  const days = travelDays ?? null

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Your Itinerary</h2>
        <p className="text-sm text-muted-foreground">Day-by-day travel plan</p>
      </div>

      {generatorContent && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-border">
          {generatorContent}
        </div>
      )}

      {days ? (
        /* Squad-aware itinerary from travel-data */
        <div className="space-y-8">
          {days.map((day, di) => {
            const slots = [
              { label: "Morning",   text: day.morning   },
              { label: "Afternoon", text: day.afternoon },
              { label: "Evening",   text: day.evening   },
            ]
            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center shadow-sm shrink-0">
                    <span className="text-white text-xs font-medium leading-none">Day</span>
                    <span className="text-white text-lg font-bold leading-none">{day.day}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{day.icon} {day.theme}</h3>
                    <p className="text-xs text-muted-foreground">3 activities planned</p>
                  </div>
                </div>

                <div className="ml-6 space-y-0">
                  {slots.map((slot, si) => {
                    const isLast = si === slots.length - 1
                    const SlotIcon = TIME_SLOTS[si]?.icon ?? Sunrise
                    return (
                      <div key={si} className="relative flex gap-4">
                        {!isLast && (
                          <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                        )}
                        <div className={`relative z-10 w-8 h-8 rounded-xl ${TIME_SLOTS[si]?.color ?? "bg-amber-500"} flex items-center justify-center shrink-0 shadow-sm`}>
                          <SlotIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 pb-5">
                          <div className="bg-card rounded-xl p-4 border border-border hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-card-foreground text-sm">{slot.label}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{slot.text}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* Fallback visual timeline */
        <div className="space-y-8">
          {SAMPLE_ITINERARY.map((day, di) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center shadow-sm shrink-0">
                  <span className="text-white text-xs font-medium leading-none">Day</span>
                  <span className="text-white text-lg font-bold leading-none">{day.day}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{day.label}</h3>
                  <p className="text-xs text-muted-foreground">{day.activities.length} activities planned</p>
                </div>
              </div>

              <div className="ml-6 space-y-0">
                {day.activities.map((act, ai) => {
                  const Icon = act.icon
                  const isLast = ai === day.activities.length - 1
                  return (
                    <div key={ai} className="relative flex gap-4">
                      {!isLast && (
                        <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 pb-5">
                        <div className="bg-card rounded-xl p-4 border border-border hover:border-border/60 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-card-foreground text-sm">{act.title}</h4>
                            <span className="text-xs text-muted-foreground shrink-0">{act.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{act.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
