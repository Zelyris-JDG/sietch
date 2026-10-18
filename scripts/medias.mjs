/**
 * `pnpm medias` — la seule commande à lancer après avoir déposé les images de docs/medias.md dans public/images/.
 *   1. liste les 12 emplacements : présent (fichier, dimensions) ou manquant ;
 *   2. vérifie le format avec sharp (ratio attendu à 2 % près, taille minimale = 75 % des dimensions prévues) ;
 *   3. écrit à côté de chaque PNG / JPG un .webp et un .avif de même nom (versions légères pour les usages hors
 *      next/image : image de partage, fond CSS…) — seulement s'ils manquent ou sont plus anciens que la source ;
 *   4. rappelle la marche à suivre.
 * Aucune dépendance au-delà de sharp (déjà en devDependency). Sortie 0 même s'il manque des images ; 1 si un fichier
 * présent est illisible. Node 22.18 ou plus (import direct de src/config/media.ts, comme les tests unitaires).
 */
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import sharp from "sharp";
import { MEDIA, MEDIA_EXTENSIONS } from "../src/config/media.ts";

const root = new URL("../", import.meta.url).pathname;
const dir = join(root, "public", "images");
mkdirSync(dir, { recursive: true });
const names = new Set(readdirSync(dir));
const SOURCES = ["png", "jpg", "jpeg"];
const ratio = (w, h) => (w / h).toFixed(3);

let present = 0;
let failed = 0;
const warnings = [];
const written = [];

/** Écrit `target` depuis `source` si absent ou plus ancien. */
async function derive(source, target, encode) {
  try {
    if (names.has(target.name) && statSync(target.path).mtimeMs >= statSync(source).mtimeMs) return;
  } catch {
    /* cible absente : on l'écrit */
  }
  await encode(sharp(source)).toFile(target.path);
  const kb = Math.round(statSync(target.path).size / 1024);
  written.push(`${target.name} (${kb} ko)`);
}

console.log(`\nImages du Sietch — ${relative(root, dir)}/\n`);
for (const m of MEDIA) {
  const label = `${String(m.n).padStart(2, "0")}  ${m.id}`.padEnd(28);
  const ext = MEDIA_EXTENSIONS.find((e) => names.has(`${m.id}.${e}`));
  if (!ext) {
    console.log(`  ${label} manquant   → attendu : public/images/${m.id}.png (${m.width} × ${m.height})`);
    continue;
  }
  const file = join(dir, `${m.id}.${ext}`);
  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (e) {
    failed++;
    console.log(`  ${label} ILLISIBLE  ${m.id}.${ext} : ${e.message}`);
    continue;
  }
  present++;
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const notes = [];
  if (Math.abs(w / h - m.width / m.height) / (m.width / m.height) > 0.02) notes.push(`ratio ${ratio(w, h)} au lieu de ${ratio(m.width, m.height)} (${m.width} × ${m.height})`);
  if (w < m.width * 0.75 || h < m.height * 0.75) notes.push(`trop petite : minimum ${Math.round(m.width * 0.75)} × ${Math.round(m.height * 0.75)}`);
  console.log(`  ${label} présent    ${`${m.id}.${ext}`.padEnd(26)} ${w} × ${h}${notes.length ? `   ⚠ ${notes.join(" ; ")}` : ""}`);
  for (const n of notes) warnings.push(`${m.id}.${ext} : ${n}`);
  if (SOURCES.includes(ext)) {
    await derive(file, { name: `${m.id}.webp`, path: join(dir, `${m.id}.webp`) }, (s) => s.webp({ quality: 82 }));
    await derive(file, { name: `${m.id}.avif`, path: join(dir, `${m.id}.avif`) }, (s) => s.avif({ quality: 55, effort: 4 }));
  }
}

console.log(`\n${present} présente(s) sur ${MEDIA.length}, ${MEDIA.length - present - failed} manquante(s)${failed ? `, ${failed} illisible(s)` : ""}.`);
if (written.length) console.log(`Versions légères écrites : ${written.join(", ")}.`);
if (warnings.length) console.log(`\nÀ vérifier (l'image s'affiche quand même, recadrée par object-fit: cover) :\n  - ${warnings.join("\n  - ")}`);

console.log(`
Marche à suivre :
  1. Déposer chaque image dans public/images/ sous le nom prévu (docs/medias.md) : .png de préférence, .jpg / .webp / .avif acceptés.
  2. Lancer \`pnpm medias\` (cette commande) : liste, vérification, versions .webp et .avif.
  3. Commit + push des images et de leurs versions légères : la préversion Vercel les affiche automatiquement.
Sans fichier, chaque emplacement garde son rendu procédural.
`);
process.exit(failed ? 1 : 0);
