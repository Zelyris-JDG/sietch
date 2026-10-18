"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StillWorld } from "./StillWorld";
import { deviceTier, prefersReducedMotion, webglAvailable } from "../../src/lib/prefs";

const GlWorld = dynamic(() => import("./GlWorld").then((m) => m.GlWorld), { ssr: false });

/**
 * Choisit le monde : WebGL (three.js chargé à la demande) quand l'appareil le permet, sinon la version calme.
 * Le choix se fait après le premier rendu : le serveur envoie toujours la version calme, visible tout de suite.
 */
export function World() {
  const [mode, setMode] = useState<"still" | "gl">("still");
  const [tier, setTier] = useState<"low" | "high">("high");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("monde") === "calme") return;
    if (prefersReducedMotion() || !webglAvailable()) return;
    // Le monde WebGL (three.js) n'est chargé qu'une fois le premier écran peint, et seulement quand le visiteur
    // est là : à la sortie de l'intro, au premier geste (souris, molette, doigt, clavier), ou sinon après six
    // secondes de calme une fois la page chargée. Rien ne concurrence le texte du héro (LCP), et un robot de
    // mesure sans carte graphique (Lighthouse, PageSpeed) ne déclenche pas un rendu logiciel qui bloquerait
    // le fil principal pendant sa trace — il voit la version calme, complète.
    let done = false;
    let timer = 0;
    const gestures = ["pointerdown", "pointermove", "wheel", "touchstart", "keydown"] as const;
    const start = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      document.removeEventListener("sietch:enter", start);
      gestures.forEach((g) => window.removeEventListener(g, start));
      setTier(deviceTier());
      setMode("gl");
    };
    document.addEventListener("sietch:enter", start);
    gestures.forEach((g) => window.addEventListener(g, start, { passive: true }));
    const idle = () => { timer = window.setTimeout(start, 6000); };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("sietch:enter", start);
      gestures.forEach((g) => window.removeEventListener(g, start));
      window.removeEventListener("load", idle);
    };
  }, []);
  if (mode === "gl") return <GlWorld tier={tier} />;
  return <StillWorld />;
}
