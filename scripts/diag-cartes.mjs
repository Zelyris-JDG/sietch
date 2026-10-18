import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3100/?monde=calme", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Entrer en silence" }).click();
await page.evaluate(() => { const el = document.getElementById("prescience"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: "instant" }); });
await page.waitForTimeout(2000);
const info = await page.evaluate(() => {
  const chain = (el) => { const out = []; let n = el; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.opacity !== "1" || cs.visibility !== "visible" || cs.filter !== "none") out.push({ tag: n.tagName, cls: n.className, opacity: cs.opacity, visibility: cs.visibility, filter: cs.filter }); n = n.parentElement; } return out; };
  const t = document.querySelector(".release__t");
  const cs = getComputedStyle(t);
  return { color: cs.color, opacity: cs.opacity, chain: chain(t), toggleChain: chain(document.querySelector(".prescience__toggle")), h2: getComputedStyle(document.querySelector("#prescience-title")).opacity };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
