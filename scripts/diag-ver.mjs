import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.evaluate(() => { const el = document.getElementById("desert"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + innerHeight * 0.4, behavior: "instant" }); });
await page.waitForTimeout(600);
await page.mouse.move(600, 400);
const t0 = Date.now();
for (let i = 0; i < 30; i++) {
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(90);
  if (i % 6 === 5) console.log(Date.now() - t0, "ms", await page.evaluate(() => { const s = window.__sietch; return JSON.stringify({ rhythm: +s.rhythm.toFixed(2), worm: +s.worm.toFixed(2), desert: +s.progress.desert.toFixed(2), y: Math.round(s.y), v: Math.round(s.velocity) }); }));
}
await browser.close();
