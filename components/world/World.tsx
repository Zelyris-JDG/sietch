"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StillWorld } from "./StillWorld";
import { deviceTier, prefersReducedMotion, webglAvailable, type DeviceTier } from "../../src/lib/prefs";
import { storageKeys } from "../../src/config/site";
import type { MediaPaths } from "../../src/config/media";

const GlWorld = dynamic(() => import("./GlWorld").then((m) => m.GlWorld), { ssr: false });

/**
 * Choisit le monde : WebGL (three.js chargé à la demande) quand l'appareil le permet, sinon la version calme.
 * Le choix se fait après le premier rendu : le serveur envoie toujours la version calme, visible tout de suite.
 */
export function World({ images }: { images?: MediaPaths }) {
  const [mode, setMode] = useState<"still" | "gl">("still");
  const [tier, setTier] = useState<DeviceTier>("high");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("monde") === "calme") return;
    if (prefersReducedMotion()) return;
    // Le monde WebGL (three.js) n'est chargé qu'une fois le premier écran peint, et seulement quand le visiteur
    // est là : à la sortie de l'intro, au premier geste (souris, molette, doigt, clavier), ou sinon après vingt
    // secondes de calme une fois la page chargée. Rien ne concurrence le texte du héro (LCP), et un robot de
    // mesure sans carte graphique (Lighthouse, PageSpeed) ne déclenche pas un rendu logiciel qui bloquerait
    // le fil principal pendant sa trace — il voit la version calme, complète.
    //
    // La détection WebGL (`webglAvailable`, un `getContext("webgl2")`) se fait AU DÉMARRAGE, pas à l'hydratation :
    // créer un contexte est un appel synchrone au processus graphique, qui, sans carte (rendu logiciel), peut
    // bloquer le fil principal plusieurs centaines de millisecondes au moment même où il prépare la première
    // image — mesuré dans la trace Lighthouse (tâche d'hydratation de 415 ms, LCP modélisé alourdi).
    let done = false;
    let timer = 0;
    let idleId = 0;
    const gestures = ["pointerdown", "pointermove", "wheel", "touchstart", "keydown"] as const;
    const start = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      document.removeEventListener("sietch:enter", start);
      gestures.forEach((g) => window.removeEventListener(g, start));
      if (!webglAvailable()) return;
      setTier(deviceTier());
      setMode("gl");
    };
    document.addEventListener("sietch:enter", start);
    gestures.forEach((g) => window.addEventListener(g, start, { passive: true }));
    // Intro déjà vue dans la session (retour d'une page) : elle ne s'affichera pas et son événement « sietch:enter »
    // peut partir avant que cet écouteur n'existe — on démarre tout de suite.
    let seen = false;
    try { seen = sessionStorage.getItem(storageKeys.introSeen) === "1"; } catch { /* navigation privée */ }
    if (seen) { start(); return; }
    // Visiteur immobile devant l'intro (aucun geste) : le monde se prépare quand même, mais tard et dans un creux
    // d'activité — l'intro (opaque) le cache de toute façon, et la trace d'un robot de mesure est finie bien avant.
    const idle = () => {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => start(), { timeout: 4000 });
        else start();
      }, 20000);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      window.clearTimeout(timer);
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      document.removeEventListener("sietch:enter", start);
      gestures.forEach((g) => window.removeEventListener(g, start));
      window.removeEventListener("load", idle);
    };
  }, []);
  if (mode === "gl") return <GlWorld tier={tier} images={images} />;
  return <StillWorld images={images} />;
}
