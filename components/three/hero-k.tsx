"use client";

import Image from "next/image";

import { Starfield } from "@/components/starfield";
import { SceneCanvas } from "./scene-canvas";

/**
 * Fundo 3D do hero: céu estrelado + "K" da Kodeza. Enquanto a cena carrega (ou sem WebGL),
 * mostra o céu em CSS com o logótipo — sem caixas nem fundos quadrados.
 */
export function HeroK({ className }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      label="Logótipo da Kodeza em 3D sobre um céu estrelado"
      load={() => import("./k-scene").then((m) => m.mountKScene)}
      fallback={
        <div className="relative h-full w-full">
          <Starfield density="dense" />
          <div className="absolute inset-0 flex items-end justify-center pb-28 lg:items-center lg:justify-end lg:pb-0 lg:pr-[7%]">
            <Image
              src="/images/kodeza-mark.png"
              alt=""
              width={671}
              height={515}
              priority
              className="h-auto w-[62%] max-w-sm lg:w-[34%] lg:max-w-none"
            />
          </div>
        </div>
      }
    />
  );
}
