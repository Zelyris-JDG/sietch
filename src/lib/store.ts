/**
 * État partagé du défilement et de la descente — un objet mutable très simple, lu chaque image par le
 * monde WebGL et par l'interface (compteur d'altitude), écrit par le rail de défilement.
 * Pas de React ici : rien ne se re-rend 60 fois par seconde.
 */
export type SceneId = "orbite" | "entree" | "desert" | "epice" | "maisons" | "sietch" | "prescience" | "fin";

export const SCENES: SceneId[] = ["orbite", "entree", "desert", "epice", "maisons", "sietch", "prescience", "fin"];

export type DescentState = {
  /** Progression 0 → 1 de chaque scène (0 : son haut touche le bas de l'écran, 1 : son bas touche le haut). */
  progress: Record<SceneId, number>;
  /** Position et vitesse du défilement (px, px/s), lissées. */
  y: number;
  velocity: number;
  /** Régularité du pas sur la dernière seconde : 1 = cadence parfaitement régulière, 0 = irrégulière / arrêt. */
  rhythm: number;
  /** Proximité du ver, 0 → 1 (monte quand on marche au rythme sur le sable, redescend sinon). */
  worm: number;
  /** Altitude affichée, en mètres (négative sous le roc). */
  altitude: number;
  /** Libellé d'état pour la console. */
  phase: string;
  /** Progression globale de la descente 0 → 1 (orbite → sable). */
  descent: number;
  /** Mode prescience actif. */
  prescience: boolean;
  /** Heure du ciel : jour, crépuscule, nuit. */
  sky: "day" | "dusk" | "night";
};

export const state: DescentState = {
  progress: { orbite: 0, entree: 0, desert: 0, epice: 0, maisons: 0, sietch: 0, prescience: 0, fin: 0 },
  y: 0,
  velocity: 0,
  rhythm: 0,
  worm: 0,
  altitude: 1_200_000,
  phase: "ORBITE BASSE",
  descent: 0,
  prescience: false,
  sky: "night",
};

type Listener = (s: DescentState) => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify(): void {
  for (const fn of listeners) fn(state);
}

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Altitude et phase à partir des progressions de scène. Orbite basse ≈ 1 200 km → sortie de soute ;
 * entrée atmosphérique 400 km → 12 km ; désert 12 km → 0 ; sous le roc jusqu'à −80 m.
 */
export function computeAltitude(p: DescentState["progress"]): { altitude: number; phase: string; descent: number } {
  const o = p.orbite, e = p.entree, d = p.desert, s = p.sietch;
  if (e <= 0 && d <= 0) {
    // Dans la soute puis en orbite : la frégate quitte le vaisseau pendant la première moitié.
    const t = clamp01((o - 0.5) / 0.5);
    return { altitude: lerp(1_200_000, 400_000, t * t), phase: o < 0.55 ? "SOUTE · LONG-COURRIER" : "ORBITE BASSE", descent: t * 0.25 };
  }
  if (d <= 0) {
    const t = smoothstep(0, 1, e);
    const alt = lerp(400_000, 12_000, t);
    const phase = e < 0.35 ? "RENTRÉE · BOUCLIER THERMIQUE" : e < 0.8 ? "TEMPÊTE DE CORIOLIS" : "SOUS LES NUAGES DE POUSSIÈRE";
    return { altitude: alt, phase, descent: 0.25 + t * 0.4 };
  }
  if (s <= 0) {
    const t = smoothstep(0, 0.85, d);
    const alt = lerp(12_000, 0, t);
    return { altitude: alt, phase: d < 0.85 ? "APPROCHE · DUNES" : "SUR LE SABLE", descent: 0.65 + t * 0.35 };
  }
  const t = smoothstep(0, 1, s);
  return { altitude: -lerp(0, 80, t), phase: "SOUS LE ROC · SIETCH", descent: 1 };
}
