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
    setTier(deviceTier());
    setMode("gl");
  }, []);
  if (mode === "gl") return <GlWorld tier={tier} />;
  return <StillWorld />;
}
