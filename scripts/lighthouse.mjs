/**
 * Lighthouse mobile simulé (préréglage « perf », réseau et processeur modélisés) sur le Chromium de Playwright,
 * sans carte graphique (SwiftShader), en N passes : médiane et étendue de chaque métrique, élément LCP retenu.
 *
 *   node scripts/lighthouse.mjs [url] [--runs=2] [--out=docs/captures/c2-perf] [--label=avant]
 *
 * Lighthouse n'est pas une dépendance du projet : il est appelé par `pnpm dlx lighthouse@12` (cache pnpm).
 * Le serveur de production doit tourner (`pnpm build && pnpm start -p 3203`).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:3203/";
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split("=").slice(1).join("=");
const runs = Number(opt("runs", 2));
const out = opt("out", "docs/captures/c2-perf");
const label = opt("label", "mesure");
mkdirSync(out, { recursive: true });

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const root = "/opt/pw-browsers";
  if (existsSync(root)) {
    const dir = readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) return join(root, dir, "chrome-linux", "chrome");
  }
  return undefined;
}

const chrome = chromePath();
if (!chrome) { console.error("Chromium introuvable : définir CHROME_PATH."); process.exit(2); }

const flags = "--headless=new --no-sandbox --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader";
const results = [];
for (let i = 1; i <= runs; i++) {
  const file = join(out, `${label}-${i}.json`);
  const r = spawnSync("pnpm", ["dlx", "lighthouse@12", url, "--preset=perf", "--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate", "--output=json", `--output-path=${file}`, `--chrome-flags=${flags}`, "--quiet"], { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, CHROME_PATH: chrome } });
  if (r.status !== 0) { console.error(`Lighthouse a échoué (passe ${i})`); process.exit(r.status ?? 1); }
  const lhr = JSON.parse(readFileSync(file, "utf8"));
  const a = lhr.audits;
  const lcpEl = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node;
  const phases = a["largest-contentful-paint-element"]?.details?.items?.[1]?.items ?? [];
  results.push({
    perf: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    fcp: a["first-contentful-paint"].numericValue,
    lcp: a["largest-contentful-paint"].numericValue,
    tbt: a["total-blocking-time"].numericValue,
    cls: a["cumulative-layout-shift"].numericValue,
    si: a["speed-index"].numericValue,
    lcpEl: lcpEl ? `${lcpEl.nodeLabel?.slice(0, 60)} <${lcpEl.selector?.slice(0, 80)}>` : "?",
    phases: phases.map((p) => `${p.phase} ${Math.round(p.timing)} ms`).join(", "),
  });
}

const ms = (v) => `${(v / 1000).toFixed(2)} s`;
const fmt = (k) => {
  const vals = results.map((r) => r[k]).sort((x, y) => x - y);
  const med = vals[Math.floor((vals.length - 1) / 2)];
  const span = vals.length > 1 ? ` (${vals.map((v) => (k === "perf" ? v : k === "cls" ? v.toFixed(3) : k === "tbt" ? `${Math.round(v)} ms` : ms(v))).join(" / ")})` : "";
  return (k === "perf" ? `${med}` : k === "cls" ? med.toFixed(3) : k === "tbt" ? `${Math.round(med)} ms` : ms(med)) + span;
};
console.log(`\n${label} — ${url} — ${runs} passe(s), médiane (valeurs)`);
console.log(`  performance : ${fmt("perf")}`);
console.log(`  FCP         : ${fmt("fcp")}`);
console.log(`  LCP         : ${fmt("lcp")}`);
console.log(`  TBT         : ${fmt("tbt")}`);
console.log(`  CLS         : ${fmt("cls")}`);
console.log(`  Speed Index : ${fmt("si")}`);
console.log(`  élément LCP : ${results[0].lcpEl}`);
console.log(`  phases LCP  : ${results[0].phases}`);
