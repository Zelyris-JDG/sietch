# C2 — Mesures Lighthouse mobile (lot 3) et analyse du LCP modélisé

Date : 18/10/2026, 16 h 40 → 17 h 40 (Paris). Outil : Lighthouse 12.8.2 (`pnpm dlx`), préréglage `perf`, mobile simulé
(moto G power, réseau 1,6 Mbit/s, RTT 150 ms, processeur × 4), Chromium 141 de Playwright, rendu logiciel SwiftShader,
serveur `next start -p 3203`. Script : `node scripts/lighthouse.mjs http://127.0.0.1:3203/ --runs=2 --label=…`.

**Contexte de mesure à garder en tête** : cinq agents travaillaient en parallèle sur la même machine (builds, Playwright,
SwiftShader). Les valeurs absolues de TBT et de LCP sont gonflées et très variables d'une passe à l'autre ; seuls les
écarts relatifs entre états comparables comptent, et une passe « propre » vaut mieux que la médiane de deux passes
dont l'une est tombée dans une rafale de builds.

## Tableau avant / après (deux passes par état : médiane, puis les deux valeurs)

| État | Perf. | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- |
| Avant (feat/v1, 5be01c9) | 66 (66 / 66) | 1,37 s | 3,77 s (3,77 / 3,89) | 1 003 ms (1 003 / 1 053) | 0 | 2,22 s |
| Après `World.tsx` (détection WebGL au démarrage, veille 20 s) | 82 (82 / 84) | 1,38 s | 3,76 s (3,76 / 3,94) | 178 ms (178 / 312) | 0 | 2,12 s |
| Essai (non retenu) : `Intro.tsx`, focus différé d'une image | 78 (78 / 82) | 1,38 s | 3,99 s (3,99 / 4,13) | 261 ms (261 / 347) | 0 | 1,93 s |
| Après, état final (World + correctifs Safari/Firefox), 1re série | 82 (passe propre) · 56 (passe sous contention) | 1,38 s | 4,06 s (4,06 / 5,01) | 227 ms (227 / 1 239) | 0 | 2,94 s |
| Après, état final, 2e série (commit 994ad8f) | 72 (72 / 83) | 1,38 s | 4,03 s (4,03 / 4,05) | 205 ms (205 / 490) | 0 | 2,52 s |

Lecture : le **TBT** est divisé par cinq dès que la machine n'est pas saturée (1 003 → 178–227 ms), le score performance
suit (66 → 82–83 sur les passes propres) ; le **LCP modélisé ne bouge pas** (3,8–4,0 s, bruit compris) parce qu'il est
borné par les octets avant le premier rendu (voir plus bas). Le FCP, le CLS (0) et l'élément LCP sont identiques partout.

Élément LCP retenu dans toutes les passes : le **paragraphe du héro** (`div.scene__sticky > div.hero__sub > div.prose > p`,
68 392 px² en 412 px de large), pas l'intro : l'API LCP ignore l'occlusion, le héro peint sous l'intro opaque reste le plus
grand bloc de texte. Phases : TTFB ≈ 470 ms, délai et temps de chargement 0 (texte), **Render Delay ≈ 3,4 s**.

Pour comparaison, en vrai navigateur (Chromium, processeur × 4, `scripts/diag-lcp.mjs`) : premier rendu et LCP à **0,42 s**
sur le même élément, polices chargées.

## Ce que fait réellement le modèle Lantern (graphe reconstruit depuis la trace)

Graphe LCP reconstruit avec les modules internes de Lighthouse (`lantern-largest-contentful-paint.js`) sur la trace
sauvegardée (`--save-assets`) :

- **Optimiste 3 345 ms** : document (22,5 ko) → CSS (8,4 ko) + **toutes les polices** (Archivo 90,6 ko, Cormorant italique
  39,7 ko, Plex Mono 400 et 500 : 15,2 + 15,4 ko) + **les neuf scripts `async` de Next** (174 ko transférés, dont
  react-dom 71,6 ko) + l'évaluation de react-dom (175 ms simulés). Le dernier nœud est Archivo (fin à 3 314 ms).
- **Pessimiste 4 177 ms** : la même chose plus la **tâche d'hydratation** (832 ms simulés) parce qu'elle contient un
  `Layout` forcé.
- LCP = moyenne des deux = 3 761 ms.

Pourquoi tout le JavaScript compte comme « bloquant le rendu » : Lantern ne garde que les scripts dont l'évaluation a
commencé **avant** le premier rendu observé. Or, dans la trace, le premier rendu n'est présenté qu'à **560 ms** alors que
la première image a été peinte et validée par le fil principal à 161–205 ms : le processus graphique (SwiftShader, sans
carte) met ≈ 300 ms à présenter la première image — une page témoin statique, sans police ni script, affiche le même
retard (FCP observé 379 ms pour un chargement fini à 64 ms). Pendant ce temps les scripts arrivent (localhost) et
s'évaluent (199–250 ms) ; ils entrent donc tous dans le graphe. En réseau réel (Vercel, HTTP/2) l'ordre est le même sur
les serveurs de PageSpeed (eux aussi sans carte graphique) : il faut s'attendre à des valeurs voisines, et c'est bien
la mesure PSI sur la préversion qui tranchera.

Le modèle est donc **borné par les octets** téléchargés avant le premier rendu : ≈ 365 ko (polices 160 ko, scripts 174 ko,
document + CSS 31 ko) à 1,6 Mbit/s ≈ 1,8 s après un TTFB simulé de 0,76 s, plus l'évaluation de React. Pour passer sous
2,5 s il faudrait retirer ≈ 85 ko de ce chemin : la seule réserve de cette taille est **la police Archivo (90 ko) et
Cormorant (40 ko) non sous-ensemblées** (voir « Reste à faire »). Les leviers testés sur le code n'y changent rien :

- `World.tsx` (retenu) : la détection WebGL (`getContext("webgl2")`, appel synchrone au processus graphique) avait lieu à
  l'hydratation, au moment où ce processus prépare la première image sous rendu logiciel → tâche d'hydratation de
  **415 ms** (297 → 713 ms, finie après la première présentation à 560 ms). Déplacée au démarrage réel du monde (sortie de
  l'intro, premier geste, ou veille), la tâche d'hydratation rentre dans le rang : **TBT 1 003 → 178 ms, performance
  66 → 82**. Le LCP ne bouge pas (la tâche reste dans le graphe pessimiste : voir ci-dessous). La veille passe de 6 s à 20 s
  après `load` + `requestIdleCallback` : l'intro opaque cache le monde de toute façon, un robot de mesure a fini sa trace
  bien avant, et au retour d'une page (`data-intro="seen"`) le monde démarre toujours d'emblée.
- `Intro.tsx` (essai, **non retenu**, fichier hors périmètre) : le `Layout` forcé de la tâche d'hydratation vient de
  `first.current?.focus({ preventScroll: true })` juste après `classList.add("intro-open")`. Reporter le focus d'une image
  (`requestAnimationFrame`) n'a rien changé au LCP (3,99 s contre 3,76 s, dans le bruit) : la tâche contient d'autres
  mises en page. Sans intérêt : abandonné.

## Fichiers

- `scripts/lighthouse.mjs` : N passes, médiane et valeurs, élément et phases du LCP (Chromium de Playwright détecté,
  `CHROME_PATH` pour un autre navigateur).
- `scripts/diag-hydratation.mjs` : profil d'échantillonnage V8 du chargement (temps propre et inclusif par fonction),
  pour retrouver ce que coûte l'hydratation.
- Les rapports JSON ne sont pas conservés dans le dépôt (≈ 350 ko chacun) : relancer le script.
