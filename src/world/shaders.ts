/** Nuanceurs (GLSL) du monde : bruit partagé, planète, ciel, dunes, particules. Tout est procédural. */

export const NOISE = /* glsl */ `
  float hash13(vec3 p) { p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise3(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise3(p); p = p * 2.03 + 11.3; a *= 0.5; } return s; }
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float noise2(vec2 x) { vec2 i = floor(x); vec2 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1,0)), f.x), mix(hash12(i + vec2(0,1)), hash12(i + vec2(1,1)), f.x), f.y); }
  float fbm2(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise2(p); p = p * 2.02 + 7.1; a *= 0.5; } return s; }
`;

export const PLANET_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vP; varying vec3 vW;
  void main() {
    vN = normalize(normalMatrix * normal);
    vP = normalize(position);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export const PLANET_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir; uniform float uTime; uniform float uHaze;
  varying vec3 vN; varying vec3 vP; varying vec3 vW;
  ${NOISE}
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vW);
    float n1 = fbm3(vP * 3.0 + 1.7);
    float n2 = fbm3(vP * 9.0 + 4.2);
    float n3 = fbm3(vP * 22.0);
    vec3 sand = mix(vec3(0.70, 0.49, 0.26), vec3(0.88, 0.72, 0.46), n1);
    sand = mix(sand, vec3(0.30, 0.21, 0.14), smoothstep(0.58, 0.80, n2) * 0.65);
    sand *= 0.92 + 0.08 * sin(vP.y * 38.0 + n1 * 6.0 + n3 * 2.0);
    float cap = smoothstep(0.78, 0.90, abs(vP.y) + (n2 - 0.5) * 0.08);
    vec3 col = mix(sand, vec3(0.90, 0.88, 0.84), cap);
    float d = dot(n, normalize(uSunDir));
    float term = smoothstep(-0.12, 0.22, d);
    float lit = 0.55 + 0.45 * max(d, 0.0);
    col = col * (0.05 + 0.95 * term) * lit;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.2);
    col += vec3(0.95, 0.56, 0.26) * fres * (0.25 + 0.75 * term) * 0.9;
    col = mix(col, vec3(0.86, 0.62, 0.36), uHaze * 0.6);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const HALO_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vW;
  void main() { vN = normalize(normalMatrix * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;
export const HALO_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir; uniform float uStrength;
  varying vec3 vN; varying vec3 vW;
  void main() {
    vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vW);
    float rim = pow(1.0 - abs(dot(n, v)), 2.2);
    float lit = 0.35 + 0.65 * smoothstep(-0.3, 0.3, dot(n, normalize(uSunDir)));
    gl_FragColor = vec4(vec3(0.98, 0.62, 0.30) * rim * lit * uStrength, rim * lit * uStrength);
  }
`;

export const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() { vDir = normalize(position); vec4 w = modelMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * viewMatrix * w; gl_Position.z = gl_Position.w; }
`;
export const SKY_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir; uniform vec3 uW; /* jour, crépuscule, nuit */ uniform float uTime; uniform float uDust;
  varying vec3 vDir;
  ${NOISE}
  float disc(vec3 d, vec3 c, float r, float soft) { float a = acos(clamp(dot(d, c), -1.0, 1.0)); return 1.0 - smoothstep(r - soft, r + soft, a); }
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -1.0, 1.0);
    float hz = pow(1.0 - clamp(h, 0.0, 1.0), 3.0);
    vec3 day = mix(vec3(0.46, 0.40, 0.33), vec3(0.93, 0.80, 0.60), hz);
    vec3 dusk = mix(vec3(0.10, 0.07, 0.16), vec3(0.93, 0.47, 0.18), hz);
    dusk = mix(dusk, vec3(0.98, 0.72, 0.44), pow(hz, 4.0) * 0.6);
    vec3 night = mix(vec3(0.012, 0.016, 0.040), vec3(0.08, 0.10, 0.19), hz);
    vec3 col = day * uW.x + dusk * uW.y + night * uW.z;
    vec3 s = normalize(uSunDir);
    float sun = disc(d, s, 0.035, 0.012) + 0.35 * pow(max(dot(d, s), 0.0), 60.0) + 0.12 * pow(max(dot(d, s), 0.0), 8.0);
    col += vec3(1.0, 0.93, 0.80) * sun * (uW.x * 1.4 + uW.y * 0.9);
    /* nuit : deux lunes */
    vec3 m1 = normalize(vec3(0.42, 0.40, -0.80)); vec3 m2 = normalize(vec3(-0.28, 0.52, -0.80));
    float l1 = disc(d, m1, 0.055, 0.004); float l2 = disc(d, m2, 0.026, 0.003);
    /* assombrissement du limbe : plus doux vers le bord */
    float a1 = acos(clamp(dot(d, m1), -1.0, 1.0)) / 0.055;
    float sh1 = 1.0 - 0.38 * smoothstep(0.55, 1.0, a1) - 0.25 * smoothstep(0.0, 1.0, (d.x - m1.x) * 6.0);
    col += (vec3(0.93, 0.89, 0.80) * l1 * sh1 + vec3(0.80, 0.76, 0.70) * l2 + vec3(0.6, 0.65, 0.9) * 0.08 * pow(max(dot(d, m1), 0.0), 40.0)) * uW.z;
    /* étoiles fines la nuit et au crépuscule */
    float st = step(0.9975, hash12(floor(d.xz * 900.0 + d.y * 300.0))) * smoothstep(0.0, 0.25, h);
    col += vec3(0.9) * st * (uW.z + 0.3 * uW.y) * (0.6 + 0.4 * sin(uTime * 2.0 + d.x * 90.0));
    /* poussière en suspension à l'horizon */
    col = mix(col, vec3(0.78, 0.55, 0.32), uDust * hz * 0.8);
    col += (hash12(d.xy * 500.0 + uTime) - 0.5) * 0.012;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Fonction des dunes, partagée entre le sol et les particules de vent. */
