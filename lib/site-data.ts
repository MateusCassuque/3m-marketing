// Conteúdo central do site — extraído do Portfólio Corporativo da Kodeza & 3M.
// Para actualizar preços, projectos ou contactos, edite apenas este ficheiro.

export const COMPANY = {
  name: "Kodeza",
  unit: "3M",
  legalName: "KODEZA — Desenvolvimento de Websites e Aplicações Web",
  unitName: "3M — Agência de Marketing e Gestão de Redes Sociais",
  tagline: "Tecnologia que transforma ideias.",
  nif: "5002516888",
  phone: "+244 953 951 694",
  phoneHref: "tel:+244953951694",
  whatsappHref: "https://wa.me/244953951694",
  email: "geral@3mvisa.site",
  website: "www.3mvisa.site",
  address: "Luanda, Angola",
  hours: "Segunda a sexta, 9h às 17h",
} as const;

/* ------------------------------------------------------------------ */
/* Serviços                                                            */
/* ------------------------------------------------------------------ */

export type ServiceKey =
  | "website"
  | "webapp"
  | "landing"
  | "social"
  | "identidade"
  | "empresa";

export const SERVICES: {
  key: ServiceKey;
  title: string;
  description: string;
  from?: string;
}[] = [
  {
    key: "website",
    title: "Websites institucionais",
    description:
      "Páginas rápidas, seguras e feitas para o mercado angolano: Home, Sobre, Serviços, Portfólio e Contactos.",
    from: "125.000 Kz",
  },
  {
    key: "webapp",
    title: "Aplicações web e painel admin",
    description:
      "Sistemas à medida com painel de gestão e facturação certificada, para empresas de média e grande dimensão.",
    from: "250.000 Kz",
  },
  {
    key: "landing",
    title: "Landing pages",
    description:
      "Uma página focada numa única acção: vender um produto, divulgar um serviço ou captar clientes.",
    from: "50.000 Kz",
  },
  {
    key: "social",
    title: "Gestão de redes sociais",
    description:
      "A 3M cria, publica e anuncia por si: posts diários, vídeo profissional e campanhas pagas.",
    from: "49.970 Kz/mês",
  },
  {
    key: "identidade",
    title: "Identidade visual",
    description:
      "Logótipo original, paleta, tipografia, cartão de visita digital e manual de marca simplificado.",
    from: "25.000 Kz",
  },
  {
    key: "empresa",
    title: "Criação e registo de empresas",
    description:
      "Reserva do nome, pacto social, Guiché Único, NIF empresarial, alvará e apoio na abertura de conta.",
    from: "150.000 Kz",
  },
];

/* ------------------------------------------------------------------ */
/* Planos web                                                          */
/* ------------------------------------------------------------------ */

export type Plan = {
  id: string;
  name: string;
  price: string;
  audience: string;
  features: string[];
  highlight?: boolean;
};

export const WEB_PLANS: Plan[] = [
  {
    id: "landing",
    name: "Landing Page",
    price: "50.000",
    audience: "Perfeita para vender um produto, divulgar um serviço ou captar clientes.",
    features: ["Domínio gratuito", "Hospedagem gratuita", "1 conta de e-mail profissional"],
  },
  {
    id: "institucional",
    name: "Website Institucional",
    price: "125.000",
    audience: "Ideal para empresas e profissionais que desejam marcar presença online.",
    features: [
      "Página Inicial (Home)",
      "Sobre Nós",
      "Serviços",
      "Portfólio",
      "Página de Contactos",
      "Domínio gratuito",
      "Hospedagem gratuita",
      "3 contas de e-mail profissionais",
    ],
  },
  {
    id: "webapp",
    name: "WebApp + Painel Admin",
    price: "250.000",
    audience: "Ideal para empresas de média ou grande dimensão.",
    highlight: true,
    features: [
      "Página Inicial (Home)",
      "Sobre Nós, Serviços e Portfólio",
      "Página de Contactos",
      "Domínio gratuito",
      "Painel Admin com facturação certificada",
      "Hospedagem gratuita",
      "5 contas de e-mail profissionais",
    ],
  },
];

