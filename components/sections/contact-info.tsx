"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { COMPANY } from "@/lib/site-data";

const CONTACT_ITEMS = [
  { icon: Phone, label: "Telefone", value: COMPANY.phone, href: COMPANY.phoneHref },
  { icon: MessageCircle, label: "WhatsApp", value: COMPANY.phone, href: COMPANY.whatsappHref },
  { icon: Mail, label: "E-mail", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { icon: MapPin, label: "Morada", value: COMPANY.address },
  { icon: Clock, label: "Atendimento", value: COMPANY.hours },
];

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-border bg-white p-7 shadow-soft"
      >
        <h3 className="font-display text-xl font-bold text-navy-700">Fale directamente connosco</h3>
        <ul className="mt-6 space-y-5">
          {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-0.5 block text-sm font-semibold text-navy-700 hover:text-primary-700"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-navy-700">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl bg-navy-800 p-7 text-white shadow-card"
      >
        <h3 className="font-display text-xl font-bold">O que acontece a seguir</h3>
        <ol className="mt-5 space-y-4 text-sm text-white/75">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">1</span>
            Recebemos a sua mensagem e respondemos em até 24 horas úteis.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">2</span>
            Falamos consigo para perceber o que o projecto precisa.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">3</span>
            Enviamos uma proposta com preço e prazo, em Kwanzas.
          </li>
        </ol>
      </motion.div>
    </div>
  );
}