export const DUNE_FN = /* glsl */ `
  uniform float uTime; uniform float uWorm; uniform vec2 uWormPos;
  float duneBase(vec2 p) {
    /* grandes dunes longitudinales, crêtes vives, un second train oblique plus petit */
    vec2 q = p * 0.011;
    float bend = 0.55 * sin(q.y * 1.9 + 0.7) + (fbm2(q * 0.6) - 0.5) * 1.6;
    float ridge = 1.0 - abs(sin(q.x * 3.14159 + bend));
    ridge = pow(ridge, 1.6);
    float h = ridge * 34.0;
    vec2 q2 = vec2(p.x * 0.6 + p.y * 0.8, p.y * 0.6 - p.x * 0.8) * 0.02;
    float ridge2 = pow(1.0 - abs(sin(q2.x * 3.14159 + (fbm2(q2) - 0.5) * 2.0)), 2.0);
    h += ridge2 * 9.0;
    h += (fbm2(p * 0.02 + 3.0) - 0.5) * 10.0;
    h += (fbm2(p * 0.09) - 0.5) * 1.8;
    return h;
  }
  float duneH(vec2 p) {
    float h = duneBase(p);
    /* rides du vent, lentes */
    h += (noise2(p * 0.45 + vec2(uTime * 0.05, 0.0)) - 0.5) * 0.35;
    /* le ver : une bosse qui avance, des ondes concentriques, jamais la créature */
    float dist = length(p - uWormPos);
    float bulge = exp(-pow(dist / 24.0, 2.0)) * (6.5 + 1.2 * sin(uTime * 6.0 + p.x * 0.4)) * uWorm;
    float ripple = sin(dist * 0.42 - uTime * 7.0) * exp(-dist / 48.0) * 0.9 * uWorm;
    float tremor = (noise2(p * 0.8 + uTime * 3.0) - 0.5) * 0.5 * uWorm * uWorm;
    return h + bulge + ripple + tremor;
  }
`;

export const DUNE_VERT = /* glsl */ `
  uniform vec3 uSunDir;
  varying vec3 vN; varying vec3 vW; varying float vH;
  ${NOISE}
  ${DUNE_FN}
  #include <fog_pars_vertex>
  void main() {
    vec3 p = position;
    vec2 xz = (modelMatrix * vec4(p, 1.0)).xz;
    float h = duneH(xz);
    float e = 1.2;
    float hx = duneH(xz + vec2(e, 0.0));
    float hz = duneH(xz + vec2(0.0, e));
    vN = normalize(vec3(h - hx, e, h - hz));
    vH = h;
    vec4 w = modelMatrix * vec4(p.x, p.y, p.z + h, 1.0);
    vW = w.xyz;
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const DUNE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir; uniform vec3 uW; uniform float uFade; uniform float uTime;
  varying vec3 vN; varying vec3 vW; varying float vH;
  ${NOISE}
  #include <fog_pars_fragment>
  void main() {
    vec3 n = normalize(vN);
    vec3 s = normalize(uSunDir);
    float ndl = clamp(dot(n, s) * 0.7 + 0.3, 0.0, 1.0);
    ndl = pow(ndl, 1.6);
    float up = clamp(n.y, 0.0, 1.0);
    vec3 lit = vec3(0.96, 0.76, 0.48) * uW.x + vec3(0.98, 0.60, 0.30) * uW.y + vec3(0.34, 0.37, 0.52) * uW.z;
    vec3 shade = vec3(0.30, 0.18, 0.10) * uW.x + vec3(0.18, 0.10, 0.08) * uW.y + vec3(0.04, 0.05, 0.09) * uW.z;
    float grain = fbm2(vW.xz * 1.7) * 0.10 - 0.05;
    vec3 col = mix(shade, lit, ndl) + grain;
    /* reflet rasant côté soleil */
    vec3 v = normalize(cameraPosition - vW);
    float sheen = pow(max(dot(reflect(-s, n), v), 0.0), 18.0) * 0.18 * (uW.x + uW.y);
    col += sheen * lit;
    /* crêtes : arête lumineuse quand la pente change vite */
    float crest = smoothstep(0.6, 1.0, 1.0 - up) * 0.25;
    col += crest * lit * 0.6;
    /* sable soulevé sur les crêtes au vent : voile clair */
    float veil = smoothstep(0.75, 1.0, noise2(vW.xz * 0.08 + vec2(uTime * 0.35, 0.0))) * (1.0 - up) * 0.35;
    col = mix(col, lit * 1.1, veil);
    col *= uFade;
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`;

