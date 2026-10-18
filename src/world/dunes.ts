/**
 * Hauteur de base des dunes, calculée sur le processeur : même formule que `duneBase` du nuanceur
 * (src/world/shaders.ts, DUNE_FN), pour garder la caméra au-dessus du sable. Les deux doivent rester identiques.
 */
const fract = (x: number): number => x - Math.floor(x);

function hash12(x: number, y: number): number {
  let px = fract(x * 0.1031), py = fract(y * 0.1031), pz = fract(x * 0.1031);
  const d = px * (py + 33.33) + py * (pz + 33.33) + pz * (px + 33.33);
  px += d; py += d; pz += d;
  return fract((px + py) * pz);
}

function noise2(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash12(ix, iy), b = hash12(ix + 1, iy), c = hash12(ix, iy + 1), d = hash12(ix + 1, iy + 1);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

function fbm2(x: number, y: number): number {
  let a = 0.5, s = 0;
  for (let i = 0; i < 4; i++) {
    s += a * noise2(x, y);
    x = x * 2.02 + 7.1;
    y = y * 2.02 + 7.1;
    a *= 0.5;
  }
  return s;
}

export function duneBase(px: number, py: number): number {
  const qx = px * 0.011, qy = py * 0.011;
  const bend = 0.55 * Math.sin(qy * 1.9 + 0.7) + (fbm2(qx * 0.6, qy * 0.6) - 0.5) * 1.6;
  let ridge = 1 - Math.abs(Math.sin(qx * 3.14159 + bend));
  ridge = Math.pow(ridge, 1.6);
  let h = ridge * 34;
  const q2x = (px * 0.6 + py * 0.8) * 0.02, q2y = (py * 0.6 - px * 0.8) * 0.02;
  const ridge2 = Math.pow(1 - Math.abs(Math.sin(q2x * 3.14159 + (fbm2(q2x, q2y) - 0.5) * 2)), 2.0);
  h += ridge2 * 9;
  h += (fbm2(px * 0.02 + 3, py * 0.02 + 3) - 0.5) * 10;
  h += (fbm2(px * 0.09, py * 0.09) - 0.5) * 1.8;
  return h;
}
