/** Diagnostic du « marcher sans rythme » au doigt avec le profil Playwright « Pixel 7 » (celui des tests) : état du rythme après chaque balayage. */
import { chromium, devices } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 7"] });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:3100/?monde=calme");
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.evaluate(() => { const el = document.getElementById("desert"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + innerHeight * 0.3, behavior: "instant" }); });
await page.waitForTimeout(500);
const cdp = await ctx.newCDPSession(page);
async function swipe(distance, durationMs) {
  const x = 195, y0 = 640, n = 6;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= n; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - (distance * i) / n }] }); await page.waitForTimeout(durationMs / n); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
console.log("viewport", page.viewportSize(), "vh", await page.evaluate(() => innerHeight));
const t0 = Date.now();
for (let i = 0; i < 9; i++) {
  await swipe(120, 100);
  await page.waitForTimeout(260);
  console.log(Date.now() - t0, "ms", await page.evaluate(() => { const s = window.__sietch; return JSON.stringify({ rhythm: +s.rhythm.toFixed(2), worm: +s.worm.toFixed(2), desert: +s.progress.desert.toFixed(2), epice: +s.progress.epice.toFixed(2), y: Math.round(scrollY), motion: document.documentElement.dataset.motion, near: document.documentElement.dataset.worm }); }));
}
await browser.close();
