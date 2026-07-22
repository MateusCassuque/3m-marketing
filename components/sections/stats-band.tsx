"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Smile, TrendingUp, Rocket, Trophy, type LucideIcon } from "lucide-react"

interface Stat {
  icon: LucideIcon
  value: number
  suffix: string
  label: string
}

const STATS: Stat[] = [
  { icon: Smile, value: 29, suffix: "+", label: "Clientes satisfeitos" },
  { icon: TrendingUp, value: 300, suffix: "%", label: "Média de crescimento" },
  { icon: Rocket, value: 79, suffix: "+", label: "Projetos entregues" },
  { icon: Trophy, value: 3, suffix: "+", label: "Anos de experiência" },
]

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 1400
    const start = performance.now()

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(frame)
    }

    const raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}

export function StatsBand() {
  return (
    <section className="bg-primary-600">
      <div className="container-padded grid grid-cols-2 gap-y-10 divide-navy-100/20 py-14 sm:grid-cols-4 sm:divide-x">
        {STATS.map(({ icon: Icon, value, suffix, label }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="flex flex-col items-center gap-3 px-4 text-center sm:flex-row sm:text-left"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/40 text-white">
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                <AnimatedNumber value={value} suffix={suffix} />
              </p>
              <p className="text-xs font-medium text-white/80 sm:text-sm">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
