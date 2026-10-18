import { chromium } from "@playwright/test";
const out = process.argv[2] ?? "/tmp/clavier";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
await page.keyboard.press("Tab"); // premier bouton de l'intro déjà focalisé ; Entrée en silence
await page.keyboard.press("Enter");
await page.waitForTimeout(600);
const seq = [];
for (let i = 0; i < 14; i++) {
  await page.keyboard.press("Tab");
  seq.push(await page.evaluate(() => { const a = document.activeElement; return `${a.tagName.toLowerCase()}${a.className ? "." + String(a.className).split(" ")[0] : ""} « ${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 36)} »`; }));
  if (i === 5) await page.screenshot({ path: `${out}-1.png` });
}
console.log(seq.join("\n"));
await page.screenshot({ path: `${out}-2.png` });
await browser.close();
