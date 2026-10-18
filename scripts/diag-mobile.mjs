import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: "fr-FR" });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const q = (s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { left: Math.round(r.left), width: Math.round(r.width), right: Math.round(r.right) }; };
  return { inner: q(".intro__inner"), p: q(".intro__inner .prose"), actions: q(".intro__actions"), btn: q(".intro__actions .btn"), intro: q(".intro"), html: document.documentElement.clientWidth, dpr: devicePixelRatio, fontSize: getComputedStyle(document.querySelector(".intro__inner .prose")).fontSize };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: "/tmp/claude-0/-home-user/4a096ee7-2c0b-582f-af2f-39e34bca1de5/scratchpad/intro-mobile.png" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.waitForTimeout(1500);
const hud = await page.evaluate(() => { const r = document.querySelector(".hud--tools").getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth }; });
console.log("hud", JSON.stringify(hud));
await browser.close();
