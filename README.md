# Kodeza · 3M — site institucional e painel

Site da **Kodeza** (desenvolvimento web) e da **3M** (marketing digital e redes sociais), em Next.js 15 (App Router),
React 18, Tailwind, Framer Motion, **three.js**, Prisma/PostgreSQL e NextAuth.

## Arrancar

```bash
npm install                 # ou: bun install
cp .env.example .env        # preencha DATABASE_URL e NEXTAUTH_SECRET
npx prisma migrate deploy   # aplica as migrações (inclui a nova: serviços web + notas nos leads)
npm run seed                # cria a conta admin inicial (ADMIN_EMAIL / ADMIN_PASSWORD)
npm run dev
```

Criar outra conta do painel, sem endpoint público:

```bash
npm run admin:create -- "Nome" email@dominio.com "senha-com-10-ou-mais-caracteres" ADMIN
```

## Onde editar o conteúdo

Tudo o que vem do Portfólio Corporativo está em **`lib/site-data.ts`**: contactos, serviços, planos e preços (Kz),
pacotes de redes sociais, formas de pagamento, vantagens e a lista de projectos.

- **Capturas de ecrã reais:** guarde a imagem em `public/images/projects/<slug>.jpg` e defina `image: "/images/projects/<slug>.jpg"`
  no projecto. Sem `image`, o site mostra uma ilustração de browser com as cores do projecto.
- **Preços/pacotes:** alterar `WEB_PLANS`, `SOCIAL_PACKAGES`, `EXTRA_SERVICES`.

## 3D

- `components/three/k-geometry.ts` — contorno do "K" vectorizado do logótipo oficial.
- `components/three/k-scene.ts` — cena do hero (K extrudido + píxeis flutuantes, reage ao rato).
- `components/three/cubes-scene.ts` — campo de cubos (CTA e login).
- Carregamento tardio (code-splitting), pausa fora do ecrã, respeita `prefers-reduced-motion` e cai para o logótipo estático sem WebGL.
- `components/tilt-card.tsx` — cartões com inclinação 3D (portfólio).

## Logótipos

Em `public/images/`: `kodeza-logo.png` (cores), `kodeza-logo-light.png` (para fundos escuros), `kodeza-horizontal*.png`
(cabeçalhos) e `kodeza-mark.png` (só o "K"). Ícones, `favicon.ico` e `opengraph-image.png` foram gerados a partir do logótipo.

## Painel (`/admin`)

Dashboard com filtro de período, KPIs em Kz, gráficos, entregas próximas e facturas em atraso · Leads (pesquisa, filtros,
mudar estado, notas, converter em cliente, exportar CSV) · Clientes · Pedidos · Facturas (PDF com o logótipo novo) ·
Financeiro · Utilizadores (só administradores).

Perfis: **ADMIN** (tudo) e **EDITOR** (só consulta).

## Facturas

- O número (`FAT-0001`, `FAT-0002`…) vem de um **contador** (`InvoiceCounter`) que só avança. Eliminar uma factura não
  "devolve" o número, por isso nunca há colisões nem números repetidos (os saltos na numeração são intencionais).
  A migração `20261017120000_invoice_counter` arranca o contador no maior número já emitido.
- **Parcelas e valor em falta:** ao criar uma factura, escolhe o pedido e o valor a cobrar; o formulário mostra em tempo
  real *Total do pedido · Já facturado antes · Valor a cobrar · Valor em falta* e tem atalhos "Cobrar o restante" e "50%".
  A caixa **"Esta factura fecha o pedido"** força o valor em falta a zero (última parcela, desconto…). Se a soma
  ultrapassar o total, aparece um aviso a vermelho. O cálculo é feito no servidor (`lib/invoice-balance-server.ts`) e é
  refeito para todas as facturas do pedido sempre que uma é criada, editada, cancelada ou eliminada, ou se o valor do
  pedido muda — por isso nenhuma fica com números desactualizados. Facturas canceladas não contam como facturado.
  Aparece na tabela ("Em falta"), no detalhe, no PDF e nas páginas do cliente e do pedido.
