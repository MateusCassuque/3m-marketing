import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
}

/**
 * Marca "3M" — replica o lettering em bloco do briefing: "3" e "M" em
 * gradiente azul-petróleo → navy, com um traço laranja de assinatura.
 */
export function Logo({ className, variant = "dark" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-0.5 select-none", className)}>
      <svg
        width="40"
        height="34"
        viewBox="0 0 40 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1583A6" />
            <stop offset="1" stopColor="#123048" />
          </linearGradient>
        </defs>
        <path
          d="M2 3.5C2 3.5 8 1 13 1C18 1 21 4 21 7.5C21 10.5 18.5 12 16.5 12.5C19 13 22 14.8 22 18.3C22 22.5 18 26 12.5 26C7.5 26 3 23.5 2 22"
          stroke="url(#logoGradient)"
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M26 26V6L32 16L38 6V26"
          stroke="url(#logoGradient)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M2 31C6 33 9 27 14 30"
          stroke="#F5821F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span
        className={cn(
          "font-display text-2xl font-extrabold tracking-tight",
          variant === "dark" ? "text-navy-700" : "text-white",
        )}
      >
        3M
      </span>
    </div>
  );
}
