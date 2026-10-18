/** Captures du héro (soute → sortie de soute), bureau et téléphone : node scripts/shot-hero.mjs --label=avant [--view=bureau|mobile] [--wait=4000] [--sky=nuit] [--fr=0,0.18,0.35,0.5] [--dir=docs/captures/hero] */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const a = Object.fromEntries(process.argv.slice(2).map((s) => { const i = s.indexOf("="); return i < 0 ? [s.slice(2), "1"] : [s.slice(2, i), s.slice(i + 1)]; }));
const dir = a.dir ?? "/tmp/claude-0/-home-user-sietch/e90f834c-7699-513a-8057-05068c07c5af/scratchpad/shots";
const label = a.label ?? "x";
mkdirSync(dir, { recursive: true });
const wait = Number(a.wait ?? 4000);
const url = (a.url ?? "http://127.0.0.1:3100/") + (a.sky ? `?ciel=${a.sky}` : "");
const views = [
  { name: "bureau", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
].filter((v) => !a.view || v.name === a.view);
const fracs = (a.fr ?? "0,0.18,0.35,0.5").split(",").map(Number);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const v of views) {
  const ctx = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor ?? 1, locale: "fr-FR" });
  const page = await ctx.newPage();
  // --tier=high : ce Chromium (4 cœurs) tombe en niveau « low » ; on lui prête 8 cœurs et 8 Go pour voir la version complète (bureau : high, téléphone : mid).
  if (a.tier === "high") await page.addInitScript(() => { Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 }); Object.defineProperty(navigator, "deviceMemory", { get: () => 8 }); });
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log(`[${v.name}] console.${m.type()}: ${m.text().slice(0, 200)}`); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Entrer en silence" }).click();
  await page.waitForTimeout(1500);
  const h = await page.evaluate(() => document.getElementById("orbite").getBoundingClientRect().height);
  for (const f of fracs) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(h * f));
    await page.waitForTimeout(wait);
    const buf = await page.screenshot();
    await sharp(buf).webp({ quality: 84 }).toFile(`${dir}/${label}-${v.name}-${String(Math.round(f * 100)).padStart(2, "0")}.webp`);
  }
  await ctx.close();
}
await browser.close();
console.log("ok", label);
