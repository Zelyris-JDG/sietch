import test from "node:test";
import assert from "node:assert/strict";
import { computeAltitude, state } from "../../src/lib/store.ts";
import { formatAltitude } from "../../src/lib/format.ts";

const base = () => ({ ...state.progress });

test("la descente commence dans la soute à 1 200 km et finit sous le roc", () => {
  const p = base();
  assert.equal(computeAltitude(p).phase, "SOUTE · LONG-COURRIER");
  assert.equal(Math.round(computeAltitude(p).altitude), 1_200_000);
  p.orbite = 1;
  assert.equal(Math.round(computeAltitude(p).altitude), 400_000);
  p.entree = 1;
  assert.equal(Math.round(computeAltitude(p).altitude), 12_000);
  p.desert = 1;
  assert.equal(computeAltitude(p).altitude, 0);
  assert.equal(computeAltitude(p).phase, "SUR LE SABLE");
  p.sietch = 1;
  assert.equal(computeAltitude(p).altitude, -80);
  assert.equal(computeAltitude(p).descent, 1);
});

test("l'altitude décroît de façon monotone le long de la descente", () => {
  let last = Infinity;
  for (let i = 0; i <= 300; i++) {
    const t = i / 100; // 0 → 3 : orbite, entrée, désert
    const p = base();
    p.orbite = Math.min(1, t);
    p.entree = Math.max(0, Math.min(1, t - 1));
    p.desert = Math.max(0, Math.min(1, t - 2));
    const a = computeAltitude(p).altitude;
    assert.ok(a <= last + 1e-6, `remontée à t=${t} : ${a} > ${last}`);
    last = a;
  }
});

test("formatage lisible", () => {
  assert.match(formatAltitude(1_200_000), /^1.200 KM$/);
  assert.equal(formatAltitude(12_000), "12,0 KM");
  assert.equal(formatAltitude(2_130), "2,13 KM");
  assert.equal(formatAltitude(640), "640 M");
  assert.equal(formatAltitude(-40), "−40 M");
});
