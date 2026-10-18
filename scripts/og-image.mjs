/** Image de partage : le héro (monde WebGL) en 1200 × 630, écrite dans public/og.png. */
import { chromium } from "@playwright/test";
import sharp from "sharp";
const url = process.argv[2] ?? "http://127.0.0.1:3100/";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.waitForTimeout(2500);
await page.addStyleTag({ content: ".hud, .hud-nav, .hero__hint { display: none !important; }" });
await page.waitForTimeout(300);
const buf = await page.screenshot();
await sharp(buf).png({ quality: 90, compressionLevel: 9 }).toFile("public/og.png");
await browser.close();
console.log("public/og.png écrit");