- Cada cliente (`/admin/clientes/[id]`) e cada pedido (`/admin/pedidos/[id]`) tem uma página de resumo com as respectivas facturas.
- Filtros por estado: facturas (pendentes, vencidas, pagas, canceladas) e pedidos (por fase).

## Notificações

Sino no topo do painel (como no Facebook/YouTube), com contador, separadores "Todas / Não lidas", "marcar tudo como lido"
e uma página completa em `/admin/notificacoes`. São calculadas a partir dos dados (`lib/notifications.ts`):

- **Cobranças por fazer** — facturas vencidas;
- **Facturas pendentes** — ainda dentro do prazo, com os dias que faltam;
- **Pedidos atrasados** — entrega prevista ultrapassada e pedido não concluído.

Desaparecem sozinhas quando a factura é paga ou o pedido concluído. O "lido" é guardado por utilizador (`NotificationRead`).
Além do sino: contador no título do separador, **alertas do sistema** (barra de tarefas / centro de notificações, via
`public/sw.js`, activados no botão "Activar" do painel) e emblema no ícone quando o painel está instalado como app.
Os alertas só chegam com o painel aberto num separador; para avisar com tudo fechado seria preciso Web Push.

### Emblema no ícone

- **Ícone da app instalada:** o painel é instalável à parte (`public/admin-manifest.json`; abre direto em `/admin`) e usa a
  Badging API (`navigator.setAppBadge`) para mostrar o número de notificações por ler. Este emblema é desenhado pelo sistema
  operativo — a cor e o formato são dele (iOS/macOS: vermelho; Windows e Android variam) e não é possível mudá-los.
- **Ícone do separador:** `lib/favicon-badge.ts` desenha um emblema próprio — **vermelho** se há algo urgente (cobranças ou
  pedidos atrasados), **azul** se são só facturas pendentes. O sino do painel usa as mesmas cores.
- Botão "Instalar app do painel" no menu lateral (Chrome/Edge/Android; no iPhone: Partilhar → Adicionar ao ecrã principal).

### Diagnóstico

`/admin/notificacoes` termina com o cartão **"Diagnóstico do tempo real e do emblema"**: mostra se as variáveis do Pusher
existem no servidor e no browser, o estado da ligação, se os dois canais foram autorizados, e tem o botão
**"Enviar evento de teste"** (confirma o circuito completo e mede a latência). Do lado do emblema indica se o browser o
suporta, se está a usar a app instalada, a permissão de notificações e o último resultado do sistema.

### Tempo real (Pusher)

Quando uma factura ou pedido é criado, editado ou eliminado, o servidor envia um evento (sem dados) para os canais privados
`private-admins` e `private-user-<id>`; os painéis abertos voltam a consultar `/api/admin/notifications` e o sino, o contador
e os alertas do sistema actualizam-se em ~1 segundo. Marcar como lido sincroniza os outros dispositivos do mesmo utilizador.
A subscrição é autorizada em `/api/pusher/auth` (só com sessão do painel, e cada utilizador só no seu canal).

Variáveis (ver `.env.example`; no Vercel, em *Settings → Environment Variables*, e depois novo deploy):
`PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, **`PUSHER_SECRET`** (só no servidor).
Sem elas o tempo real fica desligado e o painel volta à consulta de minuto a minuto.

## Segurança — o que mudou

- Removido o endpoint público `/api/admin/register` (criava/repunha uma conta ADMIN com senha fixa no código).
- Senhas passam a bcrypt; as contas antigas (SHA-1) são migradas no primeiro login.
- `/dashboard` (público) removido; os leads vivem só em `/admin/leads`.
- Middleware protege apenas `/admin/*`; o formulário de contacto tem limite por IP.
