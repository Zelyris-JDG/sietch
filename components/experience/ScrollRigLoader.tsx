"use client";

import dynamic from "next/dynamic";

/**
 * Le rail de défilement (Lenis + GSAP ScrollTrigger, ≈ 80 ko) n'entre pas dans le paquet initial : il est demandé
 * après l'hydratation, une fois le premier écran peint. La page reste complète et lisible sans lui.
 */
const ScrollRig = dynamic(() => import("./ScrollRig").then((m) => m.ScrollRig), { ssr: false });

export function ScrollRigLoader() {
  return <ScrollRig />;
}
