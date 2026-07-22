"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Descoberta",
    description: "Imersão no seu negócio, público e concorrência para entender o ponto de partida.",
  },
  {
    number: "02",
    title: "Estratégia",
    description: "Definição de metas, canais prioritários e plano de ação com prazos claros.",
  },
  {
    number: "03",
    title: "Execução",
    description: "Produção e lançamento das campanhas, conteúdos e peças criativas.",
  },
  {
    number: "04",
    title: "Otimização",
    description: "Análise contínua de dados e ajustes para melhorar performance a cada ciclo.",
  },
];

export function ProcessSteps() {
  return (
    <div className="container-padded">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mx-auto justify-center">Como trabalhamos</p>
        <h2 className="mt-4 text-balance font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">
          Um processo simples, do diagnóstico ao resultado
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative rounded-2xl border border-border bg-white p-6"
          >
            <span className="font-display text-4xl font-extrabold text-primary-100">
              {step.number}
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-navy-700">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
