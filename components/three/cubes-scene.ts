import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import type { MountOptions } from "./k-scene";

/**
 * Campo de cubos flutuantes nas cores da Kodeza (os "píxeis" do logótipo).
 * Reage ao rato e é usado como fundo 3D nas secções de chamada para acção.
 */
export function mountCubesScene(container: HTMLElement, options: MountOptions = {}): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(-3, 4, 6);
  scene.add(sun);

  const COUNT = 46;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
  const palette = ["#00afea", "#0098dc", "#007ec7", "#ff7f0a", "#5cc8f2", "#1d4d99"].map(
    (c) => new THREE.Color(c),
  );

  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const items = Array.from({ length: COUNT }, (_, i) => {
    mesh.setColorAt(i, palette[i % palette.length]);
    return {
      base: new THREE.Vector3((rand() - 0.5) * 22, (rand() - 0.5) * 9, -2 + rand() * 5),
      size: 0.18 + rand() * 0.55,
      rot: new THREE.Vector3(rand() * 3, rand() * 3, rand() * 3),
      spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5),
      phase: rand() * 6.28,
    };
  });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  const update = (t: number) => {
    smooth.x += (pointer.x - smooth.x) * 0.05;
    smooth.y += (pointer.y - smooth.y) * 0.05;
    items.forEach((it, i) => {
      const depth = (it.base.z + 2) / 5; // 0..1 — mais perto mexe mais com o rato
      dummy.position.set(
        it.base.x + Math.sin(t * 0.35 + it.phase) * 0.35 + smooth.x * depth * 1.4,
        it.base.y + Math.cos(t * 0.45 + it.phase) * 0.4 - smooth.y * depth * 0.9,
        it.base.z,
      );
      dummy.rotation.set(
        it.rot.x + t * it.spin.x * 0.35,
        it.rot.y + t * it.spin.y * 0.35,
        it.rot.z + t * it.spin.z * 0.2,
      );
      dummy.scale.setScalar(it.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  const resize = () => {
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduceMotion) {
      update(0);
      renderer.render(scene, camera);
    }
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const onPointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  if (!reduceMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });

  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;
  let visible = true;

  const frame = () => {
    update(clock.getElapsedTime());
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
  start();

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

  requestAnimationFrame(() => options.onReady?.());

  return () => {
    stop();
    io.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);
    geometry.dispose();
    material.dispose();
    mesh.dispose();
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (canvas.parentElement === container) container.removeChild(canvas);
  };
}
