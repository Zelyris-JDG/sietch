/** Capture à une position précise : node scripts/shot-at.mjs --y=0.1 --out=/tmp/x.png [--w=1440 --h=900] (y = fraction de la hauteur de page) */
import { chromium } from "@playwright/test";
const a = Object.fromEntries(process.argv.slice(2).map((s) => s.replace(/^--/, "").split("=")));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: +(a.w ?? 1440), height: +(a.h ?? 900) } });
await page.goto(a.url ?? "http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.waitForTimeout(800);
const ys = String(a.y ?? "0").split(",");
for (const [i, y] of ys.entries()) {
  await page.evaluate((f) => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * f, behavior: "instant" }), +y);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: (a.out ?? "/tmp/shot").replace(/\.png$/, "") + `-${i}.png` });
}
await browser.close();
