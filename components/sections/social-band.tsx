"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ThumbsUp } from "lucide-react";

import { Logo3M } from "@/components/logo";
import { Button } from "@/components/ui/button";

/** Faixa da 3M na home: a continuação natural de um site novo. */
export function SocialBand() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-800 py-20 text-white lg:py-0">
      <div className="bg-grid-lines pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-40 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary-500/25 blur-[100px]"
        aria-hidden="true"
      />
      <div className="container-padded grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="lg:py-28">
          <div className="flex items-center gap-3">
            <Logo3M className="h-8" />
            <span className="text-sm font-semibold text-white/70">Agência de marketing da Kodeza</span>
          </div>
          <h2 className="mt-6 max-w-xl text-balance font-display text-3xl font-bold leading-tight sm:text-5xl">
            O site está no ar. Agora é preciso ser visto.
          </h2>
          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-white/70">
            A 3M gere as suas redes sociais todos os dias: conteúdo criado e publicado, vídeo
            profissional todos os meses e anúncios pagos para atrair novos clientes.
          </p>
          <p className="mt-8 flex items-baseline gap-2">
            <span className="text-sm text-white/60">a partir de</span>
            <span className="font-display text-5xl font-bold text-accent-400">49.970</span>
            <span className="text-sm font-semibold text-white/60">Kz por mês</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" asChild>
              <Link href="/servicos#redes-sociais">
                Ver pacotes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto h-[460px] w-full max-w-sm self-end sm:h-[560px] lg:max-w-md"
        >
          <div className="absolute inset-x-6 bottom-0 top-10 rounded-[2.5rem] bg-gradient-to-br from-primary-400 to-primary-800 opacity-90" />
          <Image
            src="/images/modeloEmoje.png"
            alt="Cliente da 3M a mostrar a página gerida no telemóvel"
            fill
            sizes="(min-width: 1024px) 420px, 90vw"
            className="object-contain object-bottom"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 top-24 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-700 shadow-card sm:-left-8"
          >
            <ThumbsUp className="h-4 w-4 text-primary-600" /> 2 posts por dia
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -right-2 top-1/2 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-700 shadow-card sm:-right-6"
          >
            <Heart className="h-4 w-4 text-accent-600" /> 1 vídeo profissional
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
