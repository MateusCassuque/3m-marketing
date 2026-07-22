'use client'

import { Target, Lightbulb, TrendingUp, Users, Megaphone } from "lucide-react"
import { ServiceDetail } from "@/components/sections/service-detail"


const SERVICES = [
  {
    id: "estrategia",
    icon: Target,
    title: "Estratégia",
    description:
      "Antes de qualquer campanha, entendemos profundamente o seu negócio, mercado e concorrência para construir um plano com metas claras — não achismo.",
    bullets: [
      "Diagnóstico de mercado e concorrência",
      "Definição de posicionamento e público-alvo ideal",
      "Plano de metas e KPIs mensuráveis",
      "Roadmap trimestral de ações",
    ],
  },
  {
    id: "criatividade",
    icon: Lightbulb,
    title: "Criatividade",
    description:
      "Ideias que conectam sua marca ao público certo, na hora certa. Criação orientada por dados, sem abrir mão de personalidade e originalidade.",
    bullets: [
      "Direção de arte e identidade de campanha",
      "Roteiro e produção de conteúdo",
      "Testes A/B de criativos",
      "Banco de peças para todos os canais",
    ],
  },
  {
    id: "trafego",
    icon: TrendingUp,
    title: "Gestão de Tráfego",
    description:
      "Anúncios inteligentes, otimizados continuamente, para transformar investimento em mídia em leads e vendas reais — com transparência total nos números.",
    bullets: [
      "Google Ads, Meta Ads e TikTok Ads",
      "Otimização contínua de CPA e ROAS",
      "Landing pages de alta conversão",
      "Relatórios semanais de performance",
    ],
  },
  {
    id: "midias-sociais",
    icon: Users,
    title: "Mídias Sociais",
    description:
      "Gestão completa das suas redes, com conteúdo estratégico que constrói relacionamento com sua audiência e fortalece a marca todos os dias.",
    bullets: [
      "Calendário editorial estratégico",
      "Produção de conteúdo nativo por rede",
      "Gestão de comunidade e resposta",
      "Análise de engajamento e alcance",
    ],
  },
  {
    id: "branding",
    icon: Megaphone,
    title: "Branding",
    description:
      "Construímos marcas fortes, com identidade e propósito claros — para que sua empresa seja lembrada pelos motivos certos.",
    bullets: [
      "Naming e identidade visual",
      "Manual de marca e tom de voz",
      "Reposicionamento de marca",
      "Consistência em todos os pontos de contato",
    ],
  },
]

export default function ServiceDetails() {
  return (
    <section className="bg-white">
      <div className="divide-y divide-border">
        {SERVICES.map((service, index) => (
          <ServiceDetail key={service.id} {...service} reverse={index % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
