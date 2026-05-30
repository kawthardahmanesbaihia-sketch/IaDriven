"use client"

import { motion } from "framer-motion"
import { Sparkles, Heart, Utensils, TreePine, Brain } from "lucide-react"

interface AIInsightBoxProps {
  destinationName: string
  summary?: string
  positives?: string[]
}

const PREFERENCE_ICONS = [
  { label: "Culture",    icon: Brain,    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { label: "Food",       icon: Utensils, cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  { label: "Relaxation", icon: Heart,    cls: "bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300"   },
  { label: "Nature",     icon: TreePine, cls: "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300"  },
]

export function AIInsightBox({ destinationName, summary, positives }: AIInsightBoxProps) {
  const defaultSummary = `${destinationName} is a destination that perfectly aligns with your travel profile. Based on the images you uploaded, our AI detected strong preferences for cultural experiences, culinary exploration, and peaceful environments — all of which ${destinationName} excels at offering.`

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        /* Accent container: light green tint in light mode, dark teal tint in dark mode */
        className="rounded-2xl p-6 border bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800/40"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Why This Trip?</h2>
            <p className="text-sm text-muted-foreground">AI-powered recommendation analysis</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-6">
          {summary || defaultSummary}
        </p>

        {/* Preference chips */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Based on your preferences
          </p>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_ICONS.map((pref) => {
              const Icon = pref.icon
              return (
                <div key={pref.label} className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${pref.cls}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {pref.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick positives list */}
        {positives && positives.length > 0 && (
          /* Inner panel: semi-transparent card that works in both modes */
          <div className="bg-background/60 dark:bg-card/40 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Why {destinationName} is right for you
            </p>
            <ul className="space-y-2">
              {positives.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  )
}
