"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, Activity, Globe, Heart, DollarSign } from "lucide-react"
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import type { AnalyticsData } from "@/lib/analytics"
import { getPackagesFromStorage } from "@/lib/analytics"

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ["#16a34a", "#0ea5e9", "#f97316", "#a855f7", "#f59e0b", "#f43f5e"]

// ─── Tooltip style (CSS vars work in inline styles via browser cascade) ───────
const TIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
  itemStyle: { color: "hsl(var(--muted-foreground))" },
}

// ─── Axis shared props ────────────────────────────────────────────────────────
const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--muted-foreground))" }

// ─── Time-series helpers (deterministic — no Math.random) ────────────────────
const GROWTH_WEIGHTS  = [0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.22] // sum = 1
const SESSION_WEIGHTS = [0.12, 0.15, 0.11, 0.17, 0.14, 0.18, 0.13] // sum = 1

function last7DayLabels() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })
}

// ─── Price buckets ────────────────────────────────────────────────────────────
const PRICE_BUCKETS = [
  { label: "<$500",   min: 0,    max: 500        },
  { label: "$500–1k", min: 500,  max: 1_000      },
  { label: "$1k–2k",  min: 1000, max: 2_000      },
  { label: "$2k–3k",  min: 2000, max: 3_000      },
  { label: ">$3k",    min: 3000, max: Infinity   },
]

// ─── Fallbacks when data is empty ────────────────────────────────────────────
const DEST_FALLBACK = [
  { name: "Japan",   count: 1 },
  { name: "France",  count: 1 },
  { name: "Italy",   count: 1 },
  { name: "Bali",    count: 1 },
  { name: "Morocco", count: 1 },
]
const PREF_FALLBACK = [
  { name: "Culture",    count: 0 },
  { name: "Adventure",  count: 0 },
  { name: "Food",       count: 0 },
  { name: "Relaxation", count: 0 },
  { name: "Nature",     count: 0 },
]

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({
  icon: Icon,
  title,
  subtitle,
  delay,
  className = "",
  children,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  delay: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      <Card className="p-6 h-full">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface DashboardChartsProps {
  analytics: AnalyticsData
}

export function DashboardCharts({ analytics }: DashboardChartsProps) {
  const packages = useMemo(() => getPackagesFromStorage(), [])
  const labels   = useMemo(() => last7DayLabels(), [])

  /* 1. Users growth — distributed with growth curve */
  const userGrowthData = useMemo(
    () => labels.map((date, i) => ({
      date,
      Users: Math.max(1, Math.round(analytics.totalUsers * GROWTH_WEIGHTS[i])),
    })),
    [labels, analytics.totalUsers]
  )

  /* 2. Sessions activity */
  const sessionData = useMemo(
    () => labels.map((date, i) => ({
      date,
      Sessions: Math.max(1, Math.round(analytics.totalSessions * SESSION_WEIGHTS[i])),
    })),
    [labels, analytics.totalSessions]
  )

  /* 3. Destinations — use real data or fallback */
  const destinationsData = useMemo(() => {
    const src = analytics.topDestinations.slice(0, 6)
    if (src.length === 0) return DEST_FALLBACK
    return src.map(d => ({ name: d.destination, count: d.count }))
  }, [analytics.topDestinations])

  /* 4. Preferences — normalize to display names */
  const preferencesData = useMemo(() => {
    if (analytics.topTags.length === 0) return PREF_FALLBACK
    return analytics.topTags.slice(0, 7).map(t => ({
      name: t.tag.charAt(0).toUpperCase() + t.tag.slice(1),
      count: t.count,
    }))
  }, [analytics.topTags])

  /* 5. Price distribution — bucket package prices */
  const priceData = useMemo(
    () => PRICE_BUCKETS.map(b => ({
      label: b.label,
      Packages: packages.filter(p => p.price >= b.min && p.price < b.max).length,
    })),
    [packages]
  )

  return (
    <div className="mt-8 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="flex items-center gap-2 mb-2"
      >
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
          Analytics Charts
        </span>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── 1. Users Growth (Line) ── */}
        <ChartCard
          icon={TrendingUp}
          title="Users Growth"
          subtitle="Estimated weekly trend"
          delay={0.9}
        >
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={userGrowthData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TIP_STYLE} />
              <Line
                type="monotone"
                dataKey="Users"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 2. Sessions Activity (Bar) ── */}
        <ChartCard
          icon={Activity}
          title="Sessions Activity"
          subtitle="Estimated weekly distribution"
          delay={1.0}
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={sessionData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TIP_STYLE} />
              <Bar dataKey="Sessions" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 3. Popular Destinations (Donut) ── */}
        <ChartCard
          icon={Globe}
          title="Popular Destinations"
          subtitle="Based on explore activity & packages"
          delay={1.1}
        >
          <ResponsiveContainer width="100%" height={210}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={destinationsData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={3}
                strokeWidth={0}
              >
                {destinationsData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TIP_STYLE} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => (
                  <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 4. Top Preferences (Horizontal Bar) ── */}
        <ChartCard
          icon={Heart}
          title="Top User Preferences"
          subtitle="Preference categories from user profiles"
          delay={1.2}
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={preferencesData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={72} />
              <Tooltip {...TIP_STYLE} />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 5. Package Price Distribution (full-width) ── */}
        <ChartCard
          icon={DollarSign}
          title="Package Price Distribution"
          subtitle="Number of packages per price range"
          delay={1.3}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TIP_STYLE} />
              <Bar
                dataKey="Packages"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
                maxBarSize={64}
                label={{ position: "top", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  )
}
