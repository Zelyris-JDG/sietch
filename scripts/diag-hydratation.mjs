// Profil d'échantillonnage V8 pendant le chargement : temps propre par fonction (fichier:ligne), sans ralentissement.
import { chromium } from "@playwright/test";
const url = process.argv[2] ?? "http://127.0.0.1:3203/";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Profiler.start");
const t = Date.now();
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(2500);
const { profile } = await cdp.send("Profiler.stop");
console.log("durée observée", Date.now() - t, "ms");
const self = new Map();
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const dt = profile.timeDeltas; const samples = profile.samples;
const keyOf = (n) => `${n.callFrame.functionName || "(anon)"} ${n.callFrame.url.replace("http://127.0.0.1:3203", "").split("/").pop()}:${n.callFrame.lineNumber}:${n.callFrame.columnNumber}`;
for (let i = 0; i < samples.length; i++) {
  const n = byId.get(samples[i]);
  const key = keyOf(n);
  self.set(key, (self.get(key) ?? 0) + (dt[i] ?? 0));
}
console.log("--- temps propre (top 45)");
for (const [k, v] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 45)) console.log((v / 1000).toFixed(1).padStart(7), "ms", k);
const parent = new Map(); for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const incl = new Map();
for (let i = 0; i < samples.length; i++) {
  const seen = new Set(); let id = samples[i];
  while (id) { const n = byId.get(id); const key = keyOf(n); if (!seen.has(key)) { seen.add(key); incl.set(key, (incl.get(key) ?? 0) + (dt[i] ?? 0)); } id = parent.get(id); }
}
console.log("--- temps inclusif (top 50)");
for (const [k, v] of [...incl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50)) console.log((v / 1000).toFixed(1).padStart(7), "ms", k);
await browser.close();
