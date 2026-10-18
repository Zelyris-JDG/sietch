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
    // Le monde WebGL (three.js) n'est chargé qu'une fois le premier écran peint : à la sortie de l'intro, ou
    // sinon après le chargement complet et un court temps mort. Rien ne concurrence le texte du héro (LCP).
    let done = false;
    let timer = 0;
    const start = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      document.removeEventListener("sietch:enter", start);
      setTier(deviceTier());
      setMode("gl");
    };
    document.addEventListener("sietch:enter", start);
    const idle = () => { timer = window.setTimeout(start, 1200); };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("sietch:enter", start);
      window.removeEventListener("load", idle);
    };
  }, []);
  if (mode === "gl") return <GlWorld tier={tier} />;
  return <StillWorld />;
}
