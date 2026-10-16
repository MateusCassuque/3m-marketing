"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 29, suffix: "+", label: "Clientes satisfeitos" },
  { value: 79, suffix: "+", label: "Projectos entregues" },
  { value: 300, suffix: "%", label: "Média de crescimento" },
  { value: 3, suffix: "+", label: "Anos de experiência" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1400;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsBand() {
  return (
    <section className="bg-primary-700">
      <div className="container-padded grid grid-cols-2 gap-y-10 py-14 sm:grid-cols-4">
        {STATS.map(({ value, suffix, label }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="px-4 text-center sm:border-l sm:border-white/20 sm:first:border-l-0"
          >
            <p className="font-display text-4xl font-bold text-white sm:text-5xl">
              <AnimatedNumber value={value} suffix={suffix} />
            </p>
            <p className="mt-1 text-sm font-medium text-white/75">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
