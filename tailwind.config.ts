import type { Config } from "tailwindcss";

// Paleta extraída do logotipo da Kodeza:
//  - navy      → o azul-marinho do wordmark
//  - primary   → as fitas do "K" (do ciano ao azul profundo)
//  - accent    → o laranja da seta e do pixel
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#EAF7FE",
          100: "#CFEEFC",
          200: "#9EDDF8",
          300: "#5CC8F2",
          400: "#1FB4EC",
          500: "#0098DC",
          600: "#007EC7",
          700: "#0059A2",
          800: "#00407A",
          900: "#002B6D",
        },
        navy: {
          DEFAULT: "#0A2A5E",
          50: "#EEF2F8",
          100: "#D9E1EE",
          200: "#B3C2DB",
          300: "#8197BA",
          400: "#4F6C9B",
          500: "#2B4A7E",
          600: "#17376B",
          700: "#0A2A5E",
          800: "#071E45",
          900: "#04132E",
          950: "#020B1D",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#FFF3E6",
          100: "#FFE2C2",
          400: "#FF9B3D",
          500: "#FF7F0A",
          600: "#E66A00",
          700: "#B85200",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0098DC 0%, #0A2A5E 100%)",
        "brand-arrow": "linear-gradient(90deg, #FF7F0A 0%, #FFB36B 100%)",
        "hero-night":
          "radial-gradient(1200px 600px at 78% 8%, rgba(0,152,220,0.35), transparent 60%), radial-gradient(800px 500px at 8% 100%, rgba(255,127,10,0.16), transparent 60%), linear-gradient(180deg, #04132E 0%, #071E45 100%)",
      },
      boxShadow: {
        card: "0 24px 50px -24px rgba(4, 19, 46, 0.35)",
        soft: "0 10px 30px -14px rgba(4, 19, 46, 0.18)",
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px -30px rgba(0,152,220,0.55)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.15)", opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "pulse-ring": "pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
