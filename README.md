# 3M — Agência de Marketing (Next.js 15)

Site institucional construído com **Next.js 15 (App Router)**, **React 18**,
**Tailwind CSS**, **shadcn/ui** (componentes escritos à mão), **Framer
Motion**, **Zustand**, **Zod** + **React Hook Form** e **Prisma**.
Identidade visual replicada do briefing: navy `#123048`, teal `#1583A6` e
laranja `#F5821F`.

## Instalação

```bash
npm install
cp .env.example .env      # preencha DATABASE_URL (PostgreSQL)
npx prisma migrate dev --name init
npm run dev
```

Abra `http://localhost:3000`.

## Estrutura

```
app/
  layout.tsx            # fonts (Sora + Inter), metadata
  globals.css            # tokens shadcn + paleta 3M
  page.tsx               # monta a página inteira
  api/contact/route.ts   # recebe o form (Zod) e salva via Prisma
components/
  logo.tsx
  site-header.tsx         # nav sticky, menu mobile (Sheet), CTA
  site-footer.tsx
  contact-dialog.tsx      # form com Zod + RHF, chama /api/contact
  sections/
    hero-section.tsx
    services-section.tsx
    stats-band.tsx
    cta-section.tsx
  ui/                    # button, dialog, sheet, input, textarea, label, select
lib/
  utils.ts                # helper cn (clsx + tailwind-merge)
  prisma.ts                # client singleton
  validations/contact.ts   # schema Zod do formulário
store/
  use-ui-store.ts          # estado global (Zustand): menu mobile, modal de contato
prisma/
  schema.prisma            # model Lead
```

## Paleta

| Token                    | Hex       |
|---------------------------|-----------|
| `navy-700`                | `#123048` |
| `primary-500` (teal)      | `#1583A6` |
| `accent-500` (laranja)    | `#F5821F` |

## Notas

- Todas as seções usam `whileInView` do Framer Motion (dispara uma vez, sem
  repetir ao rolar de volta).
- `prefers-reduced-motion` é respeitado em `globals.css`.
- O botão "Vamos conversar" (header e CTA final) abre o `ContactDialog`,
  que valida com Zod via `react-hook-form` e envia para `/api/contact`,
  que persiste o lead com Prisma (model `Lead` em `prisma/schema.prisma`).
- Os links `Sobre`, `Portfólio` e `Blog` no menu apontam para âncoras
  (`#sobre`, `#portfolio`, `#blog`) que ainda não existem como seções — o
  briefing original só cobria Início, Serviços e o CTA final. Crie essas
  seções/páginas quando tiver o conteúdo.
