import type { Metadata } from "next";
import { Target, Lightbulb, TrendingUp, Users, Megaphone } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { ServiceDetail } from "@/components/sections/service-detail";
import { ProcessSteps } from "@/components/sections/process-steps";
import { CtaSection } from "@/components/sections/cta-section";
import ServiceDetails from "./serviceDetails";

export const metadata: Metadata = {
  title: "Serviços | 3M Agência de Marketing",
  description:
    "Estratégia, criatividade, gestão de tráfego, mídias sociais e branding — tudo que sua marca precisa para crescer, em um só lugar.",
};

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
];

export default function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="Serviços"
        title="Tudo que sua marca precisa para crescer, em um só lugar"
        description="Cinco frentes que trabalham juntas — estratégia, criatividade, tráfego, redes sociais e branding — para gerar resultado de ponta a ponta."
      />

      <ServiceDetails />

      <section className="bg-muted/50 py-20 lg:py-24">
        <ProcessSteps />
      </section>

      <CtaSection />
    </>
  );
}
