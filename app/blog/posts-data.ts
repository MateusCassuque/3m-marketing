export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "estrategia-antes-da-execucao",
    title: "Estratégia antes de execução: por que pular essa etapa custa caro",
    excerpt:
      "Times ansiosos para lançar campanhas costumam pular o diagnóstico — e pagam esse preço em orçamento de mídia desperdiçado.",
    category: "Estratégia",
    date: "2026-06-02",
    readTime: "6 min de leitura",
    content: [
      "É comum uma marca chegar até nós já com a campanha desenhada na cabeça: peças prontas, canal escolhido, verba reservada. O problema é que, sem um diagnóstico anterior, essa campanha corre o risco de responder a uma pergunta errada.",
      "Estratégia não é burocracia. É o processo de entender, antes de gastar um real em mídia, quem é o público que realmente compra, o que a concorrência já testou (e falhou), e qual métrica de fato indica progresso para o negócio — não só para o painel de anúncios.",
      "Na prática, isso significa responder três perguntas antes de qualquer criativo ser produzido: qual problema estamos resolvendo para o cliente, por que ele nos escolheria em vez do concorrente, e qual ação queremos que ele tome depois de ver o anúncio.",
      "Marcas que pulam essa etapa costumam ver um padrão parecido: CPMs baixos, cliques até razoáveis, mas conversão fraca. O anúncio está tecnicamente correto, só que fala com a pessoa errada, ou promete a coisa errada.",
      "O diagnóstico não precisa ser demorado. Uma semana bem estruturada de pesquisa de mercado, análise de concorrência e entrevistas com o time comercial já muda completamente a qualidade das decisões seguintes — e evita meses otimizando uma campanha construída sobre uma premissa errada.",
    ],
  },
  {
    slug: "funil-de-trafego-pago-do-zero",
    title: "Como estruturar um funil de tráfego pago do zero",
    excerpt:
      "Um roteiro prático para organizar topo, meio e fundo de funil sem misturar todos os objetivos numa única campanha.",
    category: "Gestão de Tráfego",
    date: "2026-05-18",
    readTime: "8 min de leitura",
    content: [
      "Um erro recorrente em contas de anúncio é tentar fazer tudo com uma única campanha: gerar reconhecimento, educar e vender ao mesmo tempo, para a mesma audiência, com a mesma mensagem. O resultado costuma ser uma campanha mediana em todas as frentes.",
      "O primeiro passo é separar claramente os objetivos por etapa. No topo de funil, o objetivo é alcance qualificado — mostrar a marca para quem tem o perfil certo, sem pedir compromisso. No meio, a audiência já conhece a marca e o objetivo passa a ser engajamento e captura de contato. No fundo, o foco é conversão direta, geralmente para quem já demonstrou interesse.",
      "Cada etapa merece um criativo e uma oferta diferentes. Um vídeo institucional funciona bem no topo, mas tende a ter desempenho fraco quando usado como anúncio de conversão no fundo de funil, onde uma oferta objetiva costuma performar melhor.",
      "A segmentação segue a mesma lógica: públicos frios e amplos no topo, públicos de engajamento (quem interagiu com posts, vídeos ou visitou o site) no meio, e remarketing qualificado no fundo — carrinho abandonado, formulário iniciado, página de preço visitada.",
      "Por fim, o orçamento deve refletir a maturidade da conta. Contas novas, sem histórico de dados, tendem a se beneficiar de mais investimento em topo para gerar sinal para o algoritmo. Contas maduras, com uma boa base de remarketing, podem inverter essa proporção e concentrar verba no fundo de funil.",
      "Estruturado dessa forma, cada etapa do funil pode ser otimizada de forma independente — e fica muito mais fácil identificar exatamente onde a jornada do cliente está travando.",
    ],
  },
  {
    slug: "metricas-que-importam-em-midias-sociais",
    title: "Mídias sociais: métricas que realmente importam em 2026",
    excerpt:
      "Curtidas e seguidores contam parte da história. Veja quais números merecem mais atenção no relatório mensal.",
    category: "Mídias Sociais",
    date: "2026-04-27",
    readTime: "5 min de leitura",
    content: [
      "Número de seguidores é a métrica mais fácil de explicar para quem não trabalha com marketing — e, por isso mesmo, costuma receber atenção desproporcional ao seu real impacto no negócio.",
      "Taxa de salvamento e compartilhamento tende a ser um indicador mais honesto de relevância do que curtidas: salvar um conteúdo é um sinal de que a pessoa considerou aquilo útil o suficiente para consultar depois, o que costuma se correlacionar melhor com intenção de compra.",
      "Alcance sobre seguidores (quantas pessoas fora da sua base o conteúdo atingiu) mostra se o perfil está apenas confirmando quem já segue a marca ou efetivamente conquistando audiência nova — essencial para quem está em fase de crescimento.",
      "Taxa de resposta e tempo médio de resposta na caixa de mensagens costumam ser ignorados nos relatórios, mas impactam diretamente conversão: um lead que manda mensagem e não recebe retorno em algumas horas tende a procurar o concorrente.",
      "Nenhuma dessas métricas substitui o indicador mais importante: quantas conversas geradas nas redes sociais efetivamente viraram vendas. É esse número, cruzado com o CRM da empresa, que conecta o trabalho de conteúdo ao resultado financeiro.",
    ],
  },
  {
    slug: "sinais-de-que-sua-marca-precisa-de-reposicionamento",
    title: "5 sinais de que sua marca precisa de reposicionamento",
    excerpt:
      "Nem sempre o problema é o produto. Às vezes é a forma como a marca se apresenta que está afastando o cliente certo.",
    category: "Branding",
    date: "2026-03-11",
    readTime: "7 min de leitura",
    content: [
      "O primeiro sinal costuma aparecer no discurso comercial: quando o time de vendas precisa 'reexplicar' a marca a cada nova conversa, isso indica que o posicionamento não está se comunicando sozinho através dos materiais existentes.",
      "O segundo é a inconsistência entre canais — um site que parece premium, um perfil de Instagram que parece amador e um catálogo impresso com uma identidade visual completamente diferente. Cada ponto de contato conta uma história diferente sobre quem é a empresa.",
      "O terceiro sinal é atrair o cliente errado de forma recorrente: leads que pedem desconto assim que veem o preço, ou clientes que cancelam cedo porque a expectativa criada pela comunicação não bate com a experiência real do produto.",
      "O quarto é interno: quando o próprio time tem dificuldade de explicar, em uma frase, por que a empresa existe e por que ela é diferente da concorrente mais próxima. Se o time não sabe articular isso, o mercado dificilmente vai perceber sozinho.",
      "O quinto é estagnação de marca em um mercado que mudou — categorias inteiras se reposicionam ao longo dos anos, e uma marca que não acompanha essa evolução corre o risco de parecer datada mesmo com um produto atual.",
      "Reposicionar não significa recomeçar do zero. Na maioria dos casos, é um processo de clareza: identificar o que já funciona, cortar o que gera ruído e alinhar todos os pontos de contato em torno de uma única mensagem central.",
    ],
  },
];

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function formatPostDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
