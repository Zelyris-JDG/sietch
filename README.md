# Sietch — Le Refuge des fans

Site de fan **non officiel** de l'univers de Dune, conçu par [Zelyris](https://zelyris.fr) comme deuxième exemple de la gamme Opus. Une page principale, la **descente** (orbite → désert → Sietch), plus `/lexique` et `/mentions-legales`.

Mémoire du projet : `CLAUDE.md` (règles, méthode de travail) et `docs/BIBLE.md` (vision, direction artistique, décisions, hypothèses, journal). Faits vérifiés : `docs/sources.md`. Images à générer : `docs/medias.md`.

## Lancer

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start -p 3100
```

Paramètres d'adresse utiles pour tester : `?ciel=jour|crepuscule|nuit` (ciel réel forcé), `?monde=calme` (version sans WebGL), `?rail=0` (page sans défilement fluide, diagnostic).

## Vérifier

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
BASE_URL=http://127.0.0.1:3100 pnpm test:e2e      # Playwright (serveur de production lancé à part)
node scripts/captures.mjs --label=<nom>           # captures bureau + mobile dans docs/captures/<nom>/
```

## Structure

- `app/` — mise en page, page principale, lexique, mentions légales, polices (`app/fonts.ts`, SIL OFL dans `src/fonts/`).
- `components/experience/` — rail de défilement (Lenis + GSAP ScrollTrigger), console d'altitude, intro, prescience, message du ver, pied de page.
- `components/world/` et `src/world/` — monde WebGL three.js (chargé à la demande) et sa version calme.
- `components/sietch/` — console Mentat : films, livres, jeu, réseaux, carte d'Arrakis, chronologie.
- `src/content/` — tous les textes et données (écrits pour ce site) ; `src/lib/` — état, son, préférences.
