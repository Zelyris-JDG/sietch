/** Retour d'une page vers l'accueil dans la même session : l'intro ne doit pas réapparaître, même un instant. */
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
const before = await page.evaluate(() => getComputedStyle(document.querySelector(".intro")).display);
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.goto("http://127.0.0.1:3100/lexique", { waitUntil: "domcontentloaded" });
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "commit" });
// Juste après le premier rendu : le script d'amorçage a-t-il marqué l'intro comme vue ?
const early = await page.evaluate(() => ({ seen: document.documentElement.dataset.intro, display: document.querySelector(".intro") ? getComputedStyle(document.querySelector(".intro")).display : "absente" }));
await page.waitForLoadState("networkidle");
const late = await page.evaluate(() => ({ seen: document.documentElement.dataset.intro, intro: !!document.querySelector(".intro"), entered: !document.documentElement.classList.contains("intro-open") }));
console.log(JSON.stringify({ premiereVisite: before, retourImmediat: early, retourStabilise: late }));
await browser.close();
