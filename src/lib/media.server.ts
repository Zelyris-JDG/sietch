/**
 * Détection, côté serveur seulement, des images présentes dans `public/images/` (node:fs).
 *
 * À importer uniquement depuis des composants serveur (app/page.tsx) : le paquet « server-only » n'est pas installé,
 * le suffixe `.server.ts` et ce commentaire tiennent lieu de garde. Un composant client qui l'importerait ferait
 * échouer la construction (node:fs n'existe pas dans le navigateur) — c'est l'erreur voulue.
 *
 * Les pages sont pré-rendues au build : la liste est donc figée au build (sur Vercel, à chaque déploiement) et relue
 * à chaque rendu en développement (`next dev`). Un accès disque n'est pas une API dynamique de Next (headers(),
 * cookies(), searchParams…) : la page reste statique (vérifié : « ○ (Static) prerendered as static content »).
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { MEDIA, MEDIA_EXTENSIONS, mediaPath, type MediaPaths } from "../config/media";

let cache: MediaPaths | null = null;

/** `{ [id]: "/images/<id>.<ext>" }` pour chaque emplacement dont un fichier accepté existe ; les autres sont absents. */
export function presentMedia(): MediaPaths {
  if (cache && process.env.NODE_ENV === "production") return cache;
  let names = new Set<string>();
  try {
    names = new Set(readdirSync(join(process.cwd(), "public", "images")));
  } catch {
    /* dossier absent : aucune image, rendu procédural partout */
  }
  const out: MediaPaths = {};
  for (const m of MEDIA) {
    const ext = MEDIA_EXTENSIONS.find((e) => names.has(`${m.id}.${e}`));
    if (ext) out[m.id] = mediaPath(m.id, ext);
  }
  cache = out;
  return out;
}
