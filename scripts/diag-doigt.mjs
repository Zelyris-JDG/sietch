/** Diagnostic du « marcher sans rythme » au doigt : balayages CDP réguliers, état du rythme après chacun. */
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.evaluate(() => { const el = document.getElementById("desert"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + innerHeight * 0.3, behavior: "instant" }); });
await page.evaluate(() => { window.__touch = { start: 0, move: 0, end: 0, cancel: 0 }; for (const k of ["start", "move", "end", "cancel"]) window.addEventListener("touch" + k, () => window.__touch[k]++, { passive: true }); });
await page.waitForTimeout(500);
const cdp = await ctx.newCDPSession(page);
async function swipe(distance, durationMs) {
  const x = 195, y0 = 640, n = 6;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= n; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - (distance * i) / n }] }); await page.waitForTimeout(durationMs / n); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
const t0 = Date.now();
for (let i = 0; i < 9; i++) {
  await swipe(120, 120);
  await page.waitForTimeout(400);
  console.log(Date.now() - t0, "ms", await page.evaluate(() => { const s = window.__sietch; return JSON.stringify({ touch: window.__touch, rhythm: +s.rhythm.toFixed(2), worm: +s.worm.toFixed(2), desert: +s.progress.desert.toFixed(2), epice: +s.progress.epice.toFixed(2), y: Math.round(scrollY), near: document.documentElement.dataset.worm }); }));
}
await browser.close();
