'use client'

import { Compass, Heart, ShieldCheck, Sparkles } from "lucide-react"

import { ValueCard } from "@/components/sections/value-card"


const VALUES = [
  {
    icon: Compass,
    title: "Propósito claro",
    description:
      "Cada estratégia parte de um objetivo de negócio real, não de métricas de vaidade.",
  },
  {
    icon: Heart,
    title: "Compromisso com resultado",
    description:
      "Medimos sucesso pelo impacto que geramos no crescimento do seu negócio.",
  },
  {
    icon: ShieldCheck,
    title: "Transparência",
    description:
      "Relatórios claros e comunicação direta, sem promessas vazias ou jargão vazio.",
  },
  {
    icon: Sparkles,
    title: "Criatividade orientada a dados",
    description:
      "Ideias ousadas, testadas e refinadas com base em dados reais de performance.",
  },
]

export default function ValoresAbout() {
  return (
    <section className="bg-muted/50 py-20 lg:py-24">
      <div className="container-padded">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mx-auto justify-center">Nossos valores</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">
            O que guia cada estratégia que criamos
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <ValueCard key={value.title}
              description={value.description}
              title={value.title}
              icon={value.icon}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
