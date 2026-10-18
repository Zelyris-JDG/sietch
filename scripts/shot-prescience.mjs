import { chromium } from "@playwright/test";
const out = process.argv[2] ?? "/tmp/prescience.png";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const mobile = process.argv[3] === "mobile"; // node scripts/shot-prescience.mjs <sortie.png> [mobile]
const page = await browser.newPage(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.evaluate(() => { const el = document.getElementById("prescience"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 200, behavior: "instant" }); });
await page.waitForTimeout(1200);
await page.getByRole("button", { name: "Prendre l’épice" }).click();
await page.waitForTimeout(1800);
await page.screenshot({ path: out });
await page.evaluate(() => { const el = document.getElementById("desert"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 800, behavior: "instant" }); });
await page.waitForTimeout(2000);
await page.screenshot({ path: out.replace(".png", "-desert.png") });
await browser.close();
