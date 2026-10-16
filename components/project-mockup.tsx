import { useId } from "react";
import Image from "next/image";

import type { MockKind, Project } from "@/lib/site-data";

/**
 * Ilustração de um site num "browser", gerada em SVG com as cores de cada
 * projecto. Serve de imagem de capa enquanto não houver captura de ecrã real:
 * basta definir `image` no projecto (em lib/site-data.ts) para a substituir.
 */

type P = { bg: string; a: string; b: string; name: string };

const W = 640;
const H = 400;
const TOP = 30;

const Lines = ({ x, y, w, color = "#fff", o = 0.9, h = 10, gap = 18, n = 3 }: {
  x: number; y: number; w: number; color?: string; o?: number; h?: number; gap?: number; n?: number;
}) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w * (1 - i * 0.18)} height={h} rx={h / 2} fill={color} opacity={o - i * 0.2} />
    ))}
  </>
);

function Title({ x, y, size, name, fill = "#fff" }: { x: number; y: number; size: number; name: string; fill?: string }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={800} fill={fill} style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
      {name}
    </text>
  );
}

function Learn({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill={bg} />
      {/* plataforma offshore */}
      <g opacity={0.35} fill={b}>
        <rect x={380} y={170} width={200} height={10} />
        <rect x={400} y={180} width={6} height={90} />
        <rect x={470} y={180} width={6} height={90} />
        <rect x={550} y={180} width={6} height={90} />
        <rect x={420} y={130} width={70} height={40} />
        <path d="M440 130 L448 70 L456 130Z" />
      </g>
      <rect x={0} y={282} width={W} height={118} fill="#fff" opacity={0.04} />
      <rect x={36} y={78} width={86} height={22} rx={11} fill={a} />
      <Title x={36} y={150} size={40} name={name} />
      <Lines x={36} y={172} w={250} n={2} />
      <rect x={36} y={222} width={120} height={36} rx={18} fill={a} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={36 + i * 196} y={296} width={180} height={84} rx={12} fill="#fff" opacity={0.95} />
          <rect x={48 + i * 196} y={308} width={36} height={36} rx={8} fill={i === 1 ? a : b} />
          <Lines x={94 + i * 196} y={310} w={72} color="#0B1F3A" o={0.7} h={8} gap={14} n={2} />
          <rect x={48 + i * 196} y={354} width={140} height={8} rx={4} fill="#0B1F3A" opacity={0.15} />
        </g>
      ))}
    </>
  );
}

function Travel({ bg, a, b, name }: P) {
  const id = useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg} />
          <stop offset="1" stopColor={b} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <rect y={TOP} width={W} height={H - TOP} fill={`url(#sky${id})`} />
      <circle cx={500} cy={120} r={48} fill={a} opacity={0.95} />
      <path d={`M0 330 L120 220 L210 300 L320 190 L470 330 L560 260 L${W} 320 L${W} ${H} L0 ${H}Z`} fill="#fff" opacity={0.18} />
      <path d={`M0 360 L150 270 L260 350 L400 250 L${W} 350 L${W} ${H} L0 ${H}Z`} fill={bg} opacity={0.9} />
      <path d="M380 86 l46 12 -46 12 8 -12z" fill="#fff" />
      <Title x={36} y={118} size={38} name={name} />
      <Lines x={36} y={136} w={230} n={2} o={0.85} />
      <rect x={36} y={214} width={568} height={54} rx={27} fill="#fff" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={60 + i * 150} y={232} width={100} height={8} rx={4} fill="#0B3954" opacity={0.7} />
          <rect x={60 + i * 150} y={246} width={70} height={7} rx={3.5} fill="#0B3954" opacity={0.25} />
        </g>
      ))}
      <rect x={494} y={222} width={102} height={38} rx={19} fill={a} />
    </>
  );
}

