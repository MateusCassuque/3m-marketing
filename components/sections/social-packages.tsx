"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Megaphone, Video, LayoutGrid, Gift, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SOCIAL_COMMON, SOCIAL_PACKAGES } from "@/lib/site-data";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";

/** Selector de pacotes de gestão de redes sociais (3M). */
export function SocialPackages() {
  const openContact = useUIStore((state) => state.openContact);
  const [active, setActive] = useState(SOCIAL_PACKAGES[1].id);
  const pkg = SOCIAL_PACKAGES.find((p) => p.id === active) ?? SOCIAL_PACKAGES[0];

  const rows = [
    { icon: LayoutGrid, text: pkg.posts },
    { icon: Video, text: pkg.videos },
    { icon: Megaphone, text: pkg.ads },
    { icon: Wallet, text: pkg.adBudget },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div
        role="tablist"
        aria-label="Pacotes de redes sociais"
        className="flex gap-2 overflow-x-auto rounded-2xl bg-white/10 p-1.5 scrollbar-none lg:col-span-2 lg:mx-auto lg:w-fit"
      >
        {SOCIAL_PACKAGES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={active === p.id}
            type="button"
            onClick={() => setActive(p.id)}
            className={cn(
              "relative shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
              active === p.id ? "text-navy-800" : "text-white/70 hover:text-white",
            )}
          >
            {active === p.id && (
              <motion.span
                layoutId="social-tab"
                className="absolute inset-0 rounded-xl bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{p.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="contents"
        >
          <div className="rounded-3xl bg-white p-8 text-navy-700 shadow-card">
            <p className="text-sm font-semibold text-primary-700">Pacote {pkg.name}</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold tracking-tight">{pkg.price}</span>
              <span className="text-sm font-semibold text-muted-foreground">Kz por mês</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Deixe as suas redes sociais nas mãos de profissionais.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-accent-50 p-4 text-sm text-navy-700">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
              <p>
                <span className="font-semibold">Bónus: </span>
                {pkg.bonus}
              </p>
            </div>
            <Button variant="accent" className="mt-6 w-full" onClick={openContact}>
              Quero este pacote
            </Button>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
            <p className="text-sm font-semibold text-primary-300">O que inclui</p>
            <ul className="mt-5 space-y-3.5">
              {rows.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3.5 text-white">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/25 text-primary-200">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-2 border-t border-white/10 pt-5">
              {SOCIAL_COMMON.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" strokeWidth={2.5} />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