export const PARTICLE_VERT = /* glsl */ `
  attribute float aSeed; attribute float aSize;
  uniform float uTime; uniform float uAlpha; uniform float uSpeed; uniform vec3 uDir; uniform float uSpan; uniform float uPixelRatio;
  varying float vA;
  void main() {
    vec3 p = position;
    float t = uTime * uSpeed * (0.6 + aSeed * 0.8);
    p += uDir * mod(t + aSeed * uSpan, uSpan);
    p.x += sin(uTime * 0.7 + aSeed * 40.0) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_PointSize = aSize * uPixelRatio * clamp(60.0 / depth, 0.4, 6.0);
    vA = uAlpha * smoothstep(0.0, 8.0, depth) * (0.35 + 0.65 * aSeed);
    gl_Position = projectionMatrix * mv;
  }
`;
export const PARTICLE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    float a = (1.0 - smoothstep(0.3, 1.0, d)) * vA;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Particules posées sur les dunes (sable arraché aux crêtes). */
export const WIND_VERT = /* glsl */ `
  attribute float aSeed; attribute float aSize;
  uniform float uAlpha; uniform float uPixelRatio; uniform vec3 uOrigin;
  varying float vA;
  ${NOISE}
  ${DUNE_FN}
  void main() {
    vec2 xz = position.xz + uOrigin.xz;
    float drift = mod(uTime * (9.0 + aSeed * 7.0) + aSeed * 140.0, 140.0);
    xz.x += drift;
    float h = duneH(xz);
    vec3 w = vec3(xz.x, h + 0.4 + aSeed * 2.2 + sin(uTime * 3.0 + aSeed * 50.0) * 0.4, xz.y);
    vec4 mv = viewMatrix * vec4(w, 1.0);
    float depth = -mv.z;
    gl_PointSize = aSize * uPixelRatio * clamp(40.0 / depth, 0.3, 4.0);
    float life = sin(drift / 140.0 * 3.14159);
    vA = uAlpha * life * smoothstep(0.0, 6.0, depth) * smoothstep(260.0, 80.0, depth);
    gl_Position = projectionMatrix * mv;
  }
`;

/** Coque du long-courrier. La normale est portée en espace MONDE (et non en espace vue) : les deux lumières du
 *  nuanceur — rasante chaude côté planète, froide à l'opposé — restent fixes par rapport au vaisseau quand la caméra
 *  tourne, et le volume du fuseau se lit. Aucune mise à l'échelle sur ce maillage : mat3(modelMatrix) suffit. */
export const HULL_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vW; varying vec3 vL;
  void main() { vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vL = position; gl_Position = projectionMatrix * viewMatrix * w; }
