/**
 * Captures mobile + bureau de chaque scène, dans docs/captures/<label>/. Usage :
 *   node scripts/captures.mjs --label=phase2 [--url=http://127.0.0.1:3100] [--wait=1600] [--only=desert,epice] [--view=bureau]
 * --wait : délai (ms) après chaque saut de défilement — plus long sous SwiftShader (rendu logiciel lent), pour laisser
 * la caméra converger comme dans un vrai navigateur.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

/** Capture en WebP (dépôt léger) : PNG en mémoire → WebP qualité 82. */
async function shot(page, path) {
  const buf = await page.screenshot();
  await sharp(buf).webp({ quality: 82 }).toFile(path);
}

const args = Object.fromEntries(process.argv.slice(2).map((s) => { const i = s.indexOf("="); return [s.slice(2, i), s.slice(i + 1)]; }));
const label = args.label ?? "captures";
const url = args.url ?? "http://127.0.0.1:3100";
const dir = `docs/captures/${label}`;
mkdirSync(dir, { recursive: true });
const wait = Number(args.wait ?? 1600);
const only = args.only ? args.only.split(",") : null;

const views = [
  { name: "bureau", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
const stops = ["orbite", "entree", "desert", "epice", "maisons", "sietch", "prescience", "fin"];
const allViews = views.filter((v) => !args.view || v.name === args.view);

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const v of allViews) {
  const ctx = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor ?? 1, locale: "fr-FR" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  if (!only) await shot(page, `${dir}/${v.name}-00-intro.webp`);
  await page.getByRole("button", { name: "Entrer en silence" }).click();
  await page.waitForTimeout(1200);
  for (const [i, id] of stops.entries()) {
    if (only && !only.includes(id)) continue;
    const el = page.locator(`#${id}`);
    const box = await el.boundingBox();
    if (!box) continue;
    // Scènes hautes : viser le milieu de la partie collante ; scènes plates : le haut.
    const top = await el.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
    const h = await el.evaluate((n) => n.getBoundingClientRect().height);
    const target = h > v.viewport.height * 1.5 ? top + h * 0.45 : top - 40;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), target);
    await page.waitForTimeout(wait);
    await shot(page, `${dir}/${v.name}-${String(i + 1).padStart(2, "0")}-${id}.webp`);
  }
  await ctx.close();
}
await browser.close();
console.log(`captures → ${dir}`);
