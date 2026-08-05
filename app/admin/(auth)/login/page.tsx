import type { Metadata } from "next";
import { Suspense } from "react";

import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Entrar | Painel 3M",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 shadow-card">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-4 font-display text-xl font-bold text-navy-700">
          Painel administrativo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre com sua conta para gerenciar leads, clientes e pedidos.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
