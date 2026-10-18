/**
 * Monde WebGL (three.js, chargé à la demande) : un seul canvas persistant, piloté chaque image par l'état du
 * défilement (src/lib/store.ts). Chapitres : soute du long-courrier → orbite → entrée et tempête → dunes et ver →
 * épice → obscurité du Sietch. Tout est procédural : aucune texture, aucun modèle récupéré, aucun design officiel.
 */
import * as THREE from "three";
import { state, clamp01, lerp, smoothstep } from "../lib/store";
import { duneBase } from "./dunes";
import { DUNE_FRAG, DUNE_VERT, GLOW_FRAG, GLOW_VERT, HALO_FRAG, HALO_VERT, HULL_FRAG, HULL_VERT, LIGHT_FRAG, LIGHT_VERT, PARTICLE_FRAG, PARTICLE_VERT, PLANET_FRAG, PLANET_VERT, SKY_FRAG, SKY_VERT, WIND_VERT } from "./shaders";

export type WorldOptions = { tier: "low" | "mid" | "high" };

const SKY_WEIGHTS: Record<string, THREE.Vector3> = {
  day: new THREE.Vector3(1, 0, 0),
  dusk: new THREE.Vector3(0, 1, 0),
  night: new THREE.Vector3(0, 0, 1),
};
const SUN_DIRS: Record<string, THREE.Vector3> = {
  day: new THREE.Vector3(0.58, 0.30, -0.76).normalize(),
  dusk: new THREE.Vector3(0.66, 0.09, -0.74).normalize(),
  night: new THREE.Vector3(0.42, 0.40, -0.80).normalize(),
};

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function particleGeometry(count: number, box: THREE.Vector3, rand: () => number, sizeMin: number, sizeMax: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * box.x;
    pos[i * 3 + 1] = (rand() - 0.5) * box.y;
    pos[i * 3 + 2] = (rand() - 0.5) * box.z;
    seed[i] = rand();
    size[i] = sizeMin + rand() * (sizeMax - sizeMin);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  return g;
}