`;
export const HULL_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir; uniform vec3 uShineDir; uniform float uTime;
  varying vec3 vN; varying vec3 vW; varying vec3 vL;
  ${NOISE}
  void main() {
    vec3 n = normalize(vN);
    /* coordonnées cylindriques du fuseau : le long de l'axe (y local du tour) et autour */
    float along = vL.y;
    float ang = atan(vL.z, vL.x);
    /* Hiérarchie des panneaux : grands (rares, certains plus sombres), moyens (fréquents), joints fins. Les lignes
       de joints sont d'autant plus fines que le panneau est petit : l'œil lit d'abord les grandes tôles. */
    vec2 gBig = vec2(floor(along / 26.0), floor(ang / 0.7854));
    float idBig = hash12(gBig + 3.0);
    float seamBig = min(abs(fract(along / 26.0) - 0.5) * 2.0, abs(fract(ang / 0.7854) - 0.5) * 2.0);
    float grooveBig = smoothstep(0.0, 0.045, seamBig);
    vec2 gMid = vec2(floor(along / 6.5), floor(ang / 0.2618));
    float idMid = hash12(gMid);
    float seamMid = min(abs(fract(along / 6.5) - 0.5) * 2.0, abs(fract(ang / 0.2618) - 0.5) * 2.0);
    float grooveMid = smoothstep(0.0, 0.05, seamMid);
    float fine = smoothstep(0.0, 0.07, abs(fract(along / 1.625) - 0.5) * 2.0);
    float dark = step(0.76, idBig);
    vec3 base = vec3(0.36, 0.30, 0.25) * (0.84 + 0.32 * idMid);
    base = mix(base, base * 0.5, dark);
    base *= (0.3 + 0.7 * grooveBig) * (0.62 + 0.38 * grooveMid) * (0.92 + 0.08 * fine);
    base += (fbm2(vL.xy * 0.35) - 0.5) * 0.05;
    /* deux longerons peints sombres, de la proue à la poupe */
    float spar = smoothstep(0.03, 0.06, abs(fract(ang / 3.14159 + 0.37) - 0.5));
    base *= 0.72 + 0.28 * spar;
    vec3 s = normalize(uSunDir);
    float ndl = max(dot(n, s), 0.0);
    float shine = max(dot(n, normalize(uShineDir)), 0.0);
    vec3 v = normalize(cameraPosition - vW);
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 col = base * (0.07 + 0.95 * ndl) * vec3(0.80, 0.87, 1.0);
    col += base * pow(shine, 1.3) * vec3(1.0, 0.58, 0.25) * 2.0;
    col += rim * base * vec3(0.95, 0.62, 0.30) * 0.6;
    /* reflet métallique fin côté planète, coupé par les joints */
    vec3 hv = normalize(normalize(uShineDir) + v);
    col += pow(max(dot(n, hv), 0.0), 36.0) * vec3(1.0, 0.72, 0.42) * 0.22 * grooveMid;
    /* hublots : rares, centrés sur un panneau moyen, battement lent */
    float cell = step(0.35, fract(along / 6.5)) * step(fract(along / 6.5), 0.65) * step(0.3, fract(ang / 0.2618)) * step(fract(ang / 0.2618), 0.7);
    float win = step(0.962, hash12(gMid * 7.7 + 0.2)) * grooveMid * cell;
    col += vec3(0.98, 0.74, 0.32) * win * (1.1 + 0.5 * sin(uTime * 0.9 + idMid * 40.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Feux de position : disques ronds et doux (jamais les carrés du PointsMaterial), halo, clignotement propre à chaque
 *  feu — un quart d'entre eux sont des éclats brefs, les autres un battement lent. Couleurs par sommet (aColor). */
export const LIGHT_VERT = /* glsl */ `
  attribute float aSeed; attribute float aSize; attribute vec3 aColor;
  uniform float uTime; uniform float uPixelRatio; uniform float uFade;
  varying vec3 vC; varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = max(-mv.z, 1.0);
    float ph = uTime * (0.5 + aSeed * 1.3) + aSeed * 50.0;
    float strobe = step(0.75, aSeed);
    float flash = pow(max(sin(ph * 3.14159), 0.0), 28.0);
    float steady = 0.72 + 0.28 * sin(ph * 2.0);
    float k = mix(steady, 0.06 + flash, strobe);
    vA = k * uFade;
    vC = aColor;
    gl_PointSize = aSize * uPixelRatio * clamp(220.0 / depth, 1.6, 12.0) * (0.75 + 0.25 * k);
    gl_Position = projectionMatrix * mv;
  }
`;
export const LIGHT_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vC; varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r2 = dot(c, c) * 4.0;
    float core = 1.0 - smoothstep(0.0, 0.14, r2);
    float halo = 1.0 - smoothstep(0.08, 1.0, r2);
    halo *= halo;
    float a = (core + 0.32 * halo) * vA;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vC * (0.55 + 0.6 * core) + vec3(0.38) * core, a);
  }
`;

/** Lueur de la bouche de la soute : un disque additif, cœur doux et anneau de lampes au bord. */
export const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const GLOW_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor; uniform float uAlpha; uniform float uRing;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    float core = 1.0 - smoothstep(0.0, 1.0, r);
    core *= core;
    float ring = exp(-pow((r - 0.86) / 0.07, 2.0));
    float a = (core * 0.5 + ring * uRing) * uAlpha * smoothstep(1.0, 0.95, r);
    gl_FragColor = vec4(uColor * a, a);
  }
`;
