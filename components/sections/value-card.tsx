"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-5 font-display text-base font-bold text-navy-700">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  );
}
