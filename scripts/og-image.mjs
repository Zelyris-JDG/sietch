/**
 * Image de partage (Open Graph) : le héro du monde WebGL en 1200 × 630, sans interface, écrite dans public/og.png.
 * Usage : node scripts/og-image.mjs [--url=http://127.0.0.1:3100/] [--wait=4500] [--sky=nuit]
 * Le rendu logiciel (SwiftShader) est lent : --wait laisse la caméra converger, comme dans un vrai navigateur.
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
const a = Object.fromEntries(process.argv.slice(2).map((s) => { const i = s.indexOf("="); return i < 0 ? [s.slice(2), "1"] : [s.slice(2, i), s.slice(i + 1)]; }));
const base = a.url ?? "http://127.0.0.1:3100/";
const url = base + (base.includes("?") ? "&" : "?") + `ciel=${a.sky ?? "nuit"}`;
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: "fr-FR" });
await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
// Sans interface ni paragraphe (coupé à cette hauteur) : le vaisseau, le titre et l'épigraphe.
await page.addStyleTag({ content: ".hud, .hud-nav, .hero__hint, .hero .prose, .toast { display: none !important; } .hero { padding-bottom: 48px !important; }" });
await page.waitForTimeout(Number(a.wait ?? 4500));
const buf = await page.screenshot();
await sharp(buf).png({ quality: 90, compressionLevel: 9 }).toFile("public/og.png");
await browser.close();
console.log("public/og.png écrit");
