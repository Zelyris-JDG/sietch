import { ambience } from "./audio";
import { readPref, writePref } from "./prefs";
import { storageKeys } from "../config/site";

let enabled = false;
let armed = false;
const subs = new Set<(on: boolean) => void>();

export function soundEnabled(): boolean {
  return enabled;
}

export function subscribeSound(fn: (on: boolean) => void): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

/** Bascule du son. Toujours appelée depuis un geste du visiteur (clic, touche). */
export async function setSound(on: boolean): Promise<void> {
  enabled = on;
  writePref(storageKeys.sound, on ? "on" : "off");
  if (on) await ambience.start();
  else ambience.stop();
  for (const fn of subs) fn(on);
}

/**
 * Au chargement : si le visiteur avait laissé le son, il reprend au premier geste (les navigateurs interdisent
 * tout son avant une interaction). Et le son se coupe quand l'onglet est caché.
 */
export function armSound(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;
  document.addEventListener("visibilitychange", () => {
    if (!enabled) return;
    if (document.hidden) ambience.stop();
    else void ambience.start();
  });
  if (readPref(storageKeys.sound) !== "on") return;
  const start = () => {
    cleanup();
    void setSound(true);
  };
  const cleanup = () => {
    window.removeEventListener("pointerdown", start);
    window.removeEventListener("keydown", start);
  };
  window.addEventListener("pointerdown", start);
  window.addEventListener("keydown", start);
}
