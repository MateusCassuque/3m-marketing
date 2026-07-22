"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Smile, Timer } from "lucide-react";

const CONTACT_ITEMS = [
  { icon: MapPin, label: "Endereço", value: "Sambizanga, Luanda, Angola" },
  { icon: Phone, label: "Telefone", value: "(+244) 953 951 694" },
  { icon: Mail, label: "E-mail", value: "geral@3magencia.site" },
  { icon: Clock, label: "Atendimento", value: "Segunda a sexta, 9h às 17h" },
];

const QUICK_FACTS = [
  { icon: Timer, value: "2h", label: "Tempo médio de resposta" },
  { icon: Smile, value: "98%", label: "Satisfação dos clientes" },
  { icon: Clock, value: "24h", label: "Prazo para 1ª proposta" },
];

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-border bg-white p-7 shadow-soft"
      >
        <h3 className="font-display text-lg font-bold text-navy-700">Fale diretamente com a gente</h3>
        <ul className="mt-5 space-y-4">
          {CONTACT_ITEMS.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-navy-700">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl bg-brand-gradient p-7 text-white shadow-card"
      >
        <h3 className="font-display text-lg font-bold">Por que falar com a gente agora</h3>
        <div className="mt-5 grid grid-cols-3 gap-4">
          {QUICK_FACTS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="mt-2.5 font-display text-xl font-extrabold">{value}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-white/80">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
