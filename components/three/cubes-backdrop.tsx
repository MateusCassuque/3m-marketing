"use client";

import { SceneCanvas } from "./scene-canvas";

export function CubesBackdrop({ className }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      load={() => import("./cubes-scene").then((m) => m.mountCubesScene)}
      fallback={null}
    />
  );
}
