/**
 * Monde WebGL (three.js, chargé à la demande) : un seul canvas persistant, piloté chaque image par l'état du
 * défilement (src/lib/store.ts). Chapitres : soute du long-courrier → orbite → entrée et tempête → dunes et ver →
 * épice → obscurité du Sietch. Tout est procédural : aucune texture, aucun modèle récupéré, aucun design officiel.
 */
import * as THREE from "three";
import { state, clamp01, lerp, smoothstep } from "../lib/store";
import { duneBase } from "./dunes";
import { DUNE_FRAG, DUNE_VERT, HALO_FRAG, HALO_VERT, HULL_FRAG, HULL_VERT, PARTICLE_FRAG, PARTICLE_VERT, PLANET_FRAG, PLANET_VERT, SKY_FRAG, SKY_VERT, WIND_VERT } from "./shaders";

export type WorldOptions = { tier: "low" | "high" };

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
  const high = tier === "high";
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: high, alpha: false, powerPreference: "high-performance", stencil: false });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, high ? 1.5 : 1);
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

  const starCount = high ? 3200 : 1100;
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
  const planet = new THREE.Mesh(keep(new THREE.SphereGeometry(PLANET_R, high ? 128 : 64, high ? 96 : 48)), planetMat);
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
  const hullMat = keep(new THREE.ShaderMaterial({ vertexShader: HULL_VERT, fragmentShader: HULL_FRAG, uniforms: { uSunDir: { value: new THREE.Vector3(-0.89, -0.11, 0.44).normalize() }, uShineDir: { value: new THREE.Vector3(0.1, -1, 0.25).normalize() }, uTime: { value: 0 } } }));
  const ribMat = keep(new THREE.MeshStandardMaterial({ color: 0x8a7462, roughness: 0.55, metalness: 0.25, emissive: 0x2a1608, emissiveIntensity: 0.8 }));
  const profile: THREE.Vector2[] = [];
  const SHIP_L = 320;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const r = 2 + 12 * Math.sin(Math.PI * t) ** 0.55 + 1.5 * Math.sin(t * 40) * Math.sin(Math.PI * t);
    profile.push(new THREE.Vector2(r, (t - 0.5) * SHIP_L));
  }
  const spine = new THREE.Mesh(keep(new THREE.LatheGeometry(profile, high ? 48 : 24)), hullMat);
  spine.rotation.z = Math.PI / 2; // axe long le long de X
  ship.add(spine);
  // Anneaux de structure : de vrais tores (jamais un tore mis à l'échelle : son tube deviendrait un disque).
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    const r = 15 + 9 * Math.sin(Math.PI * t);
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(r, 0.7, 8, high ? 96 : 48)), ribMat);
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
  const moduleCount = high ? 1400 : 500;
  const modules = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 1, 1)), keep(new THREE.MeshStandardMaterial({ color: 0x7c6a5a, roughness: 0.8, metalness: 0.15, emissive: 0x120a05 })), moduleCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < moduleCount; i++) {
    const t = rand();
    const a = rand() * Math.PI * 2;
    const r = 2 + 12 * Math.sin(Math.PI * t) ** 0.55 + 0.5;
    dummy.position.set((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r);
    dummy.rotation.set(a, 0, 0);
    dummy.scale.set(1 + rand() * 4, 0.6 + rand() * 1.6, 0.6 + rand() * 1.4);
    dummy.updateMatrix();
    modules.setMatrixAt(i, dummy.matrix);
  }
  modules.instanceMatrix.needsUpdate = true;
  const tint = new THREE.Color();
  for (let i = 0; i < moduleCount; i++) {
    const v = 0.55 + rand() * 0.9;
    modules.setColorAt(i, tint.setRGB(0.52 * v, 0.44 * v, 0.37 * v));
  }
  if (modules.instanceColor) modules.instanceColor.needsUpdate = true;
  ship.add(modules);
  // Bandes de hublots : fines lignes émissives le long de la coque (échelle et habitation).
  const stripMat = keep(new THREE.MeshBasicMaterial({ color: 0xf2b544, transparent: true, opacity: 0.85 }));
  const stripGeo = keep(new THREE.BoxGeometry(1, 0.18, 0.18));
  for (let i = 0; i < 36; i++) {
    const t = 0.12 + rand() * 0.76;
    const a = rand() * Math.PI * 2;
    const r = 2 + 12 * Math.sin(Math.PI * t) ** 0.55 + 0.9;
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set((t - 0.5) * SHIP_L, Math.cos(a) * r, Math.sin(a) * r);
    strip.rotation.x = a;
    strip.scale.x = 4 + rand() * 18;
    ship.add(strip);
  }
  const lightCount = high ? 420 : 160;
  const lightPos = new Float32Array(lightCount * 3);
  const lightCol = new Float32Array(lightCount * 3);
  for (let i = 0; i < lightCount; i++) {
    const t = rand(); const a = rand() * Math.PI * 2;
    const r = 2 + 12 * Math.sin(Math.PI * t) ** 0.55 + 1.2 + (rand() < 0.3 ? 14 + 12 * Math.sin(Math.PI * t) : 0);
    lightPos[i * 3] = (t - 0.5) * SHIP_L; lightPos[i * 3 + 1] = Math.cos(a) * r; lightPos[i * 3 + 2] = Math.sin(a) * r;
    const warm = rand() < 0.75;
    lightCol[i * 3] = warm ? 0.95 : 0.6; lightCol[i * 3 + 1] = warm ? 0.7 : 0.75; lightCol[i * 3 + 2] = warm ? 0.3 : 1.0;
  }
  const lightsGeo = keep(new THREE.BufferGeometry());
  lightsGeo.setAttribute("position", new THREE.BufferAttribute(lightPos, 3));
  lightsGeo.setAttribute("color", new THREE.BufferAttribute(lightCol, 3));
  const shipLights = new THREE.Points(lightsGeo, keep(new THREE.PointsMaterial({ size: 3.2, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })));
  ship.add(shipLights);
  // Frégates : minuscules fuseaux près de la coque.
  const frigateCount = 18;
  const frigates = new THREE.InstancedMesh(keep(new THREE.CapsuleGeometry(0.16, 1.4, 3, 6)), keep(new THREE.MeshStandardMaterial({ color: 0x6a5c50, roughness: 0.6, metalness: 0.4, emissive: 0x1a1008 })), frigateCount);
  const frigateSeeds: number[] = [];
  for (let i = 0; i < frigateCount; i++) {
    frigateSeeds.push(rand() * Math.PI * 2, 30 + rand() * 40, (rand() - 0.5) * SHIP_L * 0.9, 0.2 + rand() * 0.5);
  }
  ship.add(frigates);
  // La soute : cinq arceaux horizontaux sous le vaisseau, que la frégate traverse en sortant.
  const bay = new THREE.Group();
  const bayMat = keep(new THREE.MeshStandardMaterial({ color: 0x2a221c, roughness: 0.9, metalness: 0.3, emissive: 0x2a1a0a, emissiveIntensity: 0.8 }));
  for (let i = 0; i < 6; i++) {
    const r = 26 + i * 2.5;
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(r, 1.1, 8, 72)), bayMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -4 - i * 11, 0);
    bay.add(ring);
    const lamp = new THREE.PointLight(0xf2b544, 2600, 120, 2);
    lamp.position.set(r * 0.7, -4 - i * 11, 0);
    if (high && i % 2 === 0) bay.add(lamp);
  }
  bay.position.set(-20, 0, 22);
  space.add(bay);
  // Axe long du vaisseau le long de Z : vu de dessous, il file vers le point de fuite, au-dessus de la planète.
  ship.rotation.y = Math.PI / 2;
  ship.position.set(0, 22, -40);
  // Diagnostic : ?cache=coque|planete|vaisseau|soute masque un élément (jamais utilisé en production).
  const hide = new URLSearchParams(window.location.search).get("cache");
  if (hide === "coque") spine.visible = false;
  if (hide === "vaisseau") ship.visible = false;
  if (hide === "planete") { planet.visible = false; halo.visible = false; }
  if (hide === "soute") bay.visible = false;

  const sun = new THREE.DirectionalLight(0xffe7c6, 5.5);
  sun.position.set(-320, -40, 160);
  const cool = new THREE.DirectionalLight(0x6d8dff, 1.2);
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
  const stormCount = high ? 9000 : 2600;
  const stormMat = keep(new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uSpeed: { value: 55 }, uDir: { value: new THREE.Vector3(1, -0.15, 0.1).normalize() }, uSpan: { value: 180 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(0.86, 0.58, 0.30) } },
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
  const dunes = new THREE.Mesh(keep(new THREE.PlaneGeometry(DUNE_SIZE, DUNE_SIZE, high ? 300 : 120, high ? 300 : 120)), duneMat);
  dunes.rotation.x = -Math.PI / 2;
  dunes.frustumCulled = false;
  desert.add(dunes);

  const windCount = high ? 2400 : 700;
  const windMat = keep(new THREE.ShaderMaterial({
    vertexShader: WIND_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false,
    uniforms: { uTime: duneUniforms.uTime, uWorm: duneUniforms.uWorm, uWormPos: duneUniforms.uWormPos, uAlpha: { value: 0 }, uPixelRatio: { value: pixelRatio }, uOrigin: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color(0.96, 0.84, 0.62) } },
  }));
  const wind = new THREE.Points(keep(particleGeometry(windCount, new THREE.Vector3(260, 1, 220), rand, 0.8, 2.6)), windMat);
  wind.frustumCulled = false;
  desert.add(wind);

  /* ------------------------------------------------------------------ Épice et poussières du Sietch */
  const spiceCount = high ? 2600 : 900;
  const spiceMat = keep(new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uSpeed: { value: 2.2 }, uDir: { value: new THREE.Vector3(0.15, 1, 0).normalize() }, uSpan: { value: 40 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(1.0, 0.45, 0.12) } },
  }));
  const spice = new THREE.Points(keep(particleGeometry(spiceCount, new THREE.Vector3(80, 40, 60), rand, 0.8, 3.2)), spiceMat);
  spice.frustumCulled = false;
  scene.add(spice);

  /* ------------------------------------------------------------------ Boucle */
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
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
  const stormFog = new THREE.Color(0x9a6232);
  let raf = 0;
  let running = true;
  let lost = false;
  const t0 = performance.now();
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
    const o = p.orbite, e = p.entree, d = p.desert, s = p.epice;
    const dark = Math.max(p.maisons, p.sietch, p.prescience, p.fin);
    smoothWorm += (state.worm - smoothWorm) * 0.06;
    prescienceBlend += ((state.prescience ? 1 : 0) - prescienceBlend) * 0.05;

    // Chapitre 1 — soute et orbite : la frégate descend sous le long-courrier, le vaisseau recule, la planète monte.
    const exitT = clamp01(o / 0.55);            // sortie de soute
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
      // Caméra : contre-plongée sous la coque, puis descente.
      const yStart = -22, yExit = -96, yOrbit = -420;
      const y = lerp(lerp(yStart, yExit, smoothstep(0, 1, exitT)), yOrbit, smoothstep(0, 1, orbitT) * entryT * 0 + smoothstep(0, 1, orbitT));
      wantPos.set(-28 + Math.sin(exitT * 1.3) * 5 + orbitT * 20, y, 24 + exitT * 18 + orbitT * 30);
      // Regard : d'abord la coque au-dessus, puis la planète en dessous.
      const look = smoothstep(0.15, 0.9, orbitT);
      const side = camera.aspect < 0.8 ? -26 : 0; // téléphone : le vaisseau se décale, le texte reste lisible
      tmp.set(18 + side, 10, -150).lerp(new THREE.Vector3(0, -600, -200), look);
      wantTarget.copy(tmp);
      // Planète : loin et basse au début, elle monte vers nous pendant l'entrée.
      const planetY = lerp(-238, -250, smoothstep(0, 1, orbitT)) + entryT * 60;
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
      (shipLights.material as THREE.PointsMaterial).opacity = 0.7 + 0.3 * Math.sin(time * 2.2);
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
      pathX += (valleyX(zWant, pathX) - pathX) * 0.03;
      const ground = duneBase(pathX, zWant);
      const clearance = lerp(12, 7, desertT) - smoothstep(0, 1, s) * 1.5;
      const h = Math.max(lerp(40, 6, smoothstep(0, 0.85, desertT)) - smoothstep(0, 1, s) * 2.5, ground + clearance);
      wantPos.set(pathX, h, zWant);
      const ahead = lerp(170, 90, desertT);
      const zAhead = zWant - ahead;
      aheadX += (valleyX(zAhead, pathX) - aheadX) * 0.03;
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

    const k = inDesert ? 0.08 : 0.1;
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
