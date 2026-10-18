import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");

function walk(dir, out = []) {
  for (const f of readdirSync(join(root, dir))) {
    const p = join(dir, f);
    if (statSync(join(root, p)).isDirectory()) { if (!["node_modules", ".next", "fonts"].includes(f)) walk(p, out); }
    else if (/\.(tsx?|css|mjs)$/.test(f)) out.push(p);
  }
  return out;
}

const sources = ["app", "components", "src"].flatMap((d) => walk(d));

test("tous les termes [[id]] des textes existent dans le lexique", () => {
  const lex = read("src/content/lexique.ts");
  const ids = new Set([...lex.matchAll(/id: "([a-z0-9-]+)"/g)].map((m) => m[1]));
  const descent = read("src/content/descent.ts").replace(/\/\*\*[\s\S]*?\*\//g, "");
  const refs = [...descent.matchAll(/\[\[([a-z0-9-]+)/g)].map((m) => m[1]);
  assert.ok(refs.length > 5);
  for (const r of refs) assert.ok(ids.has(r), `terme inconnu : ${r}`);
  const houses = read("src/content/houses.ts");
  for (const m of houses.matchAll(/termId: "([a-z0-9-]+)"/g)) assert.ok(ids.has(m[1]), `termId inconnu : ${m[1]}`);
  const sietch = read("src/content/sietch.ts");
  for (const m of sietch.matchAll(/termId: "([a-z0-9-]+)"/g)) assert.ok(ids.has(m[1]), `termId inconnu : ${m[1]}`);
});

test("aucun appel à Google Fonts, aucune police hors OFL", () => {
  for (const f of sources) assert.ok(!read(f).includes("fonts.googleapis.com"), `fonts.googleapis.com dans ${f}`);
  const fonts = readdirSync(join(root, "src/fonts"));
  assert.ok(fonts.some((f) => f.startsWith("OFL-archivo")));
  assert.ok(fonts.some((f) => f.startsWith("OFL-cormorant")));
  assert.ok(fonts.some((f) => f.startsWith("OFL-ibmplexmono")));
});

test("tous les liens publiés sont en https et consignés dans docs/sources.md ou connus", () => {
  const sietch = read("src/content/sietch.ts");
  const hrefs = [...sietch.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 10);
  const sourcesDoc = read("docs/sources.md");
  for (const h of hrefs) {
    assert.ok(h.startsWith("https://"), `lien non https : ${h}`);
    const host = new URL(h).hostname.replace(/^www\./, "");
    assert.ok(sourcesDoc.includes(host), `hôte absent de docs/sources.md : ${host}`);
  }
});

test("pied de page et mentions légales : mention non officielle et Zelyris", () => {
  const site = read("src/config/site.ts");
  assert.match(site, /Site de fan non officiel, sans lien avec Herbert Properties LLC, Legendary Entertainment, Warner Bros\. ou Funcom\. Dune et les marques associées appartiennent à leurs propriétaires\./);
  const footer = read("components/experience/Footer.tsx");
  assert.ok(footer.includes("site.disclaimer"));
  assert.ok(footer.includes("Conçu par"));
  assert.ok(footer.includes("/mentions-legales"));
});

test("le son est coupé par défaut et jamais créé avant un geste", () => {
  const sound = read("src/lib/sound.ts");
  assert.match(sound, /let enabled = false/);
  const audio = read("src/lib/audio.ts");
  assert.ok(!/new AudioContext\(\)/.test(read("app/layout.tsx")));
  assert.ok(audio.includes("async start()"));
});

test("les épigraphes sont signées Carnets du Sietch", () => {
  const d = read("src/content/descent.ts");
  assert.match(d, /const SIGN = "Carnets du Sietch"/);
  assert.ok(!/Litanie|je ne connaîtrai pas la peur/i.test(d), "aucune citation longue des livres");
});