export const EXTRA_SERVICES = [
  {
    id: "identidade",
    name: "Criação de Identidade Visual",
    price: "25.000",
    audience: "Para quem quer uma marca profissional e consistente em todos os pontos de contacto.",
    features: [
      "Criação de logótipo original",
      "Paleta de cores da marca",
      "Tipografia oficial",
      "Cartão de visita digital",
      "Manual de marca simplificado",
      "Ficheiros em alta resolução (PNG, PDF e vectorial)",
    ],
  },
  {
    id: "empresa",
    name: "Criação e Registo de Empresas",
    price: "150.000",
    audience: "Para quem quer formalizar o negócio e começar a operar legalmente em Angola.",
    features: [
      "Verificação e reserva do nome da empresa",
      "Elaboração do pacto social / estatutos",
      "Registo no Guiché Único da Empresa",
      "Obtenção do NIF empresarial",
      "Alvará comercial",
      "Acompanhamento na abertura de conta bancária",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Gestão de redes sociais (3M)                                        */
/* ------------------------------------------------------------------ */

export type SocialPackage = {
  id: string;
  name: string;
  price: string;
  posts: string;
  videos: string;
  ads: string;
  adBudget: string;
  bonus: string;
  highlight?: boolean;
};

export const SOCIAL_PACKAGES: SocialPackage[] = [
  {
    id: "essencial",
    name: "Essencial",
    price: "49.970",
    posts: "2 posts por dia",
    videos: "1 vídeo profissional por mês",
    ads: "1 anúncio patrocinado (7 dias)",
    adBudget: "2 USD/dia de investimento em anúncios",
    bonus: "Landing Page grátis a partir do 10.º mês",
  },
  {
    id: "crescimento",
    name: "Crescimento",
    price: "74.970",
    posts: "3 posts por dia",
    videos: "2 vídeos profissionais por mês",
    ads: "1 anúncio patrocinado (9 dias)",
    adBudget: "3 USD/dia de investimento em anúncios",
    bonus: "Landing Page grátis a partir do 6.º mês",
    highlight: true,
  },
  {
    id: "dominio",
    name: "Domínio",
    price: "100.000",
    posts: "3 posts por dia",
    videos: "3 vídeos profissionais por mês",
    ads: "2 anúncios patrocinados (7 dias)",
    adBudget: "4 USD/dia de investimento em anúncios",
    bonus: "Landing Page grátis a partir do 3.º mês",
  },
];

export const SOCIAL_COMMON = [
  "Planeamento e gestão estratégica",
  "Calendário de conteúdos alinhado aos objectivos",
  "Conteúdo criado e publicado diariamente",
  "Orçamento de anúncios gerido pela equipa 3M",
];

export const PAYMENT_OPTIONS = [
  { title: "Pronto pagamento", text: "10% de desconto sobre o valor total do serviço." },
  { title: "Pagamento em 2 vezes", text: "50% na contratação e 50% na entrega do projecto." },
  { title: "Empresas", text: "Emissão de factura com pagamento a 30 dias." },
];

/* ------------------------------------------------------------------ */
/* Portfólio                                                           */
/* ------------------------------------------------------------------ */

export type ProjectCategory =
  | "Websites"
  | "Aplicações web"
  | "Turismo"
  | "Restauração"
  | "Saúde"
  | "Formação";

export type MockKind = "learn" | "travel" | "agency" | "delivery" | "shop" | "market" | "food" | "clinic";

export type Project = {
  slug: string;
  name: string;
  sector: string;
  category: ProjectCategory;
  description: string;
  highlights?: string[];
  url: string;
  kind: MockKind;
  /** Cores usadas no mockup: fundo, destaque principal, destaque secundário. */
  palette: [string, string, string];
  /** Opcional: caminho de uma captura de ecrã real em /public/images/projects/. */
  image?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: "clandre-energy",
    name: "Clandre Energy",
    sector: "Formação · Oil & Gas",
    category: "Formação",
    description:
      "Site institucional para escola de formação em Oil & Gas, com cursos Offshore e Onshore, HSE, galeria, blog e mais de 20 cursos certificados internacionalmente.",
    url: "https://www.clandre-energy.com",
    kind: "learn",
    palette: ["#0B1F3A", "#F59E0B", "#38BDF8"],
    featured: true,
  },
  {
    slug: "destinos-magicos",
    name: "Destinos Mágicos",
    sector: "Agência de viagens",
    category: "Turismo",
    description:
      "Website para agência de viagens angolana com assessoria de vistos (Portugal, França, Espanha, Alemanha e Brasil), bilhetes, hotéis, blog, FAQ e painel interno.",
    url: "https://destinos-magicos-mu.vercel.app",
    kind: "travel",
    palette: ["#0F3D5E", "#F97316", "#22D3EE"],
    featured: true,
  },
  {
    slug: "3m-agencia",
    name: "3M Agência de Marketing",
    sector: "Marketing digital",
    category: "Websites",
    description:
      "Site institucional da própria 3M, com apresentação dos serviços de estratégia, criatividade, gestão de tráfego, mídias sociais e branding, incluindo portfólio e blog.",
    url: "https://3mvisa.site",
    kind: "agency",
    palette: ["#123048", "#F5821F", "#1583A6"],
  },
  {
    slug: "kfood",
    name: "KFood",
    sector: "Food tech · Delivery",
    category: "Aplicações web",
    description:
      "Plataforma de delivery de comida para Luanda, com catálogo de restaurantes por categorias, sistema de pedidos e painel de gestão administrativo para restaurantes.",
    url: "https://k-foods.vercel.app",
    kind: "delivery",
    palette: ["#7C1D1D", "#FACC15", "#FB923C"],
    featured: true,
  },
  {
    slug: "tudo-aqui",
    name: "Tudo-Aqui",
    sector: "E-commerce · WebApp",
    category: "Aplicações web",
    description:
      "WebApp completa para lojas online: catálogo de produtos, gestão de stock e encomendas, facturação, relatórios e app instalável no telemóvel, tudo num só painel.",
    url: "https://tudo-aqui.shop",
    kind: "shop",
    palette: ["#14532D", "#A3E635", "#34D399"],
    featured: true,
  },
  {
    slug: "freela-ao",
    name: "Freela AO",
    sector: "Marketplace de freelancers",
    category: "Aplicações web",
    description:
      "Mercado de talento freelance angolano: publicação de projectos, propostas, pagamentos e perfis de profissionais organizados por categorias.",
    url: "https://freela-ao.vercel.app",
    kind: "market",
    palette: ["#312E81", "#A78BFA", "#F472B6"],
  },
  {
    slug: "globaltours",
    name: "Globaltours",
    sector: "Agência de viagens · Porto",
    category: "Turismo",
    description:
      "Site institucional e comercial para agência de viagens do Porto, com pesquisa por destino, data e passageiros, catálogo de pacotes e pedido de orçamento.",
    highlights: [
      "Destinos por continente e pacotes com detalhe",
      "Experiências: lua de mel, safari, cruzeiros, empresas",
      "Blog, FAQ, testemunhos e galeria",
      "Contacto directo por formulário e WhatsApp",
    ],
    url: "https://global-turs.vercel.app",
    kind: "travel",
    palette: ["#0B3954", "#BFD7EA", "#FF5A5F"],
  },
  {
    slug: "viatlantico",
    name: "VIATLANTICO",
    sector: "Operador turístico",
    category: "Turismo",
    description:
      "Site de operador turístico licenciado, em página única, com pesquisa de viagens, destinos, pacotes em destaque e pedido de orçamento gratuito.",
    highlights: [
      "Versão em 4 idiomas (PT, EN, ES, FR)",
      "Pacotes com preços e serviços incluídos",
      "9 tipos de viagem, do turismo religioso aos cruzeiros",
      "Blog, FAQ, galeria e botão de WhatsApp",
    ],
    url: "https://viatlantico.vercel.app",
    kind: "travel",
    palette: ["#0A2540", "#00B4D8", "#FFB703"],
  },
  {
    slug: "alcove",
    name: "Alcove",
    sector: "Restaurante · Cozinha indiana",
    category: "Restauração",
    description:
      "Site para restaurante e bar de cozinha indiana, chinesa e grelhados no Porto, pensado para mostrar o menu e converter visitas em reservas.",
    highlights: [
      "Menu por categorias, com descrição e preços",
      "Reserva de mesa online",
      "Galeria, Sobre Nós, FAQ e contactos",
      "SEO optimizado para pesquisa local",
    ],
    url: "https://alcove-seven.vercel.app",
    kind: "food",
    palette: ["#3B0D11", "#E9A23B", "#C2410C"],
  },
  {
    slug: "governita",
    name: "Governita",
    sector: "Restaurante · Tapas e cozinha portuguesa",
    category: "Restauração",
    description:
      "Site para restaurante de tapas e cozinha portuguesa no centro do Porto, com identidade elegante e foco na experiência gastronómica.",
    highlights: [
      "Menu em destaque e carta de vinhos",
      "Reserva de mesa online",
      "Galeria e secção dedicada ao chef",
      "Testemunhos, FAQ e newsletter",
    ],
    url: "https://governita.vercel.app",
    kind: "food",
    palette: ["#1C1917", "#D6B26A", "#7F1D1D"],
  },
  {
    slug: "activ-clinic",
    name: "Activ Clinic",
    sector: "Saúde · Policlínica",
    category: "Saúde",
    description:
      "Site de apresentação para policlínica multidisciplinar no Porto, focado na confiança do paciente e na marcação rápida de consultas.",
    highlights: [
      "Áreas de cuidado: medicina geral, família e bem-estar",
      "Marcação de consulta com um toque (chamada)",
      "Avaliações Google em destaque (4,9 · 36)",
      "Morada com mapa e horário de funcionamento",
    ],
    url: "https://active-clinic-web.lovable.app",
    kind: "clinic",
    palette: ["#064E3B", "#34D399", "#E0F2FE"],
  },
];

export const PROJECT_CATEGORIES: (ProjectCategory | "Todos")[] = [
  "Todos",
  "Websites",
  "Aplicações web",
  "Turismo",
  "Restauração",
  "Saúde",
  "Formação",
];

/* ------------------------------------------------------------------ */
/* Vantagens e processo                                                */
/* ------------------------------------------------------------------ */

export const ADVANTAGES = [
  {
    title: "Orgulho de ser angolano",
    text: "Equipa local que entende o mercado e as necessidades das empresas em Angola.",
  },
  {
    title: "Desempenho e segurança",
    text: "Sites rápidos, seguros e preparados para crescer com o seu negócio.",
  },
  {
    title: "Inovação e crescimento",
    text: "Soluções digitais actualizadas que acompanham a evolução da sua marca.",
  },
  {
    title: "Domínio e hospedagem incluídos",
    text: "Sem custos escondidos: domínio e hospedagem gratuitos em todos os planos.",
  },
  {
    title: "Suporte contínuo",
    text: "Acompanhamento próximo antes, durante e depois da entrega do projecto.",
  },
  {
    title: "Preços em Kwanzas",
    text: "Investimento adaptado à realidade do mercado angolano.",
  },
];

export const PROCESS = [
  {
    title: "Conversa e briefing",
    text: "Percebemos o seu negócio, o público e o que o site precisa de fazer por si.",
  },
  {
    title: "Desenho e protótipo",
    text: "Definimos estrutura, identidade e conteúdos. Aprova antes de escrevermos código.",
  },
  {
    title: "Desenvolvimento",
    text: "Construímos o site ou a aplicação, testamos em telemóvel e computador e afinamos o desempenho.",
  },
  {
    title: "Lançamento e suporte",
    text: "Publicamos com domínio e hospedagem incluídos e ficamos consigo depois da entrega.",
  },
];

export const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/servicos" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contacto", href: "/contato" },
];
