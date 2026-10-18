import { chromium } from "@playwright/test";
const a = Object.fromEntries(process.argv.slice(2).map((s) => { const i = s.indexOf("="); return [s.slice(2, i), s.slice(i + 1)]; }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +(a.w ?? 1440), height: +(a.h ?? 900) } });
await page.goto(a.url, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: a.out, fullPage: a.full === "1" });
await browser.close();
