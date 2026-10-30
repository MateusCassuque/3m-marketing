/**
 * Desenha um emblema (número) em cima do ícone do separador — vermelho para o que é
 * urgente, azul para o resto. É o que dá para controlar a 100%: o emblema do ícone da
 * app instalada é desenhado pelo sistema operativo (ver `setAppBadge`) e a cor é dele.
 */

const ICON_SRC = "/icons/icon-192x192.png";
const SIZE = 64;

export type BadgeTone = "red" | "blue";

const TONES: Record<BadgeTone, { top: string; bottom: string }> = {
  red: { top: "#FF5A5F", bottom: "#E11D48" },
  blue: { top: "#2BB8F2", bottom: "#0071B8" },
};

let baseImage: Promise<HTMLImageElement> | null = null;
const originals = new Map<HTMLLinkElement, { href: string; type: string | null }>();

function loadBase() {
  baseImage ??= new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = ICON_SRC;
  });
  return baseImage;
}

function iconLinks(): HTMLLinkElement[] {
  return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
}

function restore() {
  originals.forEach((original, link) => {
    link.href = original.href;
    if (original.type) link.type = original.type;
    else link.removeAttribute("type");
  });
}

export async function setFaviconBadge(count: number, tone: BadgeTone) {
  const links = iconLinks();
  if (links.length === 0) return;

  links.forEach((link) => {
    if (!originals.has(link)) originals.set(link, { href: link.href, type: link.getAttribute("type") });
  });

  if (count <= 0) {
    restore();
    return;
  }

  try {
    const base = await loadBase();
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(base, 0, 0, SIZE, SIZE);

    const label = count > 99 ? "99+" : String(count);
    const radius = label.length >= 3 ? 24 : label.length === 2 ? 22 : 20;
    const cx = SIZE - radius - 1;
    const cy = radius + 1;

    // sombra suave + círculo com gradiente + contorno branco
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    const gradient = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
    gradient.addColorStop(0, TONES[tone].top);
    gradient.addColorStop(1, TONES[tone].bottom);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${label.length >= 3 ? 20 : label.length === 2 ? 26 : 30}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(label, cx, cy + 1.5);

    const url = canvas.toDataURL("image/png");
    links.forEach((link) => {
      link.type = "image/png";
      link.href = url;
    });
  } catch {
    /* sem canvas/imagem: fica o ícone normal */
  }
}
