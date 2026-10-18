/**
 * Captures mobile + bureau de chaque scène, dans docs/captures/<label>/. Usage :
 *   node scripts/captures.mjs --label=phase2 [--url=http://127.0.0.1:3100]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const label = args.label ?? "captures";
const url = args.url ?? "http://127.0.0.1:3100";
const dir = `docs/captures/${label}`;
mkdirSync(dir, { recursive: true });

const views = [
  { name: "bureau", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
const stops = ["orbite", "entree", "desert", "epice", "maisons", "sietch", "prescience", "fin"];

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const v of views) {
  const ctx = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor ?? 1, locale: "fr-FR" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${dir}/${v.name}-00-intro.png` });
  await page.getByRole("button", { name: "Entrer en silence" }).click();
  await page.waitForTimeout(1200);
  for (const [i, id] of stops.entries()) {
    const el = page.locator(`#${id}`);
    const box = await el.boundingBox();
    if (!box) continue;
    // Scènes hautes : viser le milieu de la partie collante ; scènes plates : le haut.
    const top = await el.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
    const h = await el.evaluate((n) => n.getBoundingClientRect().height);
    const target = h > v.viewport.height * 1.5 ? top + h * 0.45 : top - 40;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), target);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${dir}/${v.name}-${String(i + 1).padStart(2, "0")}-${id}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log(`captures → ${dir}`);
