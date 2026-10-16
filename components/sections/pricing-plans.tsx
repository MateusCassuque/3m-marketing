"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WEB_PLANS, type Plan } from "@/lib/site-data";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";

export function PlanCard({ plan, cta = true }: { plan: Plan; cta?: boolean }) {
  const openContact = useUIStore((state) => state.openContact);
  const dark = plan.highlight;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border p-7 transition-transform duration-300 hover:-translate-y-1",
        dark
          ? "border-navy-700 bg-navy-800 text-white shadow-glow"
          : "border-border bg-white shadow-soft",
      )}
    >
      {dark && (
        <span className="absolute -top-3 left-7 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white">
          Mais completo
        </span>
      )}
      <h3 className={cn("font-display text-xl font-bold", dark ? "text-white" : "text-navy-700")}>
        {plan.name}
      </h3>
      <p className="mt-5 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-5xl font-bold tracking-tight",
            dark ? "text-accent-400" : "text-navy-700",
          )}
        >
          {plan.price}
        </span>
        <span className={cn("text-sm font-semibold", dark ? "text-white/60" : "text-muted-foreground")}>Kz</span>
      </p>
      <p className={cn("mt-3 text-sm leading-relaxed", dark ? "text-white/70" : "text-muted-foreground")}>
        {plan.audience}
      </p>

      <ul className="mt-6 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              className={cn("mt-0.5 h-4 w-4 shrink-0", dark ? "text-primary-300" : "text-primary-600")}
              strokeWidth={2.5}
            />
            <span className={dark ? "text-white/85" : "text-navy-600"}>{feature}</span>
          </li>
        ))}
      </ul>

      {cta && (
        <Button
          variant={dark ? "accent" : "outline"}
          className="mt-8 w-full"
          onClick={openContact}
        >
          Pedir este plano
        </Button>
      )}
    </div>
  );
}

export function PricingPlans({ cta = true }: { cta?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {WEB_PLANS.map((plan, i) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <PlanCard plan={plan} cta={cta} />
        </motion.div>
      ))}
    </div>
  );
}