export function createWorld(canvas: HTMLCanvasElement, { tier }: WorldOptions): { dispose: () => void } {
  /* Qualité par niveau d'appareil : ordinateur / téléphone ou tablette / appareil faible. */
  const pick = <T,>(hi: T, mid: T, lo: T): T => (tier === "high" ? hi : tier === "mid" ? mid : lo);
  const high = tier === "high";
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: high, alpha: false, powerPreference: "high-performance", stencil: false });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, pick(1.5, 1.25, 1));
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x05040a, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05040a, 0.0);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 5000);
  const rand = seeded(1965);
  const skyName = document.documentElement.dataset.sky ?? "night";
  const skyW = (SKY_WEIGHTS[skyName] ?? SKY_WEIGHTS.night).clone();
  const sunDir = (SUN_DIRS[skyName] ?? SUN_DIRS.night).clone();
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(o: T): T => { disposables.push(o); return o; };

  /* ------------------------------------------------------------------ Espace : étoiles, planète, long-courrier */
  const space = new THREE.Group();
  scene.add(space);

  const starCount = pick(3200, 2000, 1100);
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 1400 + rand() * 1200, t = rand() * Math.PI * 2, p = Math.acos(2 * rand() - 1);
    starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
    starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    starPos[i * 3 + 2] = r * Math.cos(p);
  }
  const stars = new THREE.Points(
    keep(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(starPos, 3))),
    keep(new THREE.PointsMaterial({ color: 0xfff4e0, size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false })),
  );
  space.add(stars);

  // Arrakis : sphère + nuanceur de sable, halo d'atmosphère.
  const PLANET_R = 120;
  const planetMat = keep(new THREE.ShaderMaterial({
    vertexShader: PLANET_VERT,
    fragmentShader: PLANET_FRAG,
    uniforms: { uSunDir: { value: new THREE.Vector3(-0.6, 0.35, 0.72).normalize() }, uTime: { value: 0 }, uHaze: { value: 0 } },
  }));
  const planet = new THREE.Mesh(keep(new THREE.SphereGeometry(PLANET_R, pick(128, 96, 64), pick(96, 64, 48))), planetMat);
  planet.rotation.z = 0.35;
  space.add(planet);
  const haloMat = keep(new THREE.ShaderMaterial({
    vertexShader: HALO_VERT, fragmentShader: HALO_FRAG, transparent: true, depthWrite: false, side: THREE.FrontSide, blending: THREE.AdditiveBlending,
    uniforms: { uSunDir: planetMat.uniforms.uSunDir, uStrength: { value: 1.0 } },
  }));
  const halo = new THREE.Mesh(keep(new THREE.SphereGeometry(PLANET_R * 1.06, 64, 48)), haloMat);
  space.add(halo);

  // Le long-courrier : un fuseau de 300 unités, des anneaux de structure, une peau de modules, des feux de position.
  const ship = new THREE.Group();
  space.add(ship);
  // Directions en espace monde : froide de dessus-arrière (dos du fuseau, liseré), chaude et rasante depuis la
  // gauche-bas (le ventre que l'on voit depuis la soute se dégrade du clair au sombre : le volume se lit).
  const hullMat = keep(new THREE.ShaderMaterial({ vertexShader: HULL_VERT, fragmentShader: HULL_FRAG, uniforms: { uSunDir: { value: new THREE.Vector3(0.6, 0.7, -0.4).normalize() }, uShineDir: { value: new THREE.Vector3(-0.55, -0.75, 0.2).normalize() }, uTime: { value: 0 } } }));
  const ribMat = keep(new THREE.MeshStandardMaterial({ color: 0x8a7462, roughness: 0.55, metalness: 0.25, emissive: 0x2a1608, emissiveIntensity: 0.8 }));
  const profile: THREE.Vector2[] = [];
  const SHIP_L = 320;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const r = 2 + 12 * Math.sin(Math.PI * t) ** 0.55 + 1.5 * Math.sin(t * 40) * Math.sin(Math.PI * t);
    profile.push(new THREE.Vector2(r, (t - 0.5) * SHIP_L));
  }
  const spine = new THREE.Mesh(keep(new THREE.LatheGeometry(profile, pick(48, 32, 24))), hullMat);
  spine.rotation.z = Math.PI / 2; // axe long le long de X
  ship.add(spine);
  // Anneaux de structure : de vrais tores (jamais un tore mis à l'échelle : son tube deviendrait un disque).
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    const r = 15 + 9 * Math.sin(Math.PI * t);
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(r, 0.7, 8, pick(96, 64, 48))), ribMat);
    ring.position.x = (t - 0.5) * SHIP_L;
    ring.rotation.y = Math.PI / 2;
    ship.add(ring);
    // entretoises
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const strut = new THREE.Mesh(keep(new THREE.BoxGeometry(1.2, r - 10, 1.2)), ribMat);
      strut.position.set(ring.position.x, Math.cos(a) * (r / 2 + 5), Math.sin(a) * (r / 2 + 5));
      strut.rotation.x = -a;
      ship.add(strut);
    }
  }
  /* Profil lisse du fuseau (sans ses bourrelets) et pente locale : tout ce qui se pose sur la coque suit la surface. */
  const hullR = (t: number) => 2 + 12 * Math.sin(Math.PI * Math.min(Math.max(t, 0.001), 0.999)) ** 0.55;
  const hullSlope = (t: number) => Math.atan2(hullR(t + 0.004) - hullR(t - 0.004), 0.008 * SHIP_L);
  const dummy = new THREE.Object3D();
  // Modules : plats, posés sur la coque, groupés en « quartiers » (densité par bandes) ; teinte peu contrastée pour
  // lire d'abord les grandes tôles, puis les détails.
  const moduleCount = pick(1400, 900, 420);
  const modules = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 1, 1)), keep(new THREE.MeshStandardMaterial({ color: 0x5c4e42, roughness: 0.78, metalness: 0.2, emissive: 0x0d0804 })), moduleCount);
  const quarters: [number, number, number][] = [[0.2, 0.6, 1.0], [0.34, 2.9, 1.3], [0.47, 1.2, 0.9], [0.58, 4.6, 1.1], [0.69, 2.2, 1.0], [0.8, 5.4, 0.8]];
  for (let i = 0; i < moduleCount; i++) {
    const q = quarters[i % quarters.length];
    const t = Math.min(0.92, Math.max(0.08, q[0] + (rand() + rand() - 1) * 0.09));
    const a = q[1] + (rand() + rand() - 1) * q[2] + (rand() < 0.15 ? Math.PI : 0);
    const h = 0.25 + rand() * 0.55;
    const r = hullR(t) + h / 2 - 0.05 + 0.9 * Math.sin(40 * t) * Math.sin(Math.PI * t);
    dummy.position.set((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r);
    dummy.rotation.set(a, 0, hullSlope(t), "XZY");
    dummy.scale.set(1.2 + rand() * 4.5, h, 0.7 + rand() * 1.6);
    dummy.updateMatrix();
    modules.setMatrixAt(i, dummy.matrix);
  }
  modules.instanceMatrix.needsUpdate = true;
  const tint = new THREE.Color();
  for (let i = 0; i < moduleCount; i++) {
    const v = 0.82 + rand() * 0.36;
    modules.setColorAt(i, tint.setRGB(0.52 * v, 0.45 * v, 0.38 * v));
  }
  if (modules.instanceColor) modules.instanceColor.needsUpdate = true;
  ship.add(modules);
  // Rails longitudinaux : fins, en segments courts qui épousent le profil, à six angles fixes ; deux d'entre eux
  // portent les feux de bord (rouge d'un côté, vert de l'autre : des feux de navigation réinventés).
  const railAngles = [0.35, 1.45, 2.45, 3.5, 4.55, 5.7];
  const RAIL_SEG = pick(24, 16, 12);
  const railMat = keep(new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.45, metalness: 0.55, emissive: 0x0a0604 }));
  const rails = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 0.42, 0.55)), railMat, railAngles.length * RAIL_SEG);
  let ri = 0;
  for (const a of railAngles) {
    for (let k = 0; k < RAIL_SEG; k++) {
      const t0 = 0.1 + (k / RAIL_SEG) * 0.8, t1 = 0.1 + ((k + 1) / RAIL_SEG) * 0.8;
      const rr = (t: number) => hullR(t) + 0.55 + 1.5 * Math.sin(40 * t) * Math.sin(Math.PI * t);
      const r0 = rr(t0), r1 = rr(t1), tm = (t0 + t1) / 2, rm = (r0 + r1) / 2;
      const len = Math.hypot((t1 - t0) * SHIP_L, r1 - r0) + 0.4;
      dummy.position.set((tm - 0.5) * SHIP_L, Math.cos(a) * rm, Math.sin(a) * rm);
      dummy.rotation.set(a, 0, Math.atan2(r1 - r0, (t1 - t0) * SHIP_L), "XZY");
      dummy.scale.set(len, 1, 1);
      dummy.updateMatrix();
      rails.setMatrixAt(ri++, dummy.matrix);
    }
  }
  rails.instanceMatrix.needsUpdate = true;
  ship.add(rails);
  // Collier d'amarrage autour de la soute (t ≈ 0,31 : la soute est sous ce point de la coque), avec ses plots.
  const T_BAY = 0.31;
  const collarR = hullR(T_BAY) + 2.4;
  const collarMat = keep(new THREE.MeshStandardMaterial({ color: 0x6d5a48, roughness: 0.5, metalness: 0.45, emissive: 0x1a0e06, emissiveIntensity: 0.6 }));
  const collar = new THREE.Mesh(keep(new THREE.TorusGeometry(collarR, 1.7, 10, pick(96, 64, 48))), collarMat);
  collar.position.x = (T_BAY - 0.5) * SHIP_L;
  collar.rotation.y = Math.PI / 2;
  ship.add(collar);
  const plots = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(2.4, 1.4, 2.2)), collarMat, 12);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.26;
    dummy.position.set(collar.position.x, Math.cos(a) * (collarR + 1.6), Math.sin(a) * (collarR + 1.6));
    dummy.rotation.set(-a, 0, 0, "XYZ");
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    plots.setMatrixAt(k, dummy.matrix);
  }
  plots.instanceMatrix.needsUpdate = true;
  ship.add(plots);
  // Mâts et antennes : fines tiges radiales (un seul appel de dessin), un feu blanc à éclats à leur sommet.
  const masts: [number, number, number][] = [[0.17, 0.9, 9], [0.26, 3.6, 12], [0.4, 5.2, 7], [0.52, 1.9, 14], [0.63, 0.3, 8], [0.74, 4.2, 11], [0.86, 2.6, 6], [0.46, 3.0, 5]];
  const mastMesh = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.3, 1, 0.3)), railMat, masts.length);
  const mastTips: number[] = [];
  masts.forEach(([t, a, h], k) => {
    const base = hullR(t) + 1.5 * Math.sin(40 * t) * Math.sin(Math.PI * t);
    dummy.position.set((t - 0.5) * SHIP_L, Math.cos(a) * (base + h / 2), Math.sin(a) * (base + h / 2));
    dummy.rotation.set(a, 0, 0, "XZY");
    dummy.scale.set(1, h, 1);
    dummy.updateMatrix();
    mastMesh.setMatrixAt(k, dummy.matrix);
    mastTips.push((t - 0.5) * SHIP_L, Math.cos(a) * (base + h + 0.3), Math.sin(a) * (base + h + 0.3));
  });
  mastMesh.instanceMatrix.needsUpdate = true;
  ship.add(mastMesh);
  // Bandes de hublots : fines lignes émissives le long de la coque (échelle et habitation), alignées sur les quartiers.
  const stripMat = keep(new THREE.MeshBasicMaterial({ color: 0xf2b544, transparent: true, opacity: 0.8 }));
  const stripGeo = keep(new THREE.BoxGeometry(1, 0.16, 0.16));
  for (let i = 0; i < 30; i++) {
    const q = quarters[i % quarters.length];
    const t = Math.min(0.9, Math.max(0.1, q[0] + (rand() - 0.5) * 0.12));
    const a = q[1] + (rand() - 0.5) * q[2] * 1.4;
    const r = hullR(t) + 0.95 + 1.5 * Math.sin(40 * t) * Math.sin(Math.PI * t);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r);
    strip.rotation.set(a, 0, hullSlope(t), "XZY");
    strip.scale.x = 4 + rand() * 16;
    ship.add(strip);
  }
  /* Feux : nuanceur de points (disques doux, halo, clignotement par graine). Trois familles : feux de bord rouge /
     vert sur deux rails opposés, feux blancs à éclats aux sommets des mâts et sur les anneaux, feux ambre de
     travail près de la soute et des quartiers. Jamais une référence à un design existant. */
  const lightMat = keep(new THREE.ShaderMaterial({
    vertexShader: LIGHT_VERT, fragmentShader: LIGHT_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uFade: { value: 1 }, uMax: { value: pick(12, 9, 6) } }, // taille maximale d'un feu proche (pixels avant densité) : le halo coûte en remplissage
  }));
  type LightSpec = { x: number; y: number; z: number; r: number; g: number; b: number; size: number; seed: number };
  const lightList: LightSpec[] = [];
  const addLight = (x: number, y: number, z: number, rgb: [number, number, number], size: number, seed: number) => lightList.push({ x, y, z, r: rgb[0], g: rgb[1], b: rgb[2], size, seed });
  const RED: [number, number, number] = [1.0, 0.22, 0.14], GREEN: [number, number, number] = [0.25, 1.0, 0.45], WHITE: [number, number, number] = [1.0, 0.96, 0.9], AMBER: [number, number, number] = [1.0, 0.7, 0.28];
  const bordCount = pick(14, 10, 7);
  for (let k = 0; k < bordCount; k++) {
    const t = 0.12 + (k / (bordCount - 1)) * 0.76;
    for (const [a, c] of [[railAngles[1], RED], [railAngles[4], GREEN]] as [number, [number, number, number]][]) {
      const r = hullR(t) + 1.2 + 1.5 * Math.sin(40 * t) * Math.sin(Math.PI * t);
      addLight((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r, c, 2.6, 0.2 + rand() * 0.5);
    }
  }
  for (let k = 0; k < mastTips.length; k += 3) addLight(mastTips[k], mastTips[k + 1], mastTips[k + 2], WHITE, 3.4, 0.8 + rand() * 0.2);
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5, r = 15 + 9 * Math.sin(Math.PI * t) + 0.9;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.5;
      addLight((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r, k % 3 === 0 ? WHITE : AMBER, 2.2, k % 3 === 0 ? 0.78 + rand() * 0.2 : rand() * 0.7);
    }
  }
  const workCount = pick(220, 130, 70);
  for (let i = 0; i < workCount; i++) {
    const q = quarters[i % quarters.length];
    const t = Math.min(0.92, Math.max(0.08, q[0] + (rand() + rand() - 1) * 0.1));
    const a = q[1] + (rand() + rand() - 1) * q[2] * 1.2;
    const r = hullR(t) + 1.0 + 1.5 * Math.sin(40 * t) * Math.sin(Math.PI * t);
    addLight((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r, rand() < 0.8 ? AMBER : WHITE, 1.3 + rand() * 1.4, rand() * 0.74);
  }
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 + 0.26 + Math.PI / 10;
    addLight(collar.position.x, Math.cos(a) * (collarR + 2.6), Math.sin(a) * (collarR + 2.6), AMBER, 2.4, 0.3 + rand() * 0.4);
  }
  const lightsGeo = keep(new THREE.BufferGeometry());
  const lightPos = new Float32Array(lightList.length * 3), lightCol = new Float32Array(lightList.length * 3), lightSeed = new Float32Array(lightList.length), lightSize = new Float32Array(lightList.length);
  lightList.forEach((l, i) => { lightPos.set([l.x, l.y, l.z], i * 3); lightCol.set([l.r, l.g, l.b], i * 3); lightSeed[i] = l.seed; lightSize[i] = l.size; });
  lightsGeo.setAttribute("position", new THREE.BufferAttribute(lightPos, 3));
  lightsGeo.setAttribute("aColor", new THREE.BufferAttribute(lightCol, 3));
  lightsGeo.setAttribute("aSeed", new THREE.BufferAttribute(lightSeed, 1));
  lightsGeo.setAttribute("aSize", new THREE.BufferAttribute(lightSize, 1));
  const shipLights = new THREE.Points(lightsGeo, lightMat);
  shipLights.frustumCulled = false;
  ship.add(shipLights);
  // Frégates : minuscules fuseaux qui dérivent le long de la coque.
  const frigateCount = 14;
  const frigateGeo = keep(new THREE.CapsuleGeometry(0.16, 1.4, 3, 6));
  const frigateMat = keep(new THREE.MeshStandardMaterial({ color: 0x6a5c50, roughness: 0.6, metalness: 0.4, emissive: 0x1a1008 }));
  const frigates = new THREE.InstancedMesh(frigateGeo, frigateMat, frigateCount);
  const frigateSeeds: number[] = [];
  for (let i = 0; i < frigateCount; i++) {
    frigateSeeds.push(rand() * Math.PI * 2, 30 + rand() * 40, (rand() - 0.5) * SHIP_L * 0.9, 0.2 + rand() * 0.5);
  }
  ship.add(frigates);
  // La soute : cinq arceaux horizontaux sous le vaisseau, que la frégate traverse en sortant.
  const bay = new THREE.Group();
  const bayMat = keep(new THREE.MeshStandardMaterial({ color: 0x2a221c, roughness: 0.9, metalness: 0.3, emissive: 0x2a1a0a, emissiveIntensity: 0.8 }));
  // Le dernier arceau est la bouche : un anneau de lampes ambre, plus lumineux à mesure que l'on sort.
  const mouthMat = keep(new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: 0.6, metalness: 0.3, emissive: 0xe8902a, emissiveIntensity: 0.12 }));
  const bayLamps: THREE.PointLight[] = [];
  for (let i = 0; i < 6; i++) {
    const r = 26 + i * 2.5;
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(r, i === 5 ? 1.2 : 1.1, 8, 72)), i === 5 ? mouthMat : bayMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -4 - i * 11, 0);
    bay.add(ring);
    const lamp = new THREE.PointLight(0xf2b544, 2600, 120, 2);
    lamp.position.set(r * 0.7, -4 - i * 11, 0);
    if (high && i % 2 === 0) { bay.add(lamp); bayLamps.push(lamp); }
  }
  const MOUTH_Y = -59, MOUTH_R = 38.5;
  // Feux de la bouche : vingt-quatre ambre tout autour, quatre blancs à éclats aux points cardinaux.
  const mouthN = 28;
  const mouthPos = new Float32Array(mouthN * 3), mouthCol = new Float32Array(mouthN * 3), mouthSeed = new Float32Array(mouthN), mouthSize = new Float32Array(mouthN);
  for (let k = 0; k < mouthN; k++) {
    const a = (k / mouthN) * Math.PI * 2;
    const cardinal = k % 7 === 0;
    mouthPos.set([Math.cos(a) * (MOUTH_R + 0.6), MOUTH_Y - 0.8, Math.sin(a) * (MOUTH_R + 0.6)], k * 3);
    mouthCol.set(cardinal ? [1.0, 0.96, 0.9] : [1.0, 0.7, 0.28], k * 3);
    mouthSeed[k] = cardinal ? 0.8 + rand() * 0.2 : rand() * 0.7;
    mouthSize[k] = cardinal ? 3.6 : 2.6;
  }
  const mouthGeo = keep(new THREE.BufferGeometry());
  mouthGeo.setAttribute("position", new THREE.BufferAttribute(mouthPos, 3));
  mouthGeo.setAttribute("aColor", new THREE.BufferAttribute(mouthCol, 3));
  mouthGeo.setAttribute("aSeed", new THREE.BufferAttribute(mouthSeed, 1));
  mouthGeo.setAttribute("aSize", new THREE.BufferAttribute(mouthSize, 1));
  const mouthLights = new THREE.Points(mouthGeo, lightMat);
  mouthLights.frustumCulled = false;
  bay.add(mouthLights);
  // Lueur de la bouche : disque additif juste sous le dernier arceau, visible des deux côtés ; son intensité suit la
  // sortie de soute (« la lumière s'ouvre »).
  const glowMat = keep(new THREE.ShaderMaterial({
    vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(1.0, 0.66, 0.3) }, uAlpha: { value: 0.1 }, uRing: { value: 0.8 } },
  }));
  const mouthGlow = new THREE.Mesh(keep(new THREE.CircleGeometry(MOUTH_R + 2, 48)), glowMat);
  mouthGlow.rotation.x = Math.PI / 2;
  mouthGlow.position.y = MOUTH_Y - 1.2;
  mouthGlow.visible = tier !== "low"; // grand disque additif proche de la caméra : remplissage coûteux sur appareil faible
  bay.add(mouthGlow);
  bay.position.set(-20, 0, 22);
  space.add(bay);
  // Poussière en suspension dans la soute : quelques centaines de grains lents autour du point de départ, qui
  // s'estompent avec la sortie. Rien sur appareil faible (coût inchangé pour ce niveau).
  const dustCount = pick(360, 220, 0);
  const dustMat = keep(new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uSpeed: { value: 0.7 }, uDir: { value: new THREE.Vector3(0.1, -1, 0.05).normalize() }, uSpan: { value: 36 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(0.95, 0.76, 0.52) } },
  }));
  const dust = new THREE.Points(keep(particleGeometry(Math.max(dustCount, 1), new THREE.Vector3(64, 70, 64), rand, 0.7, 2.2)), dustMat);
  dust.frustumCulled = false;
  dust.visible = dustCount > 0;
  space.add(dust);
  // Navettes : quatre petites frégates qui entrent dans la soute et en ressortent, sur deux boucles fermées
  // (l'une le miroir de l'autre par rapport à l'axe de la soute), orientées selon la tangente, un feu à éclats chacune.
  const SHUTTLE_N = 4;
  const shuttles = new THREE.InstancedMesh(frigateGeo, frigateMat, SHUTTLE_N);
  shuttles.frustumCulled = false; // la sphère englobante d'un InstancedMesh est figée au premier rendu : elles bougent trop pour elle
  frigates.frustumCulled = false;
  space.add(shuttles);
  const loopBase: [number, number, number][] = [[2, -18, -26], [4, 12, -22], [18, 6, -16], [22, -23, -20], [24, -53, -32], [40, -103, -84], [20, -148, -164], [-20, -108, -134], [-10, -63, -38]];
  const shuttleCurves: THREE.CatmullRomCurve3[] = [];
  /* Les boucles sont définies par rapport au point de départ de la caméra (x0, −22, 24), vérifiées en bureau comme en
     portrait ; le miroir se prend par rapport à l'axe de la soute (x = −20). Reconstruites si x0 change. */
  let shuttleX0 = NaN;
  const buildShuttles = (x0: number) => {
    shuttleX0 = x0;
    shuttleCurves.length = 0;
    for (const mirror of [false, true]) {
      const pts = loopBase.map(([x, y, z]) => new THREE.Vector3(mirror ? -40 - (x0 + x) : x0 + x, -22 + y, 24 + z));
      shuttleCurves.push(new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5));
    }
  };
  const shuttlePhase = [0, 0.5, 0.25, 0.75];
  const shuttleSpeed = [1 / 26, 1 / 26, 1 / 31, 1 / 31];
  const shuttleGeo = keep(new THREE.BufferGeometry());
  const shuttlePos = new Float32Array(SHUTTLE_N * 3);
  shuttleGeo.setAttribute("position", new THREE.BufferAttribute(shuttlePos, 3));
  shuttleGeo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array([1, 0.96, 0.9, 1, 0.25, 0.15, 1, 0.96, 0.9, 1, 0.7, 0.28]), 3));
  shuttleGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array([0.82, 0.9, 0.86, 0.95]), 1));
  shuttleGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array([3, 2.6, 3, 2.6]), 1));
  const shuttleLights = new THREE.Points(shuttleGeo, lightMat);
  shuttleLights.frustumCulled = false;
  space.add(shuttleLights);
  const UP = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3();
  // Axe long du vaisseau le long de Z : vu de dessous, il file vers le point de fuite, au-dessus de la planète.
  ship.rotation.y = Math.PI / 2;
  ship.position.set(0, 22, -40);
  // Diagnostic : ?cache=coque|planete|vaisseau|soute masque un élément (jamais utilisé en production).
  const hide = new URLSearchParams(window.location.search).get("cache");
  if (hide === "coque") spine.visible = false;
  if (hide === "vaisseau") ship.visible = false;
  if (hide === "planete") { planet.visible = false; halo.visible = false; }
  if (hide === "soute") bay.visible = false;

  const sun = new THREE.DirectionalLight(0xffd9a8, 3.8);
  sun.position.set(-320, -40, 160);
  const cool = new THREE.DirectionalLight(0x6d8dff, 1.8);
  cool.position.set(260, 120, -200);
  space.add(cool);
  space.add(sun);
  const planetShine = new THREE.HemisphereLight(0x241a2c, 0xd08a3a, 0.8);
  const shine = new THREE.DirectionalLight(0xe8a25a, 1.6);
  shine.position.set(40, -300, 60);
  space.add(shine);
  const underLight = new THREE.PointLight(0xe8a25a, 90000, 900, 2);
  underLight.position.set(30, -120, -60);
  space.add(underLight);
  space.add(planetShine);

  /* ------------------------------------------------------------------ Tempête de poussière */
  /* La poussière suit la lumière du ciel réel : cuivrée le jour, brune au crépuscule, presque éteinte la nuit. */
  const STORM_TINT: Record<string, [number, number, number]> = { day: [0.86, 0.58, 0.30], dusk: [0.78, 0.48, 0.25], night: [0.40, 0.29, 0.20] };
  const stormCount = pick(9000, 5000, 2600);
  const stormMat = keep(new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uSpeed: { value: 55 }, uDir: { value: new THREE.Vector3(1, -0.15, 0.1).normalize() }, uSpan: { value: 180 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(...(STORM_TINT[skyName] ?? STORM_TINT.night)) } },
  }));
  const storm = new THREE.Points(keep(particleGeometry(stormCount, new THREE.Vector3(180, 120, 160), rand, 1.6, 6.0)), stormMat);
  storm.frustumCulled = false;
  scene.add(storm);

  /* ------------------------------------------------------------------ Désert : ciel, dunes, vent */
  const desert = new THREE.Group();
  scene.add(desert);
  const skyMat = keep(new THREE.ShaderMaterial({
    vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false,
    uniforms: { uSunDir: { value: sunDir.clone() }, uW: { value: skyW.clone() }, uTime: { value: 0 }, uDust: { value: 0 } },
  }));
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(1800, 32, 24)), skyMat);
  sky.frustumCulled = false;
  desert.add(sky);

  const duneUniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uTime: { value: 0 }, uWorm: { value: 0 }, uWormPos: { value: new THREE.Vector2(0, -60) }, uSunDir: { value: sunDir.clone() }, uW: { value: skyW.clone() }, uFade: { value: 1 },
  }]);
  const duneMat = keep(new THREE.ShaderMaterial({ vertexShader: DUNE_VERT, fragmentShader: DUNE_FRAG, uniforms: duneUniforms, fog: true }));
  const DUNE_SIZE = 900;
  const dunes = new THREE.Mesh(keep(new THREE.PlaneGeometry(DUNE_SIZE, DUNE_SIZE, pick(300, 200, 120), pick(300, 200, 120))), duneMat);
  dunes.rotation.x = -Math.PI / 2;
  dunes.frustumCulled = false;
  desert.add(dunes);

  const windCount = pick(2400, 1400, 700);
  const windMat = keep(new THREE.ShaderMaterial({
    vertexShader: WIND_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false,
    uniforms: { uTime: duneUniforms.uTime, uWorm: duneUniforms.uWorm, uWormPos: duneUniforms.uWormPos, uAlpha: { value: 0 }, uPixelRatio: { value: pixelRatio }, uOrigin: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color(0.96, 0.84, 0.62) } },
  }));
  const wind = new THREE.Points(keep(particleGeometry(windCount, new THREE.Vector3(260, 1, 220), rand, 0.8, 2.6)), windMat);
  wind.frustumCulled = false;
  desert.add(wind);

  /* ------------------------------------------------------------------ Épice et poussières du Sietch */
  const spiceCount = pick(2600, 1600, 900);
  const spiceMat = keep(new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uSpeed: { value: 2.2 }, uDir: { value: new THREE.Vector3(0.15, 1, 0).normalize() }, uSpan: { value: 40 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(1.0, 0.45, 0.12) } },
  }));
  const spice = new THREE.Points(keep(particleGeometry(spiceCount, new THREE.Vector3(80, 40, 60), rand, 0.8, 3.2)), spiceMat);
  spice.frustumCulled = false;
  scene.add(spice);

  /* ------------------------------------------------------------------ Boucle */
  /* Progression de la scène d'orbite au repos : le rail compte (vh − haut) / (hauteur + vh), donc la scène, en haut de
     page, vaut déjà vh / (hauteur + vh) (≈ 0,29) avant tout défilement. La sortie de soute part de cette valeur. */
  let oRest = 0;
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const orb = document.getElementById("orbite");
    oRest = orb ? window.innerHeight / (orb.offsetHeight + window.innerHeight) : 0;
  };
  resize();
  window.addEventListener("resize", resize);

  const camPos = new THREE.Vector3(0, 0, 0);
  const camTarget = new THREE.Vector3(0, 40, -40);
  const wantPos = new THREE.Vector3();
  const wantTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const fogColor = new THREE.Color();
  const skyFog: Record<string, number> = { day: 0xcfb48c, dusk: 0x8a4a24, night: 0x0a0d1c };
  const desertFog = new THREE.Color(skyFog[skyName] ?? skyFog.night);
  const spaceFog = new THREE.Color(0x05040a);
  const stormFogBySky: Record<string, number> = { day: 0x9a6232, dusk: 0x74421f, night: 0x2a1c14 };
  const stormFog = new THREE.Color(stormFogBySky[skyName] ?? stormFogBySky.night);
  let raf = 0;
  let running = true;
  let lost = false;
  const t0 = performance.now();
  let last = t0;
  /* Lissages indépendants de la cadence : k est le coefficient voulu à 60 images/s ; à 30 ou 120 images/s,
     la caméra converge en autant de SECONDES (et non d'images). */
  let dt = 1 / 60;
  const sm = (k: number) => 1 - Math.pow(1 - k, dt * 60);
  let smoothWorm = 0;
  let prescienceBlend = 0;
  let frameNo = 0;
  /* Le chemin de la descente suit le creux entre deux dunes : pour une position z, le x du relief le plus bas
     dans une fenêtre de ±150 unités (formule des dunes portée sur le processeur). */
  const valleyX = (z: number, around: number): number => {
    let best = around, bh = Infinity;
    for (let x = around - 150; x <= around + 150; x += 15) {
      const hh = duneBase(x, z);
      if (hh < bh) { bh = hh; best = x; }
    }
    return best;
  };
  let pathX = valleyX(0, 45);
  let aheadX = valleyX(-170, pathX);

  const onLost = (e: Event) => { e.preventDefault(); lost = true; };
  const onRestored = () => { lost = false; };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden || lost) return;
    const p = state.progress;
    // Sous le roc, rien ne bouge que des poussières : une image sur deux suffit (batterie).
    const underground = p.desert >= 0.999 && p.epice >= 0.999;
    frameNo++;
    if (underground && (frameNo & 1) === 1) return;
    const now = performance.now();
    const time = (now - t0) / 1000;
    dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    const o = p.orbite, e = p.entree, d = p.desert, s = p.epice;
    const dark = Math.max(p.maisons, p.sietch, p.prescience, p.fin);
    smoothWorm += (state.worm - smoothWorm) * sm(0.06);
    prescienceBlend += ((state.prescience ? 1 : 0) - prescienceBlend) * sm(0.05);

    // Chapitre 1 — soute et orbite : la frégate descend sous le long-courrier, le vaisseau recule, la planète monte.
    const exitT = clamp01((o - oRest) / Math.max(0.1, 0.55 - oRest)); // sortie de soute : 0 en haut de page, 1 à o = 0,55
    const orbitT = clamp01((o - 0.45) / 0.55);   // éloignement
    // Chapitre 2 — entrée : la planète remplit l'écran, puis la tempête.
    const entryT = e;
    const stormT = smoothstep(0.25, 0.7, e) * (1 - smoothstep(0.0, 0.3, d));
    // Chapitre 3 — désert.
    const desertT = d;
    const inDesert = d > 0.001 && s < 0.999;

    space.visible = d <= 0.001; // la tempête (opaque à l'entrée du désert) couvre le changement de caméra
    storm.visible = stormT > 0.001;
    desert.visible = inDesert;
    spice.visible = s > 0.02 || dark > 0;

    if (space.visible) {
      // Caméra : contre-plongée sous la coque, puis descente. Cadrage : le fuseau file vers un point de fuite en haut à
      // droite (regard tourné vers la gauche et un peu vers le bas) ; la colonne de texte, à gauche, reste dégagée.
      // En portrait, caméra plus à gauche et regard plus bas : le vaisseau tient dans le coin supérieur droit, au-dessus
      // du titre, loin de l'épigraphe et du paragraphe.
      const portrait = camera.aspect < 0.8;
      // Départ : presque au centre de la soute, 32 unités sous l'axe du fuseau (la coque, ses panneaux et ses feux
      // remplissent un quart de l'écran). Bureau : regard 20° à gauche et 6° vers le bas → le fuseau file en diagonale
      // dans le quart supérieur droit, la colonne de texte reste libre. Portrait : regard 3° à droite et 8° vers le bas →
      // le fuseau occupe la bande au-dessus du titre (0–22 % de la hauteur), la planète n'est qu'un limbe en bas.
      const x0 = -18, yStart = -10;
      if (shuttleX0 !== x0) buildShuttles(x0);
      const yExit = -96, yOrbit = -420;
      const y = lerp(lerp(yStart, yExit, smoothstep(0, 1, exitT)), yOrbit, smoothstep(0, 1, orbitT) * entryT * 0 + smoothstep(0, 1, orbitT));
      wantPos.set(x0 + Math.sin(exitT * 1.3) * 5 + orbitT * 20, y, 24 + exitT * 18 + orbitT * 30);
      const look = smoothstep(0.15, 0.9, orbitT);
      if (portrait) tmp.set(x0 + 9, yStart - 29, 24 - 165); else tmp.set(x0 - 69, yStart - 8, 24 - 156);
      // En sortant, le regard remonte vers la bouche éclairée et le fuseau qu'on quitte (dès le début de la sortie,
      // pour ne jamais le perdre de vue), puis bascule vers la planète.
      tmp.lerp(wantTarget.set(x0 + (portrait ? 8 : 24), 30, -100), smoothstep(0, 0.9, exitT) * 0.9);
      tmp.lerp(wantTarget.set(0, -600, -200), look);
      wantTarget.copy(tmp);
      // Planète : loin et basse au début (plus basse en portrait : sous le paragraphe), elle monte pendant l'entrée.
      const planetY = lerp(-238, -250, smoothstep(0, 1, orbitT)) + entryT * 60 - (portrait ? 150 : 60) * (1 - orbitT);
      const planetZ = lerp(-440, -420, orbitT) + entryT * 150;
      planet.position.set(10, planetY, planetZ);
      halo.position.copy(planet.position);
      planet.rotation.y = time * 0.004;
      halo.rotation.copy(planet.rotation);
      planetMat.uniforms.uTime.value = time;
      hullMat.uniforms.uTime.value = time;
      planetMat.uniforms.uHaze.value = stormT;
      haloMat.uniforms.uStrength.value = 0.8 + entryT * 0.8;
      // En s'éloignant, le vaisseau glisse de côté et pivote : on le voit de trois quarts, jamais de face.
      ship.position.set(orbitT * 150, 22 + orbitT * 70, -40 - orbitT * 170);
      ship.rotation.y = Math.PI / 2 + orbitT * 0.85;
      ship.rotation.x = 0.03 + orbitT * 0.1;
      stars.rotation.y = time * 0.004;
      // Frégates : dérive lente autour de la coque, un feu qui clignote.
      for (let i = 0; i < frigateCount; i++) {
        const a0 = frigateSeeds[i * 4], r = frigateSeeds[i * 4 + 1], x = frigateSeeds[i * 4 + 2], sp = frigateSeeds[i * 4 + 3];
        const a = a0 + time * 0.03 * sp;
        dummy.position.set(x + Math.sin(time * 0.1 + i) * 6, Math.cos(a) * r, Math.sin(a) * r);
        dummy.rotation.set(0, 0, Math.PI / 2);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        frigates.setMatrixAt(i, dummy.matrix);
      }
      frigates.instanceMatrix.needsUpdate = true;
      // Navettes : chacune suit sa boucle (entrée par la bouche, montée dans la soute, demi-tour, sortie, grand tour
      // au-dessus de la planète), le nez dans la tangente, son feu à sa suite.
      for (let i = 0; i < SHUTTLE_N; i++) {
        const curve = shuttleCurves[i % 2];
        const u = (time * shuttleSpeed[i] + shuttlePhase[i]) % 1;
        curve.getPointAt(u, dummy.position);
        curve.getTangentAt(u, tangent);
        dummy.quaternion.setFromUnitVectors(UP, tangent);
        dummy.scale.setScalar(1.6);
        dummy.updateMatrix();
        shuttles.setMatrixAt(i, dummy.matrix);
        shuttlePos[i * 3] = dummy.position.x - tangent.x * 1.3;
        shuttlePos[i * 3 + 1] = dummy.position.y - tangent.y * 1.3;
        shuttlePos[i * 3 + 2] = dummy.position.z - tangent.z * 1.3;
      }
      shuttles.instanceMatrix.needsUpdate = true;
      shuttleGeo.attributes.position.needsUpdate = true;
      lightMat.uniforms.uTime.value = time;
      // Sortie de soute : la lumière s'ouvre. Bouche et lampes montent, la lumière de la planète monte, la poussière en
      // suspension s'estompe.
      const open = smoothstep(0.15, 0.8, exitT);
      glowMat.uniforms.uAlpha.value = 0.12 + 0.75 * open;
      mouthMat.emissiveIntensity = 0.12 + 0.3 * open;
      bayMat.emissiveIntensity = 0.45 + 0.55 * open;
      for (const lamp of bayLamps) lamp.intensity = 2600 * (0.5 + 0.5 * open);
      underLight.intensity = 90000 * (0.35 + 0.65 * open);
      shine.intensity = 1.6 * (0.55 + 0.45 * open);
      if (dust.visible) {
        dustMat.uniforms.uTime.value = time;
        dustMat.uniforms.uAlpha.value = 0.55 * (1 - smoothstep(0.45, 0.9, exitT));
        dust.position.set(x0, yStart, 24);
      }
      // Brouillard : l'espace est net ; la tempête l'épaissit, ocre.
      fogColor.copy(spaceFog).lerp(stormFog, stormT);
      (scene.fog as THREE.FogExp2).density = stormT * 0.012;
      renderer.setClearColor(fogColor, 1);
    }

    if (storm.visible) {
      stormMat.uniforms.uTime.value = time;
      stormMat.uniforms.uAlpha.value = stormT;
      storm.position.copy(camPos);
      storm.position.z -= 60;
    }

    if (inDesert) {
      // Caméra au-dessus des dunes : elle descend de 70 à 6 unités, glisse vers l'avant, puis rase le sable pour l'épice.
      const zWant = -(desertT * 160 + s * 60);
      pathX += (valleyX(zWant, pathX) - pathX) * sm(0.03);
      const ground = duneBase(pathX, zWant);
      const clearance = lerp(12, 7, desertT) - smoothstep(0, 1, s) * 1.5;
      const h = Math.max(lerp(40, 6, smoothstep(0, 0.85, desertT)) - smoothstep(0, 1, s) * 2.5, ground + clearance);
      wantPos.set(pathX, h, zWant);
      const ahead = lerp(170, 90, desertT);
      const zAhead = zWant - ahead;
      aheadX += (valleyX(zAhead, pathX) - aheadX) * sm(0.03);
      wantTarget.set(aheadX, Math.max(lerp(12, 5, desertT) - s * 2, duneBase(aheadX, zAhead) + 3), zAhead);
      sky.position.copy(camPos);
      // Le sol suit la caméra par pas entiers (le relief est fonction de la position monde : rien ne saute).
      dunes.position.set(Math.round(camPos.x / 50) * 50, 0, Math.round(camPos.z / 50) * 50);
      duneUniforms.uTime.value = time;
      duneUniforms.uWorm.value = smoothWorm;
      // Le ver approche de l'avant quand on marche au rythme : sa bosse se rapproche de la caméra.
      duneUniforms.uWormPos.value.set(camPos.x + Math.sin(time * 0.3) * 10, camPos.z - 120 + smoothWorm * 95);
      duneUniforms.uFade.value = 1 - smoothstep(0.55, 1, s) * 0.85;
      windMat.uniforms.uAlpha.value = (0.5 + smoothWorm * 0.4) * (1 - smoothstep(0.6, 1, s));
      windMat.uniforms.uOrigin.value.set(camPos.x - 70, 0, camPos.z - 110);
      skyMat.uniforms.uTime.value = time;
      skyMat.uniforms.uDust.value = 0.35 + (1 - smoothstep(0, 0.4, d)) * 0.6 + smoothWorm * 0.25;
      fogColor.copy(desertFog).lerp(new THREE.Color(0x0b0908), smoothstep(0.55, 1, s) * 0.9);
      (scene.fog as THREE.FogExp2).density = lerp(0.0028, 0.0018, desertT) + (1 - smoothstep(0, 0.35, d)) * 0.03;
      renderer.setClearColor(fogColor, 1);
    }

    if (spice.visible) {
      spiceMat.uniforms.uTime.value = time;
      spiceMat.uniforms.uAlpha.value = inDesert ? smoothstep(0.02, 0.3, s) * 0.9 : Math.min(0.35, dark) * 0.35;
      spiceMat.uniforms.uColor.value.setRGB(1.0 - dark * 0.1, 0.45 + dark * 0.25, 0.12 + dark * 0.1);
      spice.position.copy(camPos);
      spice.position.z -= 20;
      spice.position.y -= 10;
    }
    if (!inDesert && !space.visible) {
      // Sous le roc : obscurité, poussières d'ambre.
      wantPos.set(0, 0, 0);
      wantTarget.set(0, 0, -10);
      (scene.fog as THREE.FogExp2).density = 0;
      renderer.setClearColor(0x0b0908, 1);
    }

    // Prescience : le monde tire vers le bleu profond (en plus du voile CSS).
    if (prescienceBlend > 0.001) {
      const c = renderer.getClearColor(fogColor);
      c.lerp(new THREE.Color(0x0a1230), prescienceBlend * 0.5);
      renderer.setClearColor(c, 1);
    }

    const k = sm(inDesert ? 0.08 : 0.1);
    camPos.lerp(wantPos, k);
    camTarget.lerp(wantTarget, k);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);
    camera.rotation.z += Math.sin(time * 0.37) * 0.004 * (space.visible ? 1 : 0.4);
    if (scene.fog) (scene.fog as THREE.FogExp2).color.copy(fogColor);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
