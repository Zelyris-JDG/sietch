/** Gestes tactiles sur le profil téléphone : infobulle d'un terme, onglets de la console, carte, son, prescience. */
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const out = {};
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).tap();
await page.waitForTimeout(400);
// 1. Terme du lexique : un toucher ouvre, un toucher ailleurs ferme.
const term = page.locator(".hero .term").first();
await term.tap();
await page.waitForTimeout(200);
out.termeOuvert = await term.getAttribute("aria-expanded");
const tipVisible = await page.locator(".hero .term").first().locator(".term__tip").evaluate((n) => { const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return cs.visibility !== "hidden" && cs.opacity !== "0" && r.width > 0 && r.left >= 0 && r.right <= innerWidth; });
out.infobulleVisibleDansEcran = tipVisible;
await page.touchscreen.tap(300, 700);
await page.waitForTimeout(200);
out.termeFermeApresToucherAilleurs = await term.getAttribute("aria-expanded");
// 2. Son : coupé par défaut, un toucher l'active (après un geste), un second le coupe.
const son = page.getByRole("button", { name: /Son/ });
out.sonAvant = await son.getAttribute("aria-pressed");
await son.tap(); await page.waitForTimeout(200);
out.sonApres = await son.getAttribute("aria-pressed");
await son.tap(); await page.waitForTimeout(200);
out.sonRecoupe = await son.getAttribute("aria-pressed");
// 3. Console : onglets.
await page.evaluate(() => document.getElementById("sietch").scrollIntoView({ block: "start", behavior: "instant" }));
await page.waitForTimeout(600);
const tabs = page.getByRole("tab");
out.nbOnglets = await tabs.count();
const livres = page.getByRole("tab", { name: /Livres/ });
await livres.tap(); await page.waitForTimeout(250);
out.ongletLivresActif = await livres.getAttribute("aria-selected");
out.panneauLivresVisible = await page.locator("#panel-livres").isVisible().catch(() => "absent");
// 4. Carte : toucher un lieu.
const carte = page.getByRole("tab", { name: /Carte/ });
await carte.tap(); await page.waitForTimeout(250);
const spot = page.locator(".map__spot").filter({ hasText: /Sietch Tabr/i }).first();
const spotCount = await page.locator(".map__spot").count();
out.nbLieux = spotCount;
if (spotCount) {
  await spot.tap(); await page.waitForTimeout(250);
  out.lieuChoisi = await spot.getAttribute("aria-pressed");
  out.ficheLieu = (await page.locator(".map__sheet").first().textContent().catch(() => "")).slice(0, 60);
}
// 5. Prescience.
await page.evaluate(() => document.getElementById("prescience").scrollIntoView({ block: "start", behavior: "instant" }));
await page.waitForTimeout(500);
await page.getByRole("button", { name: "Prendre l’épice" }).tap(); await page.waitForTimeout(400);
out.prescienceOn = await page.evaluate(() => document.documentElement.dataset.prescience);
await page.getByRole("button", { name: "Revenir au présent" }).first().tap(); await page.waitForTimeout(400);
out.prescienceOff = await page.evaluate(() => document.documentElement.dataset.prescience ?? "off");
console.log(JSON.stringify(out, null, 1));
await browser.close();
