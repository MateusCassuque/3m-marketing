// Perguntas frequentes. Os preços vêm de lib/site-data.ts para ficarem sempre iguais aos dos planos.
import { COMPANY, EXTRA_SERVICES, SOCIAL_PACKAGES, WEB_PLANS } from "@/lib/site-data";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

const web = (id: string) => WEB_PLANS.find((p) => p.id === id)?.price ?? "";
const extra = (id: string) => EXTRA_SERVICES.find((s) => s.id === id)?.price ?? "";
const social = (id: string) => SOCIAL_PACKAGES.find((p) => p.id === id)?.price ?? "";

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "sites",
    title: "Sites e aplicações",
    items: [
      {
        q: "Quanto custa criar um site?",
        a: `Temos três planos, todos em Kwanzas: Landing Page por ${web("landing")} Kz, Website Institucional por ${web("institucional")} Kz e WebApp com Painel Admin por ${web("webapp")} Kz. Pode ver o que inclui cada um na página de serviços.`,
      },
      {
        q: "O domínio e a hospedagem estão incluídos?",
        a: "Sim. Domínio e hospedagem são gratuitos em todos os planos de criação de sites, sem custos escondidos.",
      },
      {
        q: "Quantas contas de e-mail profissional recebo?",
        a: "A Landing Page inclui 1 conta, o Website Institucional inclui 3 e o WebApp com Painel Admin inclui 5.",
      },
      {
        q: "Qual é a diferença entre Landing Page, Website Institucional e WebApp?",
        a: "A Landing Page é uma página focada numa só acção, como vender um produto, divulgar um serviço ou captar clientes. O Website Institucional tem Home, Sobre Nós, Serviços, Portfólio e Contactos, e serve para marcar presença online. O WebApp acrescenta um painel de administração com facturação certificada e destina-se a empresas de média ou grande dimensão.",
      },
      {
        q: "O painel admin do WebApp inclui facturação?",
        a: "Sim. O plano WebApp + Painel Admin inclui um painel de gestão com facturação certificada.",
      },
      {
        q: "Quanto tempo demora a ficar pronto?",
        a: "Depende do plano e do conteúdo que já tiver. Na proposta indicamos sempre o preço e o prazo do seu projecto.",
      },
      {
        q: "Têm apoio depois de o site estar no ar?",
        a: "Sim. Fazemos um acompanhamento próximo antes, durante e depois da entrega do projecto.",
      },
    ],
  },
  {
    id: "redes-sociais",
    title: "Redes sociais (3M)",
    items: [
      {
        q: "O que inclui a gestão de redes sociais?",
        a: `A 3M cria e publica conteúdo todos os dias, produz vídeo profissional todos os meses, lança anúncios patrocinados e faz o planeamento e a gestão estratégica, com um calendário de conteúdos alinhado com os objectivos do negócio. Os pacotes começam em ${social("essencial")} Kz por mês.`,
      },
      {
        q: "Que pacotes existem e quanto custam?",
        a: `Essencial (${social("essencial")} Kz/mês): 2 posts por dia, 1 vídeo profissional e 1 anúncio patrocinado de 7 dias. Crescimento (${social("crescimento")} Kz/mês): 3 posts por dia, 2 vídeos e 1 anúncio de 9 dias. Domínio (${social("dominio")} Kz/mês): 3 posts por dia, 3 vídeos e 2 anúncios de 7 dias.`,
      },
      {
        q: "O investimento em anúncios está incluído?",
        a: "Cada pacote inclui um investimento publicitário diário (2 USD no Essencial, 3 USD no Crescimento e 4 USD no Domínio), gerido pela equipa da 3M.",
      },
      {
        q: "Existe algum bónus para quem fica mais tempo?",
        a: "Sim. Quem permanece com a 3M recebe uma Landing Page grátis: a partir do 10.º mês no pacote Essencial, do 6.º mês no Crescimento e do 3.º mês no Domínio.",
      },
    ],
  },
  {
    id: "pagamento",
    title: "Pagamento",
    items: [
      {
        q: "Que formas de pagamento aceitam?",
        a: "Pronto pagamento, com 10% de desconto sobre o valor total do serviço; pagamento em 2 vezes, com 50% na contratação e 50% na entrega do projecto; e, para empresas, emissão de factura com pagamento a 30 dias.",
      },
      {
        q: "Emitem factura?",
        a: "Sim. Para empresas, emitimos factura com pagamento a 30 dias.",
      },
    ],
  },
  {
    id: "outros",
    title: "Outros serviços",
    items: [
      {
        q: "O que inclui a criação de identidade visual?",
        a: `Por ${extra("identidade")} Kz recebe logótipo original, paleta de cores, tipografia oficial, cartão de visita digital, manual de marca simplificado e ficheiros em alta resolução (PNG, PDF e vectorial).`,
      },
      {
        q: "Podem ajudar-me a registar a minha empresa em Angola?",
        a: `Sim. O serviço de criação e registo de empresas custa ${extra("empresa")} Kz e inclui verificação e reserva do nome, pacto social ou estatutos, registo no Guiché Único da Empresa, NIF empresarial, alvará comercial e acompanhamento na abertura de conta bancária.`,
      },
    ],
  },
  {
    id: "geral",
    title: "Sobre a Kodeza e a 3M",
    items: [
      {
        q: "Qual é a diferença entre a Kodeza e a 3M?",
        a: "A Kodeza é a empresa angolana de desenvolvimento de websites e aplicações web. A 3M é a nossa unidade de marketing digital, dedicada à gestão profissional de redes sociais. Juntas, cobrimos da presença online à comunicação digital.",
      },
      {
        q: "Trabalham só em Luanda?",
        a: "Estamos sediados em Luanda, mas já entregámos projectos para clientes em Angola e em Portugal (Porto).",
      },
      {
        q: "Como peço uma proposta?",
        a: `Use o formulário da página de contacto ou fale connosco pelo WhatsApp (${COMPANY.phone}) ou por e-mail (${COMPANY.email}). Respondemos com uma proposta com preço e prazo.`,
      },
    ],
  },
];
