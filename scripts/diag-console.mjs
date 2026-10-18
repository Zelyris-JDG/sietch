/** Erreurs et avertissements de la console du navigateur pendant une descente complète (bureau + téléphone, monde WebGL). */
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const views = [
  { name: "bureau", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
let total = 0;
for (const v of views) {
  const ctx = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor ?? 1, locale: "fr-FR" });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => logs.push(`pageerror: ${String(e).slice(0, 200)}`));
  page.on("requestfailed", (r) => logs.push(`requestfailed: ${r.url().slice(0, 120)} ${r.failure()?.errorText}`));
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Entrer en silence" }).click();
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /Son/ }).click();
  for (const id of ["entree", "desert", "epice", "maisons", "sietch", "prescience", "fin"]) {
    await page.evaluate((i) => { const el = document.getElementById(i); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 300, behavior: "instant" }); }, id);
    await page.waitForTimeout(1500);
  }
  await page.getByRole("button", { name: "Prendre l’épice" }).click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Revenir au présent" }).first().click();
  await page.waitForTimeout(500);
  for (const id of ["desert", "orbite"]) {
    await page.evaluate((i) => { const el = document.getElementById(i); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 100, behavior: "instant" }); }, id);
    await page.waitForTimeout(1500);
  }
  await page.goto("http://127.0.0.1:3100/lexique", { waitUntil: "networkidle" });
  await page.goto("http://127.0.0.1:3100/mentions-legales", { waitUntil: "networkidle" });
  console.log(`== ${v.name} : ${logs.length} message(s)`);
  for (const l of logs) console.log("  " + l);
  total += logs.length;
  await ctx.close();
}
await browser.close();
console.log(total ? `${total} message(s) à examiner` : "console propre");
