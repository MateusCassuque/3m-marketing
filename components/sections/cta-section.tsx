"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/use-ui-store";

export function CtaSection() {
  const openContact = useUIStore((state) => state.openContact);

  return (
    <section id="contato" className="relative overflow-hidden bg-white py-20 lg:py-24">
      <div
        className="pointer-events-none absolute bottom-6 left-6 hidden h-28 w-28 text-primary-200 lg:block"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-dot-grid opacity-70" />
      </div>

      <div className="container-padded relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr_auto] lg:gap-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-balance font-display text-3xl font-extrabold leading-tight text-navy-700 sm:text-4xl"
        >
          Pronto para levar sua marca para o{" "}
          <span className="text-primary-500">próximo nível</span>?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="text-balance text-muted-foreground"
        >
          Fale com nosso time e descubra como podemos criar estratégias que
          geram resultados reais para o seu negócio.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
        >
          <Button variant="accent" size="lg" className="w-full lg:w-auto" onClick={openContact}>
            Vamos conversar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