function Agency({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill="#F4F8FC" />
      <rect y={TOP} width={W} height={200} fill={bg} />
      <Title x={36} y={120} size={36} name={name} />
      <Lines x={36} y={140} w={240} n={2} />
      <rect x={36} y={188} width={110} height={34} rx={17} fill={a} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={380 + i * 46} y={200 - (40 + i * 22)} width={30} height={40 + i * 22} rx={6} fill={i % 2 ? b : a} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={36 + i * 196} y={252} width={180} height={116} rx={14} fill="#fff" />
          <circle cx={62 + i * 196} cy={282} r={14} fill={[a, b, bg][i]} opacity={0.9} />
          <Lines x={84 + i * 196} y={274} w={80} color={bg} o={0.6} h={8} gap={14} n={2} />
          <Lines x={52 + i * 196} y={316} w={130} color={bg} o={0.25} h={7} gap={14} n={3} />
        </g>
      ))}
    </>
  );
}

function Delivery({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill={bg} />
      <circle cx={470} cy={230} r={150} fill={b} opacity={0.25} />
      <Title x={36} y={130} size={44} name={name} />
      <Lines x={36} y={152} w={230} n={2} />
      <rect x={36} y={206} width={130} height={38} rx={19} fill={a} />
      {/* telemóvel */}
      <rect x={400} y={52} width={150} height={330} rx={24} fill="#111" />
      <rect x={408} y={62} width={134} height={310} rx={18} fill="#fff" />
      <rect x={418} y={74} width={114} height={22} rx={11} fill="#F3F4F6" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={418} y={108 + i * 80} width={114} height={68} rx={12} fill="#FFF7ED" />
          <circle cx={446} cy={142 + i * 80} r={20} fill={i === 1 ? b : a} />
          <Lines x={474} y={130 + i * 80} w={52} color="#7C2D12" o={0.65} h={7} gap={12} n={3} />
        </g>
      ))}
      <circle cx={300} cy={300} r={52} fill="#fff" opacity={0.95} />
      <circle cx={300} cy={300} r={36} fill={a} />
      <circle cx={290} cy={290} r={8} fill="#fff" opacity={0.5} />
    </>
  );
}

function Shop({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill="#F6F7F9" />
      <rect y={TOP} width={150} height={H - TOP} fill={bg} />
      <Title x={18} y={72} size={20} name={name} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={18} y={96 + i * 34} width={i === 0 ? 112 : 90} height={20} rx={10} fill="#fff" opacity={i === 0 ? 0.95 : 0.25} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={172 + i * 156} y={52} width={140} height={64} rx={12} fill="#fff" />
          <rect x={184 + i * 156} y={64} width={50} height={8} rx={4} fill="#111827" opacity={0.3} />
          <rect x={184 + i * 156} y={82} width={90} height={18} rx={6} fill={[a, b, bg][i]} opacity={0.9} />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={172 + (i % 3) * 156} y={132 + Math.floor(i / 3) * 124} width={140} height={112} rx={12} fill="#fff" />
          <rect x={184 + (i % 3) * 156} y={144 + Math.floor(i / 3) * 124} width={116} height={54} rx={8} fill={[a, b, bg][i % 3]} opacity={0.25 + (i % 2) * 0.2} />
          <rect x={184 + (i % 3) * 156} y={208 + Math.floor(i / 3) * 124} width={70} height={7} rx={3.5} fill="#111827" opacity={0.5} />
          <rect x={184 + (i % 3) * 156} y={222 + Math.floor(i / 3) * 124} width={44} height={9} rx={4.5} fill={a} />
        </g>
      ))}
    </>
  );
}

function Market({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill={bg} />
      <Title x={36} y={110} size={38} name={name} />
      <Lines x={36} y={130} w={220} n={2} />
      <rect x={36} y={178} width={540} height={42} rx={21} fill="#fff" opacity={0.95} />
      <rect x={52} y={194} width={180} height={10} rx={5} fill={bg} opacity={0.4} />
      <rect x={480} y={186} width={88} height={26} rx={13} fill={a} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={36 + i * 196} y={244} width={180} height={128} rx={14} fill="#fff" opacity={0.96} />
          <circle cx={66 + i * 196} cy={276} r={18} fill={[a, b, "#FBBF24"][i]} />
          <Lines x={92 + i * 196} y={266} w={80} color={bg} o={0.7} h={8} gap={14} n={2} />
          {[0, 1, 2].map((j) => (
            <rect key={j} x={52 + i * 196 + j * 52} y={316} width={46} height={16} rx={8} fill={bg} opacity={0.14} />
          ))}
          <rect x={52 + i * 196} y={344} width={90} height={14} rx={7} fill={a} opacity={0.85} />
        </g>
      ))}
    </>
  );
}

