"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, Sun, Droplets, Wind } from "lucide-react"

interface OverviewSectionProps {
  positives: string[]
  negatives: string[]
  weatherContent?: ReactNode
}

export function OverviewSection({ positives, negatives, weatherContent }: OverviewSectionProps) {
  return (
    <div className="p-6 space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Why you'll love it — green accent card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={[
            "rounded-2xl p-5 border",
            /* light */ "bg-green-50 border-green-100",
            /* dark  */ "dark:bg-green-900/20 dark:border-green-800/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              {/* text-foreground auto-switches */}
              <h3 className="font-bold text-foreground text-sm">Why you'll love it</h3>
              <p className="text-xs text-muted-foreground">Top reasons to visit</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {positives.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-start gap-3"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Things to consider — amber accent card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={[
            "rounded-2xl p-5 border",
            "bg-amber-50 border-amber-100",
            "dark:bg-amber-900/20 dark:border-amber-800/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Things to consider</h3>
              <p className="text-xs text-muted-foreground">Before you go</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {negatives.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-start gap-3"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Weather card — rendered content from WeatherSection or fallback */}
      {weatherContent ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {weatherContent}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          /* Blue gradient looks great in both modes — text is always white */
          className="bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs mb-1 uppercase tracking-wide font-medium">Typical Climate</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">20°</span>
                <span className="text-blue-200 mb-1.5">C / 68°F</span>
              </div>
              <p className="text-blue-100 text-sm mt-1">Mild and comfortable for travel</p>
            </div>
            <div className="text-right">
              <Sun className="w-14 h-14 text-yellow-300 ml-auto" />
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <Droplets className="w-4 h-4 text-blue-200 mx-auto" />
                  <p className="text-xs text-blue-200 mt-0.5">45%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-4 h-4 text-blue-200 mx-auto" />
                  <p className="text-xs text-blue-200 mt-0.5">12 km/h</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
