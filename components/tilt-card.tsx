"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Inclinação máxima em graus. */
  max?: number;
}

/**
 * Cartão com inclinação 3D que segue o cursor (só com rato — em ecrãs tácteis
 * fica estático). Os filhos podem usar `translateZ` para criar camadas.
 */
export function TiltCard({ children, className, max = 9 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const glareX = useTransform(px, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(240px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), transparent 60%)`;

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="perspective-1200">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("group/tilt relative will-change-transform", className)}
      >
        {children}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  );
}
