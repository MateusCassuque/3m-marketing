import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "dark" = logótipo a cores (fundos claros) · "light" = versão para fundos escuros */
  variant?: "dark" | "light";
  /**
   * horizontal → ícone + nome lado a lado (cabeçalhos e menus)
   * stacked    → logótipo completo com slogan (rodapé, login, documentos)
   * mark       → só o "K"
   */
  layout?: "horizontal" | "stacked" | "mark";
  priority?: boolean;
}

// Proporções reais dos ficheiros em /public/images
const SIZES = {
  horizontal: { w: 2390, h: 512 },
  stacked: { w: 1151, h: 783 },
  mark: { w: 671, h: 515 },
};

export function Logo({
  className,
  variant = "dark",
  layout = "horizontal",
  priority = false,
}: LogoProps) {
  const light = variant === "light";
  const src =
    layout === "mark"
      ? "/images/kodeza-mark.png"
      : layout === "stacked"
        ? light
          ? "/images/kodeza-logo-light.png"
          : "/images/kodeza-logo.png"
        : light
          ? "/images/kodeza-horizontal-light.png"
          : "/images/kodeza-horizontal.png";
  const { w, h } = SIZES[layout];
  const defaultHeight = layout === "stacked" ? "h-24" : layout === "mark" ? "h-10" : "h-9";

  return (
    <Image
      src={src}
      alt="Kodeza — Tecnologia que transforma ideias"
      width={w}
      height={h}
      priority={priority}
      className={cn("w-auto select-none", defaultHeight, className)}
    />
  );
}

/** Selo da unidade de marketing. Mantém o desenho original do logótipo 3M. */
export function Logo3M({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 34"
      className={cn("h-7 w-auto", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="3M"
      role="img"
    >
      <defs>
        <linearGradient id="logo3mGradient" x1="0" y1="0" x2="40" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1FB4EC" />
          <stop offset="1" stopColor="#0059A2" />
        </linearGradient>
      </defs>
      <path
        d="M2 3.5C2 3.5 8 1 13 1C18 1 21 4 21 7.5C21 10.5 18.5 12 16.5 12.5C19 13 22 14.8 22 18.3C22 22.5 18 26 12.5 26C7.5 26 3 23.5 2 22"
        stroke="url(#logo3mGradient)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M26 26V6L32 16L38 6V26"
        stroke="url(#logo3mGradient)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 31C6 33 9 27 14 30" stroke="#FF7F0A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
