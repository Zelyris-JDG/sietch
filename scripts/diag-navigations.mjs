/** Dix allers-retours accueil ↔ lexique avec le monde WebGL : aucun avertissement de contexte WebGL, mémoire stable. */
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text().slice(0, 160)}`); });
page.on("pageerror", (e) => logs.push(`pageerror: ${String(e).slice(0, 160)}`));
const cdp = await page.context().newCDPSession(page);
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.waitForTimeout(2500);
const heap = async () => { await cdp.send("HeapProfiler.collectGarbage").catch(() => {}); const m = await cdp.send("Performance.getMetrics"); return Math.round((m.metrics.find((x) => x.name === "JSHeapUsedSize")?.value ?? 0) / 1048576); };
await cdp.send("Performance.enable");
const h0 = await heap();
const etat = () => page.evaluate(() => ({ url: location.pathname, canvas: document.querySelectorAll("#world canvas").length, monde: document.documentElement.dataset.world ?? "-" }));
console.log("départ", JSON.stringify(await etat()));
const trace = [];
for (let i = 0; i < 10; i++) {
  const link = page.locator("a[href='/lexique']").first();
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900); // laisser le défilement fluide s'arrêter
  await link.click();
  await page.waitForURL("**/lexique", { timeout: 5000 }).catch(async () => page.goto("http://127.0.0.1:3100/lexique"));
  await page.waitForLoadState("networkidle");
  await page.goBack({ waitUntil: "networkidle" }).catch(async () => page.goto("http://127.0.0.1:3100/"));
  await page.waitForTimeout(3000);
  trace.push(await etat());
}
const h1 = await heap();
console.log(JSON.stringify({ tasMoAvant: h0, tasMoApres: h1, retours: trace, messages: logs.slice(0, 10), nbMessages: logs.length }));
await browser.close();
