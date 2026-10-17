"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import { FAQ_GROUPS } from "@/lib/faq-data";
import { cn } from "@/lib/utils";

function FaqRow({ id, q, a }: { id: string; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-${id}`;

  return (
    <div className="border-b border-border last:border-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left"
        >
          <span className="font-display text-lg font-semibold text-navy-700">{q}</span>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              open ? "bg-accent-500 text-white" : "bg-primary-50 text-primary-600",
            )}
          >
            <Plus className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-45")} strokeWidth={2.25} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="max-w-3xl pb-6 pr-14 text-pretty leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqList() {
  return (
    <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
      <nav aria-label="Categorias" className="hidden lg:block">
        <ul className="sticky top-28 space-y-1">
          {FAQ_GROUPS.map((group) => (
            <li key={group.id}>
              <a
                href={`#${group.id}`}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {group.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        {FAQ_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-28">
            <h2 className="font-display text-2xl font-bold text-navy-700 sm:text-3xl">{group.title}</h2>
            <div className="mt-4">
              {group.items.map((item, i) => (
                <FaqRow key={item.q} id={`${group.id}-${i}`} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
