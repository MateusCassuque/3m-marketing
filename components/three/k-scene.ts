import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { K_LAYERS, K_PIXELS, K_SIZE, type KPoly } from "./k-geometry";

export type MountOptions = { onReady?: () => void };

const HEIGHT = 4; // altura do "K" em unidades da cena

/**
 * Monta a cena 3D do hero: o "K" da Kodeza extrudido a partir do logotipo
 * oficial, com os píxeis do logótipo a flutuar à volta. Devolve a função de
 * limpeza (chamada quando o componente React é desmontado).
 */
export function mountKScene(container: HTMLElement, options: MountOptions = {}): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  // ---- Luzes ----
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 5, 7);
  scene.add(key);
  const rimBlue = new THREE.PointLight(0x1fb4ec, 90, 18, 2);
  rimBlue.position.set(5, 2, 3);
  scene.add(rimBlue);
  const rimOrange = new THREE.PointLight(0xff7f0a, 60, 16, 2);
  rimOrange.position.set(-5, -3, 2);
  scene.add(rimOrange);

  // ---- Geometria do K ----
  const [kw, kh] = K_SIZE as unknown as [number, number];
  const s = HEIGHT / kh;
  const cx = kw / 2;
  const cy = kh / 2;
  const pt = (q: number[]) => new THREE.Vector2((q[0] - cx) * s, -(q[1] - cy) * s);

  const toShape = (poly: KPoly) => {
    const shape = new THREE.Shape(poly.outer.map(pt));
    poly.holes.forEach((h) => shape.holes.push(new THREE.Path(h.map(pt))));
    return shape;
  };

  const disposables: { dispose: () => void }[] = [];

  const layer = (
    polys: KPoly[],
    color: string,
    depth: number,
    z: number,
    extra: Partial<THREE.MeshPhysicalMaterialParameters> = {},
  ) => {
    const material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.12,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      ...extra,
    });
    disposables.push(material);
    const group = new THREE.Group();
    polys.forEach((poly) => {
      const geometry = new THREE.ExtrudeGeometry(toShape(poly), {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.03,
        bevelOffset: -0.02,
        bevelSegments: 3,
        curveSegments: 1,
      });
      disposables.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = z;
      group.add(mesh);
    });
    return group;
  };

  const kGroup = new THREE.Group();
  kGroup.add(layer(K_LAYERS.silhouette, "#003a80", 0.38, -0.04));
  kGroup.add(layer(K_LAYERS.dark, "#002b6d", 0.42, 0));
  kGroup.add(layer(K_LAYERS.mid, "#007ec7", 0.5, 0));
  kGroup.add(layer(K_LAYERS.light, "#00afea", 0.6, 0));

  // O chevron laranja flutua à frente do K (profundidade real).
  const orange = layer(K_LAYERS.orange, "#ff7f0a", 0.5, 0.7, {
    emissive: new THREE.Color("#ff6a00"),
    emissiveIntensity: 0.25,
  });
  kGroup.add(orange);

  // Píxeis do logótipo — cubos pequenos com a cor original de cada um.
  const pixelGeo = new THREE.BoxGeometry(1, 1, 1);
  disposables.push(pixelGeo);
  const pixels: { mesh: THREE.Mesh; base: THREE.Vector3; phase: number }[] = [];
  K_PIXELS.forEach((p, i) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: p.color,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1,
    });
    disposables.push(material);
    const size = (p.w * s) * 0.95;
    const mesh = new THREE.Mesh(pixelGeo, material);
    mesh.scale.set(size, size, size);
    const x = (p.x + p.w / 2 - cx) * s;
    const y = -(p.y + p.h / 2 - cy) * s;
    const z = 0.3 + (i % 3) * 0.35;
    mesh.position.set(x, y, z);
    mesh.rotation.set(0.4 * i, 0.5 * i, 0);
    kGroup.add(mesh);
    pixels.push({ mesh, base: mesh.position.clone(), phase: i * 1.3 });
  });

  // Cubos soltos em redor, a dar profundidade e escala.
  const palette = ["#00afea", "#0098dc", "#007ec7", "#ff7f0a", "#5cc8f2", "#0a2a5e"];
  const drifters: {
    mesh: THREE.Mesh;
    base: THREE.Vector3;
    speed: THREE.Vector3;
    phase: number;
  }[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 22; i++) {
    const material = new THREE.MeshPhysicalMaterial({
      color: palette[i % palette.length],
      roughness: 0.28,
      metalness: 0.1,
      clearcoat: 1,
      transparent: true,
      opacity: 0.92,
    });
    disposables.push(material);
    const size = 0.1 + rand() * 0.28;
    const mesh = new THREE.Mesh(pixelGeo, material);
    mesh.scale.set(size, size, size);
    const angle = rand() * Math.PI * 2;
    const radius = 2.6 + rand() * 2.4;
    const base = new THREE.Vector3(
      Math.cos(angle) * radius * 1.15,
      Math.sin(angle) * radius * 0.75,
      -1.4 + rand() * 3.4,
    );
    mesh.position.copy(base);
    mesh.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    kGroup.add(mesh);
    drifters.push({
      mesh,
      base,
      speed: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.6),
      phase: rand() * 6.28,
    });
  }

  scene.add(kGroup);

  // ---- Tamanho responsivo ----
  const resize = () => {
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Em ecrãs estreitos afasta a câmara para o "K" caber inteiro.
    const base = 11;
    camera.position.z = camera.aspect < 1 ? base / Math.max(camera.aspect, 0.55) * 0.92 : base;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // ---- Interacção ----
  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  const onPointerLeave = () => {
    pointer.x = 0;
    pointer.y = 0;
  };
  if (!reduceMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);
  }

  // ---- Ciclo de animação ----
  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;
  let visible = true;
  const current = { rx: 0, ry: -0.35 };
  let intro = reduceMotion ? 1 : 0;

  const frame = () => {
    const t = clock.getElapsedTime();
    if (intro < 1) intro = Math.min(1, intro + 0.018);
    const ease = 1 - Math.pow(1 - intro, 3);

    const targetY = reduceMotion ? -0.3 : -0.35 + pointer.x * 0.45 + Math.sin(t * 0.5) * 0.18;
    const targetX = reduceMotion ? 0.05 : -pointer.y * 0.25 + Math.cos(t * 0.4) * 0.06;
    current.ry += (targetY - current.ry) * 0.06;
    current.rx += (targetX - current.rx) * 0.06;
    kGroup.rotation.set(current.rx, current.ry, 0);
    kGroup.scale.setScalar(0.82 + ease * 0.18);
    kGroup.position.y = Math.sin(t * 0.8) * 0.08 * (reduceMotion ? 0 : 1);

    if (!reduceMotion) {
      orange.position.z = 0.7 + Math.sin(t * 1.1) * 0.08;
      pixels.forEach((p) => {
        p.mesh.position.y = p.base.y + Math.sin(t * 1.2 + p.phase) * 0.07;
        p.mesh.rotation.x += 0.004;
        p.mesh.rotation.y += 0.006;
      });
      drifters.forEach((d) => {
        d.mesh.position.set(
          d.base.x + Math.sin(t * 0.4 + d.phase) * 0.25,
          d.base.y + Math.cos(t * 0.5 + d.phase) * 0.3,
          d.base.z + Math.sin(t * 0.3 + d.phase) * 0.2,
        );
        d.mesh.rotation.x += d.speed.x * 0.01;
        d.mesh.rotation.y += d.speed.y * 0.01;
        d.mesh.rotation.z += d.speed.z * 0.01;
      });
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || reduceMotion) return;
    running = true;
    clock.start();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  if (reduceMotion) {
    kGroup.rotation.set(0.05, -0.3, 0);
    renderer.render(scene, camera);
  } else {
    start();
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    },
    { threshold: 0.01 },
  );
  io.observe(container);

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (visible) start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  // Re-renderiza quando o tamanho muda (modo sem animação).
  const rerender = () => {
    if (reduceMotion) renderer.render(scene, camera);
  };
  const ro2 = new ResizeObserver(rerender);
  ro2.observe(container);

  requestAnimationFrame(() => options.onReady?.());

  return () => {
    stop();
    io.disconnect();
    resizeObserver.disconnect();
    ro2.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerleave", onPointerLeave);
    disposables.forEach((d) => d.dispose());
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (canvas.parentElement === container) container.removeChild(canvas);
  };
}
