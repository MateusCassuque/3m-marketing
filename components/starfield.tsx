import { cn } from "@/lib/utils";

/**
 * Céu estrelado em CSS puro (sem JavaScript): serve de fundo nas páginas interiores e de
 * "primeira imagem" do hero enquanto a cena 3D carrega (ou se o dispositivo não tiver WebGL).
 * As posições são determinísticas, por isso o servidor e o browser desenham o mesmo.
 */
function makeStars(count: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const colors = ["#ffffff", "#ffffff", "#ffffff", "#a9dcff", "#5cc8f2", "#ffd2a1"];
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: rand() < 0.08 ? 3 : rand() < 0.4 ? 2 : 1.5,
    delay: rand() * 6,
    duration: 2.5 + rand() * 4,
    color: colors[Math.floor(rand() * colors.length)],
    opacity: 0.35 + rand() * 0.65,
  }));
}

const STARS = {
  dense: makeStars(110, 11),
  light: makeStars(55, 23),
};

export function Starfield({ density = "light", className }: { density?: keyof typeof STARS; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {STARS[density].map((star, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.color,
            opacity: star.opacity,
            boxShadow: star.size >= 3 ? `0 0 6px ${star.color}` : undefined,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
