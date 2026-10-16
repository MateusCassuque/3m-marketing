"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PricingPlans } from "@/components/sections/pricing-plans";
import { Button } from "@/components/ui/button";

export function HomePricing() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-padded">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mx-auto">Planos para o seu site</p>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy-700 sm:text-5xl">
            Preço claro, em Kwanzas, sem custos escondidos
          </h2>
          <p className="mt-5 text-pretty text-muted-foreground">
            Todos os planos incluem domínio e hospedagem gratuitos, mais contas de e-mail
            profissionais.
          </p>
        </div>

        <div className="mt-14">
          <PricingPlans />
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="link" asChild>
            <Link href="/servicos">
              Ver todos os serviços e formas de pagamento
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
