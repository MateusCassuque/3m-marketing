import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, BarChart3, Inbox, Receipt } from "lucide-react";

import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";
import { CubesBackdrop } from "@/components/three/cubes-backdrop";

export const metadata: Metadata = {
  title: "Entrar | Painel Kodeza",
  robots: { index: false, follow: false },
};

const HIGHLIGHTS = [
  { icon: Inbox, text: "Leads do site num só sítio" },
  { icon: BarChart3, text: "Pedidos e clientes organizados" },
  { icon: Receipt, text: "Facturas e finanças em Kwanzas" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-hero-night p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <CubesBackdrop className="absolute inset-0 -z-10" />
        <div className="bg-grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="flex">
          <Logo variant="light" className="h-10" />
        </div>
        <div>
          <h2 className="max-w-md text-balance font-display text-4xl font-bold leading-tight">
            Tudo o que a Kodeza · 3M gere, num painel só.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/45">Tecnologia que transforma ideias.</p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy-700"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <Logo className="h-9 lg:hidden" />
          <h1 className="mt-6 font-display text-3xl font-bold text-navy-700 lg:mt-0">Entrar no painel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use a conta que lhe foi atribuída para gerir leads, clientes, pedidos e facturas.
          </p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
