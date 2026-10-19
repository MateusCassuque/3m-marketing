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
- Cada cliente (`/admin/clientes/[id]`) e cada pedido (`/admin/pedidos/[id]`) tem uma página de resumo com as respectivas facturas.
- Filtros por estado: facturas (pendentes, vencidas, pagas, canceladas) e pedidos (por fase).

## Segurança — o que mudou

- Removido o endpoint público `/api/admin/register` (criava/repunha uma conta ADMIN com senha fixa no código).
- Senhas passam a bcrypt; as contas antigas (SHA-1) são migradas no primeiro login.
- `/dashboard` (público) removido; os leads vivem só em `/admin/leads`.
- Middleware protege apenas `/admin/*`; o formulário de contacto tem limite por IP.
