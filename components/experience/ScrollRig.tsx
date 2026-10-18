"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { SCENES, clamp01, computeAltitude, notify, state, type SceneId } from "../../src/lib/store";
import { prefersReducedMotion, readPref, writePref } from "../../src/lib/prefs";
import { ambience } from "../../src/lib/audio";
import { soundEnabled } from "../../src/lib/sound";
import { storageKeys } from "../../src/config/site";

const SAND_SCENES: SceneId[] = ["desert", "epice"];

/**
 * Rail de défilement : Lenis (défilement fluide) + GSAP ScrollTrigger (apparitions), mesure des scènes,
 * compteur d'altitude, rythme du pas (« marcher sans rythme ») et paramètres du son. Un seul rAF pour tout.
 */
export function ScrollRig() {
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const html = document.documentElement;
    html.dataset.motion = reduce ? "reduce" : "full";
    gsap.registerPlugin(ScrollTrigger);

    const sections = SCENES.map((id) => [id, document.getElementById(id)] as const).filter(([, el]) => el) as [SceneId, HTMLElement][];

    let lenis: Lenis | null = null;
    const onTick = (time: number) => lenis?.raf(time * 1000);
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
    }

    // Liens d'ancre : glissé plutôt que saut.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a || !lenis) return;
      const target = document.querySelector(a.getAttribute("href")!);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
      history.replaceState(null, "", a.getAttribute("href"));
    };
    document.addEventListener("click", onClick);

    // Apparitions : jamais sur le héro (élément LCP), jamais en mouvement réduit.
    const reveals: gsap.core.Tween[] = [];
    if (!reduce) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        reveals.push(
          gsap.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
        );
      });
    }

    // Rythme du pas : on écoute les gestes (molette, doigt, clavier), pas le défilement lissé.
    const steps: { t: number; d: number }[] = [];
    const push = (d: number) => {
      const t = performance.now();
      steps.push({ t, d: Math.abs(d) });
      if (steps.length > 90) steps.shift();
    };
    const onWheel = (e: WheelEvent) => push(e.deltaY || e.deltaX);
    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0]?.clientY ?? 0; };
    const onTouchMove = (e: TouchEvent) => { const y = e.touches[0]?.clientY ?? 0; push(y - lastTouchY); lastTouchY = y; };
    const onKey = (e: KeyboardEvent) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(e.key)) push(120); };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    let discovered = readPref(storageKeys.wormDiscovered) === "1";
    let lastY = window.scrollY;
    let lastT = performance.now();
    let velocity = 0;
    let wind = 0;
    let current: SceneId | "" = "";
    let descentOn = false;
    let wormNear = false;

    const frame = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastT) / 1000) || 0.016;
      lastT = now;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const instant = (y - lastY) / dt;
      lastY = y;
      velocity += (instant - velocity) * Math.min(1, dt * 8);
      state.y = y;
      state.velocity = velocity;

      let next: SceneId | "" = "";
      for (const [id, el] of sections) {
        const r = el.getBoundingClientRect();
        state.progress[id] = clamp01((vh - r.top) / (r.height + vh));
        if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) next = id;
      }
      if (next && next !== current) {
        current = next;
        html.dataset.section = current;
      }
      const alt = computeAltitude(state.progress);
      state.altitude = alt.altitude;
      state.phase = alt.phase;
      state.descent = alt.descent;
      const on = y > 40;
      if (on !== descentOn) {
        descentOn = on;
        html.dataset.descent = on ? "on" : "off";
      }

      // Régularité du pas sur les 1,6 dernières secondes.
      while (steps.length && now - steps[0].t > 1600) steps.shift();
      let rhythm = 0;
      if (steps.length >= 6) {
        const intervals: number[] = [];
        const deltas: number[] = [];
        for (let i = 1; i < steps.length; i++) {
          intervals.push(steps[i].t - steps[i - 1].t);
          deltas.push(steps[i].d);
        }
        const cv = (arr: number[]) => {
          const m = arr.reduce((a, b) => a + b, 0) / arr.length;
          if (m <= 0) return 1;
          const v = arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length;
          return Math.sqrt(v) / m;
        };
        rhythm = clamp01(1 - (cv(intervals) * 0.7 + cv(deltas) * 0.5));
      }
      state.rhythm += (rhythm - state.rhythm) * Math.min(1, dt * 4);

      const onSand = !reduce && SAND_SCENES.some((id) => state.progress[id] > 0.12 && state.progress[id] < 0.92);
      if (onSand && steps.length >= 6) {
        state.worm += dt * (state.rhythm > 0.55 ? 0.16 + state.rhythm * 0.22 : -0.45);
      } else {
        state.worm -= dt * (onSand ? 0.08 : 0.5);
      }
      state.worm = clamp01(state.worm);
      const near = state.worm > 0.62;
      if (near !== wormNear) {
        wormNear = near;
        if (near) html.dataset.worm = "near";
        else delete html.dataset.worm;
      }
      if (!discovered && state.worm > 0.8) {
        discovered = true;
        writePref(storageKeys.wormDiscovered, "1");
        document.dispatchEvent(new CustomEvent("sietch:worm"));
      }

      // Son : vent selon la vitesse, grondement devant le long-courrier et quand le ver approche.
      if (soundEnabled()) {
        const target = clamp01(Math.abs(velocity) / 2400);
        wind += (target - wind) * Math.min(1, dt * 3);
        ambience.setWind(wind);
        const o = state.progress.orbite;
        const ship = o < 0.55 ? 0.75 * (1 - o / 0.55) : 0;
        ambience.setRumble(Math.max(ship, state.worm * 0.9));
      }
      notify();
    };
    gsap.ticker.add(frame);

    return () => {
      gsap.ticker.remove(frame);
      gsap.ticker.remove(onTick);
      lenis?.destroy();
      reveals.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      delete html.dataset.section;
      delete html.dataset.descent;
      delete html.dataset.worm;
    };
  }, []);
  return null;
}
