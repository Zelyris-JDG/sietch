/** Clavier : Tab jusqu’au premier terme, Échap (le focus doit rester sur le terme), Entrée (bascule). */
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
await page.keyboard.press("Tab"); // bouton de l'intro
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
await page.keyboard.press("Tab"); // premier terme du héro
await page.waitForTimeout(200);
const r1 = await page.evaluate(() => ({ actif: document.activeElement?.textContent?.slice(0, 20), expanded: document.activeElement?.getAttribute("aria-expanded"), tipVisible: (() => { const t = document.activeElement?.querySelector(".term__tip"); if (!t) return null; const cs = getComputedStyle(t); return cs.visibility !== "hidden" && cs.opacity !== "0"; })() }));
await page.keyboard.press("Escape"); await page.waitForTimeout(200);
const r2 = await page.evaluate(() => ({ expanded: document.activeElement?.getAttribute("aria-expanded") }));
await page.keyboard.press("Enter"); await page.waitForTimeout(200);
const r3 = await page.evaluate(() => ({ expandedApresEntree: document.activeElement?.getAttribute("aria-expanded") }));
console.log(JSON.stringify({ auTab: r1, apresEchap: r2, apresEntree: r3 }));
await browser.close();
