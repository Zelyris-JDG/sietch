/**
 * Mesure de contraste des textes de la descente sur le monde rendu (jour par défaut) :
 *   node scripts/diag-contraste.mjs [--url=http://127.0.0.1:3100/?ciel=jour] [--wait=4000] [--view=bureau|mobile]
 * Pour chaque bloc de texte visible à chaque arrêt, on masque le texte, on capture sa boîte, on calcule la luminance
 * moyenne du fond (voile compris) et le rapport de contraste avec la couleur du texte (sans compter le halo :
 * mesure prudente). Seuils WCAG : 4,5 (texte courant), 3 (grand texte ≥ 24 px ou ≥ 19 px gras).
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";

const args = Object.fromEntries(process.argv.slice(2).map((s) => { const i = s.indexOf("="); return [s.slice(2, i), s.slice(i + 1)]; }));
const url = args.url ?? "http://127.0.0.1:3100/?ciel=jour";
const wait = Number(args.wait ?? 4000);
const views = [
  { name: "bureau", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
].filter((v) => !args.view || v.name === args.view);
const stops = ["orbite", "entree", "desert", "epice"];
const SEL = ".hero .scene__index, .hero .epigraph p, .hero .prose p, .hero .monument, .hero__hint, .scene__sticky .scene__index, .scene__sticky .epigraph p, .scene__sticky .prose p, .scene__sticky .monument, .scene__sticky .aside, .epigraph cite";

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const parse = (css) => css.match(/[\d.]+/g).slice(0, 3).map(Number);

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let worst = Infinity;
const rows = [];
for (const v of views) {
  const ctx = await browser.newContext({ viewport: v.viewport, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor ?? 1, locale: "fr-FR" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Entrer en silence" }).click();
  await page.waitForTimeout(1200);
  for (const id of stops) {
    const el = page.locator(`#${id}`);
    const top = await el.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
    const h = await el.evaluate((n) => n.getBoundingClientRect().height);
    const target = h > v.viewport.height * 1.5 ? top + h * 0.45 : top - 40;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), target);
    await page.waitForTimeout(wait);
    const items = await page.evaluate((sel) => {
      const out = [];
      document.querySelectorAll(sel).forEach((n, i) => {
        const r = n.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
        const cs = getComputedStyle(n);
        if (cs.visibility === "hidden" || Number(cs.opacity) < 0.5) return;
        n.setAttribute("data-dc", String(i));
        out.push({ i, text: (n.textContent || "").trim().slice(0, 40), color: cs.color, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(innerWidth, r.right) - Math.max(0, r.left), h: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) });
      });
      return out;
    }, SEL);
    for (const it of items) {
      await page.evaluate((i) => { const n = document.querySelector(`[data-dc="${i}"]`); n.style.visibility = "hidden"; }, it.i);
      const buf = await page.screenshot({ clip: { x: it.x, y: it.y, width: Math.max(1, it.w), height: Math.max(1, it.h) } });
      await page.evaluate((i) => { const n = document.querySelector(`[data-dc="${i}"]`); n.style.visibility = ""; }, it.i);
      const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      let sum = 0, n = 0;
      for (let p = 0; p < data.length; p += info.channels) { sum += lum(data[p], data[p + 1], data[p + 2]); n++; }
      const bg = sum / n;
      const [r, g, b] = parse(it.color);
      const fg = lum(r, g, b);
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
      const need = large ? 3 : 4.5;
      worst = Math.min(worst, ratio / need);
      rows.push({ vue: v.name, arret: id, texte: it.text, px: Math.round(it.size), ratio: ratio.toFixed(2), seuil: need, ok: ratio >= need ? "oui" : "NON" });
    }
  }
  await ctx.close();
}
await browser.close();
console.table(rows);
const bad = rows.filter((r) => r.ok === "NON");
console.log(bad.length ? `${bad.length} bloc(s) sous le seuil (sans compter le halo)` : "tous les blocs au-dessus du seuil");
