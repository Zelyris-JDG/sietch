import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://127.0.0.1:3100/?rail=0";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
const page = await ctx.newPage();
await page.addInitScript(() => {
  window.__lcp = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), size: e.size, tag: e.element?.tagName, cls: e.element?.className?.toString().slice(0, 40), text: (e.element?.textContent || "").slice(0, 40), url: e.url }); }).observe({ type: "largest-contentful-paint", buffered: true });
  window.__paints = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__paints.push({ name: e.name, t: Math.round(e.startTime) }); }).observe({ type: "paint", buffered: true });
});
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(5000);
const r = await page.evaluate(() => ({ lcp: window.__lcp, paints: window.__paints, fonts: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style}:${f.status}`) }));
console.log(JSON.stringify(r, null, 1));
await browser.close();
