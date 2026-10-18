/**
 * Cadence du monde WebGL sur la scène d'orbite : compte les requestAnimationFrame pendant N secondes, en bureau
 * (1440×900) et en profil téléphone (390×844, tactile, ×2). Chromium en rendu logiciel (SwiftShader) : les chiffres
 * absolus sont bas, seule la comparaison relative compte.
 *   node scripts/diag-cadence.mjs --url=http://127.0.0.1:3201/ --save=docs/captures/c2-hero/cadence-avant.json
 *   node scripts/diag-cadence.mjs --url=... --compare=docs/captures/c2-hero/cadence-avant.json   (échoue si −10 %)
 * Options : --fr=0.18 (position dans la scène d'orbite), --secs=5, --view=bureau|mobile, --runs=2 (meilleure mesure).
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
const a = Object.fromEntries(process.argv.slice(2).map((s) => { const i = s.indexOf("="); return i < 0 ? [s.slice(2), "1"] : [s.slice(2, i), s.slice(i + 1)]; }));
const url = a.url ?? "http://127.0.0.1:3201/";
const secs = Number(a.secs ?? 5);
const fr = Number(a.fr ?? 0.18);
const runs = Number(a.runs ?? 2);
const views = [
  { name: "bureau", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
].filter((v) => !a.view || v.name === a.view);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const result = {};
for (const v of views) {
  let best = 0;
  for (let run = 0; run < runs; run++) {
    const ctx = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor ?? 1, locale: "fr-FR" });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    await page.waitForTimeout(1500);
    const h = await page.evaluate(() => document.getElementById("orbite").getBoundingClientRect().height);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(h * fr));
    await page.waitForSelector("#world canvas", { timeout: 20000 });
    await page.waitForTimeout(2500); // le monde se stabilise
    const frames = await page.evaluate((ms) => new Promise((res) => {
      let n = 0; const t0 = performance.now();
      const tick = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(tick); else res(n); };
      requestAnimationFrame(tick);
    }), secs * 1000);
    const fps = frames / secs;
    console.log(`${v.name} · essai ${run + 1} : ${frames} images en ${secs} s → ${fps.toFixed(2)} im/s`);
    best = Math.max(best, fps);
    await ctx.close();
  }
  result[v.name] = Number(best.toFixed(2));
}
await browser.close();
console.log("cadence (meilleur essai) :", JSON.stringify(result));
if (a.save) { mkdirSync(dirname(a.save), { recursive: true }); writeFileSync(a.save, JSON.stringify({ url, fr, secs, ...result }, null, 2) + "\n"); console.log("enregistré", a.save); }
if (a.compare) {
  const ref = JSON.parse(readFileSync(a.compare, "utf8"));
  let bad = false;
  for (const v of Object.keys(result)) {
    if (typeof ref[v] !== "number") continue;
    const delta = (result[v] - ref[v]) / ref[v];
    console.log(`${v} : avant ${ref[v]} im/s → après ${result[v]} im/s (${(delta * 100).toFixed(1)} %)`);
    if (delta < -0.10) bad = true;
  }
  if (bad) { console.error("RÉGRESSION de cadence > 10 %"); process.exit(1); }
  console.log("cadence : aucune régression > 10 %");
}
