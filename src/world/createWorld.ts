/**
 * Monde WebGL (three.js, chargé à la demande) — version de squelette : étoiles, planète, brume.
 * Les effets signatures (long-courrier, tempête, dunes, ver) arrivent en phase 4 du chantier C1.
 */
import * as THREE from "three";
import { state } from "../lib/store";

export type WorldOptions = { tier: "low" | "high" };

export function createWorld(canvas: HTMLCanvasElement, { tier }: WorldOptions): { dispose: () => void } {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier === "high", alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === "high" ? 1.5 : 1));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05040a);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 4000);
  camera.position.set(0, 0, 10);

  const starCount = tier === "high" ? 2600 : 900;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 900 + Math.random() * 900;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
    starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    starPos[i * 3 + 2] = r * Math.cos(p);
  }
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(starPos, 3)),
    new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85 }),
  );
  scene.add(stars);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(60, tier === "high" ? 96 : 48, tier === "high" ? 64 : 32),
    new THREE.MeshStandardMaterial({ color: 0xc08a4a, roughness: 1, metalness: 0 }),
  );
  planet.position.set(0, -75, -40);
  scene.add(planet);
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.2);
  sun.position.set(-80, 40, 60);
  scene.add(sun, new THREE.AmbientLight(0x3a2a40, 0.6));

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let running = true;
  const loop = () => {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    const d = state.descent;
    camera.position.z = 10 - d * 6;
    planet.position.y = -75 + d * 40;
    planet.rotation.y += 0.0004;
    stars.rotation.y += 0.00005;
    renderer.render(scene, camera);
  };
  loop();

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
      planet.geometry.dispose();
      (planet.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
