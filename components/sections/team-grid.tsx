"use client";

import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  gradient: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Mateus F.L Cassuque",
    role: "CEO & Fundador",
    initials: "MC",
    gradient: "from-primary-500 to-navy-700",
  },
  {
    name: "Gildo Gamba",
    role: "Diretor de Criação",
    initials: "GG",
    gradient: "from-accent-500 to-accent-700",
  },
  {
    name: "José Severino",
    role: "Head de Performance",
    initials: "JS",
    gradient: "from-navy-500 to-primary-600",
  },
  {
    name: "Gisela K. Jinga",
    role: "Gerente de Mídias Sociais",
    initials: "GJ",
    gradient: "from-primary-400 to-accent-500",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function TeamGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4"
    >
      {TEAM.map((member) => (
        <motion.div key={member.name} variants={item} className="text-center">
          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white shadow-soft ${member.gradient}`}
          >
            {member.initials}
          </div>
          <h3 className="mt-4 font-display text-sm font-bold text-navy-700">{member.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
