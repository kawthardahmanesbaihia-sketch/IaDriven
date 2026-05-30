"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plane, Map, EarthIcon,Camera, Compass, MapPin, Globe } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const { t } = useLanguage()

  // Initialize with safe defaults, will update on client side
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 })

  useEffect(() => {
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [mouseX, mouseY, setWindowSize])

  const x1 = useTransform(mouseX, [0, windowSize.width], [-20, 20])
  const y1 = useTransform(mouseY, [0, windowSize.height], [-20, 20])
  const x2 = useTransform(mouseX, [0, windowSize.width], [-10, 10])
  const y2 = useTransform(mouseY, [0, windowSize.height], [-10, 10])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackgroundElements />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20 text-foreground">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/95" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-30" />
        </div>
        
        <div className="container relative z-10 mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="mb-6 inline-block"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Plane className="text-primary w-96 h-20" />
            </motion.div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-primary via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                {t("aiDrivenVisual")}
              </span>
              <br />
              <span className="text-foreground drop-shadow-md">{t("tripPlanner")}</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
              {t("uploadYourImages")}
            </p>

            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="h-16 px-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 border-2 border-primary/20"
              >
                <Link href="/auth">
                  {t("startNow")}
                  <Map className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Icons */}
          <motion.div className="absolute left-[10%] top-[20%] opacity-20" style={{ x: x1, y: y1 }}>
            <EarthIcon className="h-24 w-24 text-primary" />
          </motion.div>

          <motion.div className="absolute right-[15%] top-[30%] opacity-20" style={{ x: x2, y: y2 }}>
            <Compass className="h-20 w-20 text-primary" />
          </motion.div>

          <motion.div className="absolute bottom-[25%] left-[20%] opacity-20" style={{ x: x2, y: y1 }}>
            <MapPin className="h-16 w-16 text-primary" />
          </motion.div>

          <motion.div className="absolute bottom-[20%] right-[10%] opacity-20" style={{ x: x1, y: y2 }}>
            <Globe className="h-28 w-28 text-primary" />
          </motion.div>
        </div>

        {/* Gradient Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-background via-card to-background px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-balance text-4xl font-bold sm:text-5xl md:text-6xl">{t("howItWorks")}</h2>
            <p className="mx-auto max-w-3xl text-pretty text-xl leading-relaxed text-muted-foreground">
              Three simple steps to discover your perfect travel preferences
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Camera,
                title: t("uploadImages"),
                description: t("uploadImagesDesc"),
              },
              {
                icon: Compass,
                title: t("aiAnalysis"),
                description: t("aiAnalysisDesc"),
              },
              {
                icon: Map,
                title: t("getResults"),
                description: t("getResultsDesc"),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.02,
                  transition: { duration: 0.3 } 
                }}
                className="group relative overflow-hidden rounded-3xl border border-border/20 bg-card p-10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative z-10">
                  <motion.div 
                    className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-10 w-10" />
                  </motion.div>
                  <h3 className="mb-4 text-2xl font-bold">{feature.title}</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground text-lg">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 p-12 shadow-2xl">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5" />
              <div className="relative z-10">
                <Compass className="mx-auto mb-4 h-14 w-14 text-white/80" />
                <h3 className="mb-3 text-3xl font-bold text-white">Ready to Explore?</h3>
                <p className="mx-auto mb-8 max-w-xl text-lg text-white/75">
                  Browse curated destinations by squad type — solo, couple, friends, or family — and get a personalised AI dashboard instantly.
                </p>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-10 text-base font-bold bg-white text-emerald-700 hover:bg-white/90 shadow-xl transition-all duration-300"
                  >
                    <Link href="/explore">
                      Browse Destinations
                      <Compass className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  )
}
