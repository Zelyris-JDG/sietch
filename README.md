# Sietch — Le Refuge des fans

Site de fan **non officiel** de l'univers de Dune, conçu par [Zelyris](https://zelyris.fr) comme deuxième exemple de la gamme Opus. Une page principale, la **descente** (orbite → désert → Sietch), plus `/lexique` et `/mentions-legales`.

Mémoire du projet : `CLAUDE.md` (règles, méthode de travail) et `docs/BIBLE.md` (vision, direction artistique, décisions, hypothèses, journal). Faits vérifiés : `docs/sources.md`. Images à déposer : `docs/medias.md` (les douze emplacements sont branchés : un fichier déposé dans `public/images/` sous le nom prévu s'affiche, puis `pnpm medias`). Mise en ligne : `docs/MISE-EN-LIGNE.md` (checklist, rien n'est fait sans le « mets en ligne » de Johan).

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
BASE_URL=http://127.0.0.1:3100 pnpm test:e2e      # Playwright, bureau + téléphone (serveur de production lancé à part) ; ver à la molette (bureau) et au doigt (téléphone)
node scripts/captures.mjs --label=<nom> --wait=4000   # captures bureau + mobile dans docs/captures/<nom>/ (--only=desert,epice --view=bureau)
node scripts/diag-contraste.mjs --url="http://127.0.0.1:3100/?ciel=jour"   # contraste des textes sur le monde rendu (sans le halo)
node scripts/diag-ver-tremble.mjs <sortie.png>      # le monde reste en place pendant le tremblement du ver
node scripts/diag-intro.mjs                         # pas d'éclair de l'intro au retour d'une page
node scripts/diag-lcp.mjs                           # LCP réel dans Chromium (processeur ralenti × 4)
node scripts/lighthouse.mjs http://127.0.0.1:3100/ --runs=2 --label=x   # Lighthouse mobile simulé (médiane de N passes, élément et phases du LCP)
node scripts/shot-hero.mjs --label=x --tier=high    # captures du héro (soute → sortie) bureau + téléphone, niveau de qualité complet
pnpm medias                                         # état des douze emplacements d'images, conversion WebP/AVIF, marche à suivre
```

## Structure

- `app/` — mise en page, page principale, lexique, mentions légales, polices (`app/fonts.ts`, SIL OFL dans `src/fonts/`).
- `components/experience/` — rail de défilement (Lenis + GSAP ScrollTrigger), console d'altitude, intro, prescience, message du ver, pied de page.
- `components/world/` et `src/world/` — monde WebGL three.js (chargé à la demande) et sa version calme.
- `components/sietch/` — console Mentat : films, livres, jeu, réseaux, carte d'Arrakis, chronologie.
- `src/content/` — tous les textes et données (écrits pour ce site) ; `src/lib/` — état, son, préférences.
