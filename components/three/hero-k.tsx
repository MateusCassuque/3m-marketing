"use client";

import Image from "next/image";

import { SceneCanvas } from "./scene-canvas";

export function HeroK({ className }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      label="Logótipo da Kodeza em 3D"
      load={() => import("./k-scene").then((m) => m.mountKScene)}
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/images/kodeza-mark.png"
            alt=""
            width={671}
            height={515}
            priority
            className="h-auto w-[78%] max-w-md drop-shadow-[0_30px_60px_rgba(0,152,220,0.35)]"
          />
        </div>
      }
    />
  );
}
