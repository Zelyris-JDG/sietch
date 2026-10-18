import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { MEDIA, MEDIA_BY_ID, MEDIA_EXTENSIONS, mediaPath } from "../../src/config/media.ts";

const root = new URL("../../", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");
const doc = read("docs/medias.md");

test("les 12 emplacements sont déclarés, identifiants et noms de fichiers distincts et conformes", () => {
  assert.equal(MEDIA.length, 12);
  assert.equal(new Set(MEDIA.map((m) => m.id)).size, 12, "identifiants en double");
  assert.deepEqual(MEDIA.map((m) => m.n), Array.from({ length: 12 }, (_, i) => i + 1), "numéros 1 à 12 dans l'ordre");
  for (const m of MEDIA) {
    assert.match(m.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `nom de fichier non conforme : ${m.id}`);
    assert.ok(m.alt.length > 30 && !/^\s*$/.test(m.alt), `alt trop court : ${m.id}`);
    assert.ok(m.usage.length > 10, `usage manquant : ${m.id}`);
    assert.equal(mediaPath(m.id, "png"), `/images/${m.id}.png`);
  }
  assert.deepEqual([...MEDIA_EXTENSIONS], ["png", "jpg", "jpeg", "webp", "avif"]);
});

test("chaque emplacement correspond à une ligne du tableau de docs/medias.md, et réciproquement", () => {
  const rows = [...doc.matchAll(/^\| (\d+) \| `([a-z0-9-]+)\.png`/gm)].map((m) => ({ n: Number(m[1]), file: m[2] }));
  assert.equal(rows.length, 12, "le tableau de docs/medias.md doit garder ses 12 lignes");
  for (const r of rows) {
    const m = MEDIA_BY_ID[r.file];
    assert.ok(m, `emplacement non déclaré dans src/config/media.ts : ${r.file}`);
    assert.equal(m.n, r.n, `numéro différent pour ${r.file}`);
  }
  for (const m of MEDIA) assert.ok(rows.some((r) => r.file === m.id), `ligne absente de docs/medias.md : ${m.id}`);
  assert.match(doc, /## Marche à suivre \(une commande\)/);
  assert.match(doc, /pnpm medias/);
});

test("formats : 2560 × 1440 (16:9) partout sauf le repli téléphone vertical", () => {
  for (const m of MEDIA) {
    if (m.id === "dusk-sand") assert.deepEqual([m.width, m.height], [1440, 2560]);
    else assert.deepEqual([m.width, m.height], [2560, 1440], `format inattendu : ${m.id}`);
  }
  assert.match(doc, /`dusk-sand\.png` \(vertical 1440 × 2560\)/);
});

test("les composants lisent les emplacements déclarés ; la détection disque reste côté serveur", () => {
  const still = read("components/world/StillWorld.tsx");
  assert.ok(still.includes("images?: MediaPaths"), "StillWorld accepte la prop images");
  assert.ok(!/["'`]\/images\//.test(still), "aucun chemin d'image en dur dans StillWorld");
  for (const id of ["orbit-dawn", "storm-wall", "dunes-ridge", "spice-sand", "basalt-wall", "two-moons-night", "dusk-sand"]) assert.ok(still.includes(`"${id}"`), `couche sans emplacement : ${id}`);
  const map = read("components/sietch/ArrakisMap.tsx");
  assert.ok(map.includes("images?: MediaPaths"), "ArrakisMap accepte la prop images");
  for (const id of ["shield-wall", "polar-ice", "rock-outcrop"]) assert.ok(map.includes(`"${id}"`), `fiche sans emplacement : ${id}`);
  const server = read("src/lib/media.server.ts");
  assert.ok(server.includes('from "node:fs"'));
  const config = read("src/config/media.ts");
  assert.ok(!config.includes("node:fs"), "la déclaration ne touche pas au disque");
  // aucun composant client n'importe la détection disque
  const walk = (d, out = []) => {
    for (const f of readdirSync(join(root, d))) {
      const p = join(d, f);
      if (statSync(join(root, p)).isDirectory()) walk(p, out);
      else if (/\.tsx?$/.test(f)) out.push(p);
    }
    return out;
  };
  for (const f of walk("components")) {
    const s = read(f);
    if (s.includes('"use client"')) assert.ok(!/from\s+["'][^"']*media\.server/.test(s), `composant client important media.server : ${f}`);
  }
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.scripts.medias, "node scripts/medias.mjs");
});