function Food({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill={bg} />
      <circle cx={470} cy={210} r={140} fill={b} opacity={0.22} />
      <circle cx={470} cy={210} r={112} fill="#fff" opacity={0.95} />
      <circle cx={470} cy={210} r={82} fill={a} />
      <circle cx={440} cy={190} r={22} fill={b} opacity={0.9} />
      <circle cx={500} cy={228} r={18} fill="#fff" opacity={0.35} />
      <circle cx={474} cy={246} r={12} fill={b} opacity={0.7} />
      <Title x={36} y={130} size={46} name={name} fill={a} />
      <Lines x={36} y={152} w={220} n={2} o={0.7} />
      <rect x={36} y={206} width={132} height={38} rx={19} fill={a} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={36} y={274 + i * 34} width={130} height={8} rx={4} fill="#fff" opacity={0.75} />
          <rect x={176} y={278 + i * 34} width={110} height={1.5} fill="#fff" opacity={0.3} />
          <rect x={296} y={274 + i * 34} width={44} height={8} rx={4} fill={a} />
        </g>
      ))}
    </>
  );
}

function Clinic({ bg, a, b, name }: P) {
  return (
    <>
      <rect y={TOP} width={W} height={H - TOP} fill="#F0FDFA" />
      <rect y={TOP} width={W} height={190} fill={bg} />
      <circle cx={520} cy={120} r={74} fill={a} opacity={0.25} />
      <rect x={502} y={84} width={36} height={72} rx={8} fill="#fff" />
      <rect x={484} y={102} width={72} height={36} rx={8} fill="#fff" />
      <Title x={36} y={116} size={42} name={name} />
      <Lines x={36} y={136} w={230} n={2} />
      <rect x={36} y={184} width={150} height={34} rx={17} fill={a} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={36 + i * 196} y={246} width={180} height={122} rx={14} fill="#fff" />
          <circle cx={66 + i * 196} cy={282} r={18} fill={[a, b, bg][i]} opacity={0.75} />
          <Lines x={92 + i * 196} y={272} w={80} color={bg} o={0.7} h={8} gap={14} n={2} />
          <Lines x={52 + i * 196} y={318} w={130} color={bg} o={0.2} h={7} gap={14} n={3} />
        </g>
      ))}
    </>
  );
}

const KINDS: Record<MockKind, (p: P) => React.ReactElement> = {
  learn: Learn,
  travel: Travel,
  agency: Agency,
  delivery: Delivery,
  shop: Shop,
  market: Market,
  food: Food,
  clinic: Clinic,
};

export function ProjectMockup({ project, className }: { project: Project; className?: string }) {
  if (project.image) {
    return (
      <div className={`relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-900 ${className ?? ""}`}>
        <Image src={project.image} alt={`Captura do site ${project.name}`} fill sizes="(min-width: 1024px) 400px, 90vw" className="object-cover object-top" />
      </div>
    );
  }

  const Kind = KINDS[project.kind];
  const [bg, a, b] = project.palette;
  const host = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Ilustração do site ${project.name}`}
      className={`block h-auto w-full overflow-hidden rounded-xl bg-white ${className ?? ""}`}
    >
      <rect width={W} height={H} fill="#fff" />
      <Kind bg={bg} a={a} b={b} name={project.name} />
      {/* barra do browser */}
      <rect width={W} height={TOP} fill="#EEF1F6" />
      <circle cx={16} cy={15} r={4.5} fill="#FF5F57" />
      <circle cx={32} cy={15} r={4.5} fill="#FEBC2E" />
      <circle cx={48} cy={15} r={4.5} fill="#28C840" />
      <rect x={70} y={7} width={300} height={16} rx={8} fill="#fff" />
      <text x={82} y={19} fontSize={10} fill="#64748B" style={{ fontFamily: "system-ui, sans-serif" }}>
        {host}
      </text>
    </svg>
  );
}
