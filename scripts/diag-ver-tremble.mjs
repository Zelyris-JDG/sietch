import { chromium } from "@playwright/test";
/** Vérifie que le monde reste en place quand le ver est proche (tremblement) : node scripts/diag-ver-tremble.mjs <sortie.png> */
const out = process.argv[2] ?? "docs/captures/ver-tremble.png";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3100/?ciel=jour", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.evaluate(() => { const el = document.getElementById("desert"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + el.getBoundingClientRect().height * 0.45, behavior: "instant" }); });
await page.waitForTimeout(4000);
await page.evaluate(() => { document.documentElement.dataset.worm = "near"; window.__sietch.worm = 0.9; });
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
const r = await page.evaluate(() => { const w = document.getElementById("world").getBoundingClientRect(); const h = document.querySelector(".hud--alt").getBoundingClientRect(); return { world: [Math.round(w.top), Math.round(w.height)], hud: [Math.round(h.top), Math.round(h.left)] }; });
console.log(JSON.stringify(r));
await browser.close();
