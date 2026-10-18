/** Capture d'une section : node scripts/shot-el.mjs --id=prescience --out=/tmp/x.png [--url=...] [--offset=-40] */
import { chromium } from "@playwright/test";
const a = Object.fromEntries(process.argv.slice(2).map((s) => s.replace(/^--/, "").split("=")));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: +(a.w ?? 1440), height: +(a.h ?? 900) } });
await page.goto(a.url ?? "http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.waitForTimeout(600);
await page.evaluate(({ id, offset }) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "instant" }); }, { id: a.id ?? "prescience", offset: +(a.offset ?? -40) });
await page.waitForTimeout(2000);
await page.screenshot({ path: a.out ?? "/tmp/shot.png" });
await browser.close();
