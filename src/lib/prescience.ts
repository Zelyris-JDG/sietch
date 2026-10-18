import { state, notify } from "./store";

type Fn = (on: boolean) => void;
const subs = new Set<Fn>();

export function isPrescient(): boolean {
  return state.prescience;
}

export function setPrescience(on: boolean): void {
  if (state.prescience === on) return;
  state.prescience = on;
  if (typeof document !== "undefined") {
    if (on) document.documentElement.setAttribute("data-prescience", "on");
    else document.documentElement.removeAttribute("data-prescience");
  }
  for (const fn of subs) fn(on);
  notify();
}

export function onPrescience(fn: Fn): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

/**
 * Jours civils restants avant une date (AAAA-MM-JJ) dans le calendrier local du visiteur : le « N » de « J−N ».
 * 0 le jour même, négatif après. Arrondi : une journée de 23 ou 25 heures (changement d'heure) compte pour un jour.
 * À n'appeler que côté client (le résultat dépend du fuseau et de l'heure du visiteur).
 */
export function daysUntil(iso: string, now: number = Date.now()): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const t = new Date(now);
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

/** Libellé court du compte à rebours : « J−59 », « Jour J », « J+3 » (signe moins typographique, comme l'altitude). */
export function dayLabel(days: number): string {
  if (days === 0) return "Jour J";
  return days > 0 ? `J−${days}` : `J+${-days}`;
}
