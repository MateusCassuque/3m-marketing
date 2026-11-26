import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { K_LAYERS, K_PIXELS, K_SIZE, type KPoly } from "./k-geometry";

export type MountOptions = { onReady?: () => void };

const HEIGHT = 4; // altura do "K" em unidades da cena

/* ------------------------------------------------------------------ */
/* Céu estrelado                                                       */
/* ------------------------------------------------------------------ */

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aPhase * 1.6) + aPhase * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * uPixelRatio * (90.0 / -mv.z), 1.3 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    gl_FragColor = vec4(vColor, a * vTwinkle);
  }
`;

function buildStars(count: number, rand: () => number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#ffffff"),
    new THREE.Color("#ffffff"),
    new THREE.Color("#a9dcff"),
    new THREE.Color("#5cc8f2"),
    new THREE.Color("#ffd2a1"),
  ];

  for (let i = 0; i < count; i++) {
    const z = -100 + rand() * 80; // -100 … -20
    const halfH = Math.tan(THREE.MathUtils.degToRad(15)) * (24 - z) * 1.25;
    positions[i * 3] = (rand() * 2 - 1) * halfH * 2.6;
    positions[i * 3 + 1] = (rand() * 2 - 1) * halfH * 1.4;
    positions[i * 3 + 2] = z;
    sizes[i] = rand() < 0.07 ? 2.2 + rand() * 1.6 : 0.7 + rand() * 1.2;
    phases[i] = rand();
    const c = palette[Math.floor(rand() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { points: new THREE.Points(geometry, material), geometry, material };
}

function meteorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.8, "rgba(160,215,255,0.75)");
    g.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 8);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Monta a cena 3D do hero: um céu estrelado (com estrelas cadentes) e, à frente, o "K" da
 * Kodeza extrudido a partir do logótipo oficial. A tela ocupa o hero inteiro e é transparente,
 * por isso não há "caixa" à volta do objecto. Devolve a função de limpeza.
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

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 12.5);

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

  const disposables: { dispose: () => void }[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // ---- Céu ----
  const isSmall = Math.min(container.clientWidth, window.innerWidth) < 700;
  const sky = new THREE.Group();
  const stars = buildStars(isSmall ? 650 : 1400, rand);
  stars.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  sky.add(stars.points);
  disposables.push(stars.geometry, stars.material);
  scene.add(sky);

  const meteorTex = meteorTexture();
  disposables.push(meteorTex);
  const meteors = Array.from({ length: 3 }, (_, i) => {
    const geometry = new THREE.PlaneGeometry(7, 0.07);
    const material = new THREE.MeshBasicMaterial({
      map: meteorTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(geometry, material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -30;
    scene.add(mesh);
    return { mesh, material, t: -1, wait: 1.5 + i * 3 + rand() * 3, vx: 0, vy: 0 };
  });

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
    const size = p.w * s * 0.95;
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

  // Poeira cósmica: poucos cubos soltos à volta do K.
  const palette = ["#00afea", "#0098dc", "#007ec7", "#ff7f0a", "#5cc8f2"];
  const drifters: { mesh: THREE.Mesh; base: THREE.Vector3; speed: THREE.Vector3; phase: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const material = new THREE.MeshPhysicalMaterial({
      color: palette[i % palette.length],
      roughness: 0.28,
      metalness: 0.1,
      clearcoat: 1,
      transparent: true,
      opacity: 0.9,
    });
    disposables.push(material);
    const size = 0.08 + rand() * 0.2;
    const mesh = new THREE.Mesh(pixelGeo, material);
    mesh.scale.set(size, size, size);
    const angle = rand() * Math.PI * 2;
    const radius = 2.8 + rand() * 2.2;
    const base = new THREE.Vector3(
      Math.cos(angle) * radius * 1.1,
      Math.sin(angle) * radius * 0.75,
      -1.2 + rand() * 3,
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

  // ---- Tamanho e posição do K (à direita no computador, por baixo do texto no telemóvel) ----
  const home = { x: 0, y: 0, scale: 1 };
  const layout = () => {
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    if (camera.aspect >= 1.3) {
      camera.position.z = 12.5;
    } else {
      camera.position.z = (11 / Math.max(camera.aspect, 0.5)) * 0.95;
    }
    camera.updateProjectionMatrix();

    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visW = visH * camera.aspect;

    if (camera.aspect >= 1.3) {
      home.x = visW * 0.2;
      home.y = 0;
      home.scale = 1;
    } else if (camera.aspect >= 0.9) {
      home.x = visW * 0.12;
      home.y = -visH * 0.12;
      home.scale = 0.9;
    } else {
      home.x = 0;
      home.y = -visH * 0.24;
      home.scale = 0.95;
    }
  };
  layout();
  const resizeObserver = new ResizeObserver(() => {
    layout();
    if (reduceMotion) renderer.render(scene, camera);
  });
  resizeObserver.observe(container);

  // ---- Interacção ----
  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  let scrollP = 0;
  const onScroll = () => {
    scrollP = Math.min(Math.max(window.scrollY / Math.max(container.clientHeight, 1), 0), 1.2);
  };
  if (!reduceMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- Ciclo de animação ----
  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;
  let visible = true;
  const current = { rx: 0, ry: -0.35, px: 0, py: 0 };
  let intro = reduceMotion ? 1 : 0;
  let last = 0;

  const frame = () => {
    const t = clock.getElapsedTime();
    const dt = Math.min(t - last, 0.05);
    last = t;

    if (intro < 1) intro = Math.min(1, intro + 0.018);
    const ease = 1 - Math.pow(1 - intro, 3);

    // K
    const targetY = -0.35 + pointer.x * 0.45 + Math.sin(t * 0.5) * 0.18 + scrollP * 0.9;
    const targetX = -pointer.y * 0.25 + Math.cos(t * 0.4) * 0.06;
    current.ry += (targetY - current.ry) * 0.06;
    current.rx += (targetX - current.rx) * 0.06;
    kGroup.rotation.set(current.rx, current.ry, 0);
    kGroup.scale.setScalar(home.scale * (0.82 + ease * 0.18) * (1 - scrollP * 0.12));
    kGroup.position.set(home.x, home.y + Math.sin(t * 0.8) * 0.08 + scrollP * 0.9, 0);

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

    // Céu: cintilar, deriva lenta e paralaxe com o rato e o scroll.
    stars.material.uniforms.uTime.value = t;
    current.px += (pointer.x * -1.6 - current.px) * 0.04;
    current.py += (pointer.y * 1.0 - current.py) * 0.04;
    sky.position.set(current.px, -current.py + scrollP * 5, 0);
    sky.rotation.z = Math.sin(t * 0.03) * 0.02 + t * 0.004;

    // Estrelas cadentes
    meteors.forEach((m) => {
      if (m.t < 0) {
        m.wait -= dt;
        if (m.wait <= 0) {
          const angle = -0.35 - rand() * 0.25;
          m.mesh.rotation.z = angle;
          m.mesh.position.set(-18 + rand() * 36, 6 + rand() * 12, -30);
          m.vx = Math.cos(angle) * 26;
          m.vy = Math.sin(angle) * 26;
          m.t = 0;
        }
      } else {
        m.t += dt;
        m.mesh.position.x += m.vx * dt;
        m.mesh.position.y += m.vy * dt;
        m.material.opacity = Math.sin(Math.min(m.t / 1.3, 1) * Math.PI) * 0.9;
        if (m.t > 1.3) {
          m.t = -1;
          m.material.opacity = 0;
          m.wait = 5 + rand() * 8;
        }
      }
    });

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || reduceMotion) return;
    running = true;
    clock.start();
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  if (reduceMotion) {
    kGroup.rotation.set(0.05, -0.3, 0);
    kGroup.position.set(home.x, home.y, 0);
    kGroup.scale.setScalar(home.scale);
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

  requestAnimationFrame(() => options.onReady?.());

  return () => {
    stop();
    io.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    disposables.forEach((d) => d.dispose());
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (canvas.parentElement === container) container.removeChild(canvas);
  };
}
