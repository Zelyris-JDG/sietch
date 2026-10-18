import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { register } from "node:module";
import { join } from "node:path";
import { EXPANDED, FILMS, NOVELS, PART_THREE, READING_PATHS, READING_QUESTIONS, RELEASES, recommendReading } from "../../src/content/sietch.ts";

// src/lib/prescience.ts importe « ./store » sans extension (le bundler la devine) ; Node exige l'extension : ce crochet l'ajoute.
register("data:text/javascript," + encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try { return await next(specifier, context); }
  catch (e) {
    if (e?.code === "ERR_MODULE_NOT_FOUND" && /^\\.{1,2}\\//.test(specifier) && !/\\.[cm]?[jt]sx?$/.test(specifier)) return next(specifier + ".ts", context);
    throw e;
  }
}`));
const { dayLabel, daysUntil } = await import("../../src/lib/prescience.ts");

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

test("guide de lecture : chaque combinaison de réponses mène à un parcours, chaque départ est un vrai titre", () => {
  const titles = new Set([...NOVELS.map((n) => n.fr), ...EXPANDED.flatMap((c) => c.books)]);
  const ids = READING_PATHS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "identifiants de parcours uniques");
  for (const p of READING_PATHS) {
    assert.ok(titles.has(p.start), `titre de départ inconnu : ${p.start}`);
    for (const [q, o] of Object.entries(p.match)) {
      const question = READING_QUESTIONS.find((x) => x.id === q);
      assert.ok(question, `question inconnue : ${q}`);
      assert.ok(question.options.some((x) => x.id === o), `option inconnue : ${q} = ${o}`);
    }
    assert.ok(p.order.length >= 1, `ordre vide : ${p.id}`);
    assert.ok(p.why.length > 80 && p.why.length < 420, `« pourquoi » hors format : ${p.id}`);
  }
  // Toutes les combinaisons (2 × 3 × 2) trouvent un parcours ; un jeu de réponses incomplet n'en trouve aucun.
  const combos = READING_QUESTIONS.reduce((acc, q) => acc.flatMap((a) => q.options.map((o) => ({ ...a, [q.id]: o.id }))), [{}]);
  assert.equal(combos.length, 12);
  for (const c of combos) assert.ok(recommendReading(c), `aucun parcours pour ${JSON.stringify(c)}`);
  assert.equal(recommendReading({}), null);
  assert.equal(recommendReading({ films: "oui", envie: "saga" }), null);
  // Les réponses « films vus » + « lecture rapide » commencent par Le Messie (les films ont donné le premier roman).
  assert.equal(recommendReading({ films: "oui", envie: "histoire", rythme: "rapide" }).start, "Le Messie de Dune");
  assert.equal(recommendReading({ films: "non", envie: "histoire", rythme: "dense" }).start, "Dune");
});

test("compte à rebours : les dates de PART_THREE sont celles de FILMS et de RELEASES", () => {
  const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const toIso = (s) => {
    const m = s.match(/^(\d{1,2})(?:er)? (\p{L}+) (\d{4})/u);
    assert.ok(m, `date illisible : ${s}`);
    return `${m[3]}-${String(MONTHS.indexOf(m[2]) + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  };
  const release = RELEASES.find((r) => r.id === PART_THREE.releaseId);
  assert.ok(release, "sortie dune-3 présente dans RELEASES");
  assert.equal(release.date, PART_THREE.fr);
  const frLong = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
  assert.ok(release.note.replace(/[\u202f\u00a0]/g, " ").includes(`États-Unis : ${frLong(PART_THREE.us)}`), "la note de RELEASES donne la même date américaine"); // espaces insécables (typographie française) ramenées à des espaces
  const film = FILMS.find((f) => f.id === PART_THREE.filmId);
  assert.ok(film, "film villeneuve-2026 présent dans FILMS");
  assert.equal(film.title, PART_THREE.title);
  assert.equal(toIso(film.dates.find((d) => d.label === "France").value), PART_THREE.fr);
  assert.equal(toIso(film.dates.find((d) => d.label === "États-Unis").value), PART_THREE.us);
});

test("jours restants : calendrier local, 0 le jour même, négatif après, insensible au changement d'heure", () => {
  const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
  assert.equal(daysUntil("2026-12-16", at(2026, 10, 18, 0)), 59);
  assert.equal(daysUntil("2026-12-16", at(2026, 10, 18, 23)), 59); // l'heure du jour ne change rien
  assert.equal(daysUntil("2026-12-16", at(2026, 12, 15, 23)), 1);
  assert.equal(daysUntil("2026-12-16", at(2026, 12, 16, 0)), 0);
  assert.equal(daysUntil("2026-12-16", at(2026, 12, 17, 1)), -1);
  assert.equal(daysUntil("2026-12-18", at(2026, 12, 16)), 2);
  assert.equal(daysUntil("2026-03-30", at(2026, 3, 28)), 2); // à travers le passage à l'heure d'été (Europe)
  assert.equal(dayLabel(59), "J−59");
  assert.equal(dayLabel(0), "Jour J");
  assert.equal(dayLabel(-3), "J+3");
});
