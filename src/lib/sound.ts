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
 * Un geste qui compte comme « activation » pour tous les navigateurs : `pointerup` (ou `keydown`), jamais `pointerdown`.
 * Le standard HTML (« activation triggering input event ») ne retient `pointerdown` que pour une souris : au doigt,
 * Safari iOS refuse de démarrer un AudioContext sur `pointerdown`/`touchstart`, et le son resterait muet.
 */
function onNextGesture(fn: () => void): () => void {
  const run = () => { cleanup(); fn(); };
  const cleanup = () => {
    window.removeEventListener("pointerup", run);
    window.removeEventListener("keydown", run);
  };
  window.addEventListener("pointerup", run);
  window.addEventListener("keydown", run);
  return cleanup;
}

/**
 * Au chargement : si le visiteur avait laissé le son, il reprend au premier geste (les navigateurs interdisent
 * tout son avant une interaction). Et le son se coupe quand l'onglet est caché.
 */
export function armSound(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;
  let rearm: (() => void) | null = null;
  document.addEventListener("visibilitychange", () => {
    if (!enabled) return;
    if (document.hidden) { ambience.stop(); return; }
    void ambience.start().then(() => {
      // Safari iOS peut refuser la reprise hors d'un geste (contexte « interrupted » après un appel, par exemple) :
      // on réessaie au prochain geste du visiteur.
      if (!ambience.live && !rearm) rearm = onNextGesture(() => { rearm = null; if (enabled) void ambience.start(); });
    });
  });
  if (readPref(storageKeys.sound) !== "on") return;
  onNextGesture(() => void setSound(true));
}
