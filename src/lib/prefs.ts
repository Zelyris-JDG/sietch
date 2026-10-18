/** Lecture / écriture mémorisées côté navigateur, toujours protégées (navigation privée, stockage bloqué). */
export function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignoré */
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Heure du ciel selon l'heure locale du visiteur (hypothèse H9). */
export function skyFromHour(hour: number): "day" | "dusk" | "night" {
  if (hour >= 7 && hour < 17) return "day";
  if ((hour >= 17 && hour < 20) || (hour >= 5 && hour < 7)) return "dusk";
  return "night";
}

/**
 * Niveau de l'appareil : "low" = peu de cœurs, peu de mémoire ou connexion économe → particules réduites,
 * WebGL allégé. Mesuré une seule fois.
 */
export function deviceTier(): "low" | "high" {
  if (typeof navigator === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData === true;
  const slow = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  const small = Math.min(window.innerWidth, window.innerHeight) < 500;
  if (saveData || slow || cores <= 4 || mem <= 3 || (small && cores <= 6)) return "low";
  return "high";
}

/** three.js (r163 et plus) exige WebGL 2 : sans lui, la version calme. */
export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}
