/** Clavier : infobulle (focus, Échap, Entrée), onglets de la console (flèches, Début, Fin), lieu de la carte (Entrée), contour de focus. */
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.waitForTimeout(400);
const out = {};
// Infobulle : focus clavier l'ouvre, Échap la ferme
const term = page.locator(".hero .term").first();
await term.focus(); await page.waitForTimeout(150);
out.infobulleAuFocus = await term.getAttribute("aria-expanded");
await page.keyboard.press("Escape"); await page.waitForTimeout(150);
out.infobulleApresEchap = await term.getAttribute("aria-expanded");
// Onglets : flèches
const first = page.getByRole("tab").first();
await first.focus(); await page.waitForTimeout(200);
out.ongletInitial = await first.textContent();
await page.keyboard.press("ArrowRight"); await page.waitForTimeout(200);
out.ongletApresFlecheDroite = await page.evaluate(() => document.activeElement?.textContent);
out.selectionSuitLeFocus = await page.evaluate(() => document.activeElement?.getAttribute("aria-selected"));
await page.keyboard.press("End"); await page.waitForTimeout(200);
out.ongletApresFin = await page.evaluate(() => document.activeElement?.textContent);
await page.keyboard.press("Home"); await page.waitForTimeout(200);
out.ongletApresDebut = await page.evaluate(() => document.activeElement?.textContent);
// Carte : Entrée sur un lieu
await page.getByRole("tab", { name: /Carte/ }).click(); await page.waitForTimeout(200);
const spot = page.locator(".map__spot").nth(2);
await spot.focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
out.lieuParEntree = await spot.getAttribute("aria-pressed");
// Contour de focus visible sur un bouton
await page.getByRole("button", { name: /Son/ }).focus();
out.contourFocusSon = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return `${cs.outlineStyle} ${cs.outlineWidth} / box-shadow ${cs.boxShadow.slice(0, 40)}`; });
console.log(JSON.stringify(out, null, 1));
await browser.close();
