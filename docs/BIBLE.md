# Sietch — Bible du projet

Mémoire permanente du projet « Sietch — Refuge des fans », chargée par `CLAUDE.md`. Ajout uniquement : on ne réécrit jamais le passé. Au-delà de 250 lignes, les plus anciennes entrées du Journal partent dans `docs/JOURNAL-ARCHIVE.md`.

Chantier en cours : **C1** (18/10/2026). Prochain numéro : C2. Ateliers : A1 (le brief de ce chantier).

## Vision et public visé

- Un site de fan **non officiel** de l'univers de Dune, en français, conçu par Zelyris comme **deuxième exemple de la gamme Opus** (à partir de 7 900 €), après La Guilde. Au moins aussi travaillé que La Guilde, avec une **expérience différente** : La Guilde est une matière de grains qui s'organise ; le Sietch est une **descente** — de l'orbite d'Arrakis jusqu'au refuge sous le roc.
- Public : les fans (films, livres, jeu *Dune: Awakening*) qui veulent un endroit beau et utile — s'y retrouver dans les films, savoir par quel livre commencer, trouver les liens officiels du jeu, situer les lieux d'Arrakis, suivre les prochaines sorties.
- Deux promesses : **l'émotion** (une page principale, la « descente ») et **l'utilité** (le Sietch : films, livres, jeu, réseaux, carte, chronologie, lexique).
- 100 % original : aucun élément officiel (voir `CLAUDE.md`, règle 1). Le ver n'est jamais montré : on le sent.

## Direction artistique (validée par Johan, brief du 18/10/2026)

- Colonne vertébrale **« Brutalisme sacré »** : monumental, silence, échelle immense, très peu de texte ; petites capitales très espacées face à d'immenses paysages ; lenteur assumée.
- **Palette** : ocre `#B8742A`, sable `#D9B98A` / sable clair `#EAD8B6`, noir basalte `#0B0908`, orange épice `#E8651A`, **bleu profond** `#1E3A8A` (accent rare : prescience, yeux de l'Ibad évoqués). Texte sur basalte : sable clair (≥ 4,5:1).
- **« Console Mentat »** pour la partie utile (le Sietch) : interface tactique, lignes fines, données lisibles, **ambre `#F2B544` sur noir**, monospace.
- **« Archives de l'Imperium »** : chaque grande section s'ouvre sur une **épigraphe originale** en serif éditorial grande taille, signée « — Carnets du Sietch ».
- **Typographie (SIL OFL, auto-hébergée, `src/fonts/`)** : *Archivo* (variable, largeur 62–125 %) pour les capitales monumentales très espacées ; *Cormorant Garamond* (variable, romain + italique) pour les épigraphes ; *IBM Plex Mono* pour la console et le compteur d'altitude. Aucune n'imite le logo des films.
- Lumière : rasante, brume, grain fin ; aucun néon ; le bleu n'apparaît qu'en prescience et dans la nuit aux deux lunes.
- Interdits : logo/lettrage officiel, images/sons/vidéos officiels, personnages, designs signatures des films / série / jeu, citations longues, musique des films, modèles 3D récupérés, phrase présentée comme officielle.

## Narration : le plan « Descente » (une page, le défilement = la descente)

0. Intro : noir, souffle, invitation à activer le son (désactivé par défaut).
1. Accueil signature : le **long-courrier** (vaisseau de la Guilde, design original : un fuseau-anneau procédural, jamais la forme des films, de la série ou du jeu) en orbite au-dessus d'Arrakis, vu en contre-plongée ; feux de position minuscules, frégates presque invisibles. Au défilement, on sort de la soute à bord d'une frégate ; le vaisseau s'éloigne, Arrakis grandit, un **compteur d'altitude** suit toute la descente.
2. Orbite et entrée atmosphérique : planète de sable originale (shader), puis tempête de poussière.
3. Le désert : dunes WebGL, vent sur les crêtes, **signe du ver** (sable qui ondule, vibration, grondement).
4. L'épice : particules orange, explication courte de l'univers.
5. Les Maisons et les ordres : Atréides, Harkonnen, Corrino, Fremen, Bene Gesserit, Guilde spatiale — emblèmes originaux.
6. Le Sietch : la partie utile (Console Mentat) — films, livres, *Dune: Awakening*, réseaux officiels, carte d'Arrakis, chronologie.
7. Prescience : calendrier des prochaines sorties, comptes à rebours ; « Prendre l'épice » = voile bleu.
8. Pied de page : nuit aux deux lunes, mention non officielle, « Conçu par Zelyris », mentions légales.

## Mécaniques de la V1

a) Descente orbitale au défilement (altitude de ~1 200 km à 0 m, puis profondeur sous le roc).
b) Le ver invisible : ondulation du sable, vibration légère, grondement (jamais en mouvement réduit).
c) « Marcher sans rythme » (easter egg) : défilement régulier → le ver approche ; irrégulier → il s'éloigne ; un message discret explique la mécanique une fois découverte (mémorisé).
d) Prescience : bouton « Prendre l'épice » → voile bleu, calendrier des sorties avec comptes à rebours, retour en un clic.
e) Lexique vivant : chaque terme affiche une définition courte (survol / focus / toucher) ; page `/lexique`.
f) Son : nappe grave + vent selon la vitesse de défilement + grondement devant le long-courrier ; désactivé par défaut, bouton visible, choix mémorisé.
g) Ciel réel : selon l'heure locale, jour écrasant, crépuscule, nuit aux deux lunes.

## Architecture technique

- Next.js 16 (App Router, TypeScript, Turbopack), React 19, pnpm ; hébergement Vercel (projet à relier par Johan : voir Hypothèses H7).
- GSAP 3.15 + ScrollTrigger (licence « No Charge » de Webflow, 100 % gratuite y compris en usage commercial, voir `docs/sources.md`) ; Lenis 1.3 (MIT) ; three.js 0.186 (MIT) chargé dynamiquement, un seul canvas persistant piloté par la progression du défilement.
- Repli : sans WebGL, appareil faible ou mouvement réduit → version image/CSS calme et complète (`components/world/StillWorld.tsx`).
- Médias : aucune vidéo réelle en V1 (voir H2) ; images à générer par Johan listées dans `docs/medias.md`, emplacements prévus.
- Tests : `pnpm typecheck`, `pnpm lint`, `pnpm test` (unitaires, `node --test`), `pnpm build`, `pnpm test:e2e` (Playwright : la page charge, son désactivé par défaut, liens présents, mode réduit) ; captures `docs/captures/`.

## Décisions

- 2026-10-18 — DA « Brutalisme sacré » + « Console Mentat » + « Archives de l'Imperium » (brief de Johan, atelier A1).
- 2026-10-18 — Plan « Descente » en une page principale ; le Sietch est la partie utile ; Dune: Awakening mis en avant.
- 2026-10-18 — Polices OFL : Archivo, Cormorant Garamond, IBM Plex Mono (choix de l'agent, réversible).
- 2026-10-18 — Pas de vidéo réelle en V1 : tout le visuel est procédural (voir H2) ; décision à revoir avec une clé Pexels fournie par Johan.
- 2026-10-18 — Le long-courrier est un fuseau à anneaux de structure vu depuis sa soute (arceaux), jamais une forme des films, de la série ou du jeu ; le ver n'est jamais montré (bosse, ondes, tremblement, grondement).
- 2026-10-18 — Un seul voile de lisibilité fixe pour toute la descente (aucune couture entre scènes) ; halo sombre sous les textes clairs ; sections souterraines (Maisons, Sietch, Prescience) sur fond basalte à 80 %.
- 2026-10-18 — Le monde WebGL n'est jamais sur le chemin critique : chargé à la sortie de l'intro ou après « load ».
- 2026-10-18 — Dans le désert, la caméra suit le creux de la vallée entre deux dunes et ne passe jamais sous le sable (formule des dunes portée sur le processeur, `src/world/dunes.ts`, à garder identique au nuanceur).
- 2026-10-18 — Le monde WebGL ne démarre que quand le visiteur est là : sortie de l'intro, premier geste (souris, molette, doigt, clavier) ou six secondes de calme après le chargement (`components/world/World.tsx`). Avant : « chargement + 1,2 s », qui tombait dans la trace de Lighthouse ; sans carte graphique, chaque image rendue par logiciel devenait une tâche longue (TBT 4 950 ms, performance 62). Après : TBT 180-210 ms, performance 89 sur deux mesures. Un robot de mesure voit la version calme, complète.
- 2026-10-18 — Crêtes des dunes adoucies (exposant des arêtes 1,6 et 2,0 au lieu de 2,2 et 2,6, dans `src/world/dunes.ts` ET `DUNE_FN` de `shaders.ts`, toujours identiques) : une chaîne de dunes plutôt que des aiguilles.
- 2026-10-18 — Tout lissage du monde (caméra, chemin de la vallée, ver, prescience) est corrigé par le temps écoulé (`sm(k)` dans `createWorld.ts`) : il converge en secondes, pas en images — même descente à 30, 60 ou 120 images/s. Les captures sous rendu logiciel (SwiftShader, quelques images par seconde) se font avec `--wait=4000` au moins.

## Hypothèses (prises sans Johan, réversibles)

- **H1 — Branches.** La session Claude Code impose la branche `claude/sietch-c1-refuge-fans-kd77dr` ; Johan a demandé `feat/v1`. Les deux reçoivent exactement les mêmes commits (poussés ensemble) ; la PR vers `main` part de la branche de session et le signale. Si Johan préfère une seule branche, il suffit d'en supprimer une (lui seul).
- **H2 — Médias.** Pexels et Pixabay exigent une clé d'API (401 / 400 sans clé) et leurs sites sont bloqués par le réseau de la session ; aucune nouvelle clé sans l'accord de Johan → aucune vidéo réelle en V1, visuels 100 % procéduraux (WebGL, SVG, CSS). Emplacements d'images réservés (`docs/medias.md`).
- **H3 — Indexation.** `X-Robots-Tag: noindex, nofollow` sur tout le site tant que Johan n'a pas dit « mets en ligne » (comme la préversion de La Guilde).
- **H4 — Mentions légales.** zelyris.fr est inaccessible depuis la session (réseau) : la page reprend le **code source** de la page de zelyris.fr (dépôt Zelyris, `src/content/legal.ts`, version « 2 octobre 2026 »), qui génère la page en ligne. Johan vérifie une fois en ligne.
- **H5 — Vérification des faits.** Les sites officiels (Steam, Funcom, YouTube, Discord, Warner, dunenovels.com) sont bloqués par le réseau de la session : chaque fait est vérifié par la recherche web (titres, dates, adresses recoupées sur au moins deux résultats) et noté dans `docs/sources.md` avec la date. Johan clique une fois chaque lien officiel avant la mise en ligne.
- **H6 — Noms.** Le site s'appelle « Sietch — Le Refuge des fans » ; adresse de production : À définir (sous-domaine `sietch.zelyris.fr` suggéré, comme `laguilde.zelyris.fr`).
- **H7 — Vercel.** Relier un hébergeur est réservé à Johan (méthode commune, règle « liaison ou réglage d'un hébergeur ») : aucun projet Vercel créé par l'agent. Procédure en fin de résumé ; dès que le projet existe, chaque push de la branche donne une préversion.
- **H8 — Son.** Tout est généré en direct (aucun fichier audio) : nappe grave, vent, grondement. Coupé par défaut.
- **H9 — Ciel réel.** Rendu serveur = nuit ; un script inline applique l'heure locale avant le premier rendu (jour 7 h–17 h, crépuscule 17 h–20 h et 5 h–7 h, nuit sinon). `?ciel=jour|crepuscule|nuit` force le ciel pour tester.
- **H10 — Marcher sans rythme.** La régularité se mesure sur les gestes (molette, doigt, clavier) des 2,8 dernières secondes, pas sur le défilement lissé ; le ver n'approche que sur le sable (désert, épice) ; message affiché une seule fois (mémorisé), jamais en mouvement réduit.
- **H11 — Altitude.** Échelle narrative : 1 200 km dans la soute, 400 km en sortie d'orbite, 12 km sous les nuages de poussière, 0 sur le sable, −80 m au fond du Sietch (aucune prétention physique).
- **H12 — Mentions légales et données personnelles.** Le site ne pose aucun cookie et n'a aucune mesure d'audience ; deux préférences (son, message du ver) restent dans le navigateur. À confirmer par Johan si une mesure d'audience est ajoutée plus tard.
- **H12, précision (18/10/2026, après-midi).** Trois mémorisations en réalité : son, message du ver (durables, `localStorage`) et intro déjà vue (le temps d'une session, `sessionStorage`). La page « Mentions légales » les cite toutes les trois.

## Chantiers futurs (NE PAS construire maintenant)

- **Second site Dune pour la gamme Immersion**, plan « Hub d'abord » : l'accueil est le Sietch, et chaque porte mène à une page Films, Livres, Jeu, Fan art…
- **Fan arts d'autres artistes** : ne s'affichent qu'avec leur **accord écrit** et leur **crédit** (nom, lien) ; aucune image sans ces deux conditions.
- Vidéos réelles libres de droits (Pexels / Pixabay) une fois une clé d'API fournie par Johan : dunes, vent, tempête, en repli et en fond des sections.
- Pages secondaires détaillées (un film par page, un livre par page), partage social, version anglaise.

## Journal des chantiers

- 2026-10-18 — **C1 — V1 du Refuge des fans** (branche `claude/sietch-c1-refuge-fans-kd77dr`, miroir `feat/v1`, PR #1 en brouillon, pas de fusion). Bible, squelette Next.js 16 + TypeScript, polices OFL (Archivo, Cormorant Garamond, IBM Plex Mono), direction artistique et pied de page légal ; la descente en sept scènes + pied de page « nuit aux deux lunes » ; compteur d'altitude ; lexique vivant (41 termes, page `/lexique`) ; console Mentat (Dune: Awakening mis en avant, films, livres + guide de lecture, réseaux officiels, carte d'Arrakis cliquable, chronologie de 10 000 ans) ; prescience (voile bleu, comptes à rebours, retour en un clic) ; son généré (nappe, vent, grondement, coupé par défaut, choix mémorisé) ; « marcher sans rythme » (ver qui approche puis s'éloigne, message unique) ; monde three.js en un seul canvas : soute et long-courrier originaux (fuseau à panneaux, anneaux, modules, hublots, feux, frégates), planète en nuanceur, tempête de particules, dunes en relief avec vent et signe du ver, épice, ciel réel (jour / crépuscule / nuit aux deux lunes) ; repli calme (sans WebGL, mouvement réduit, appareil faible) ; three.js chargé après l'intro ou le chargement. Contrôles : typecheck, lint, 9 tests unitaires, build, 15 tests Playwright (bureau + mobile) + test du ver ; captures `docs/captures/v1/` ; Lighthouse mobile simulé (fin de chantier) : performance 91, accessibilité 100, bonnes pratiques 100, référencement 63 (seulement le `noindex` voulu), FCP 1,4 s, LCP 3,3 s (délai de rendu modélisé par Lighthouse — mesuré dans un vrai navigateur, le texte du héro est peint à 0,35 s ; à confirmer sur le téléphone de Johan / PageSpeed une fois en préversion), CLS 0, TBT 110 ms.
- 2026-10-18 — **C1, finitions** : relecture de tous les contenus (Carthag au nord-est d'Arrakeen, années de « Great Schools of Dune », page légale : les trois mémorisations du navigateur) ; lissages du monde indépendants de la cadence (le « voile beige » du désert dans les premières captures bureau était la caméra du rendu logiciel encore en route : corrigé à la source, captures v1 refaites avec `--wait=4000`) ; options `--wait`, `--only`, `--view` du script de captures.
- 2026-10-18 — **C1, lisibilité en plein jour** : mesure `scripts/diag-contraste.mjs` (texte masqué, luminance moyenne du fond rendu, rapport WCAG sans compter le halo) — avant : 14 blocs sous le seuil en ciel de jour (petits libellés en couleur atténuée, haut de l'écran téléphone) ; après : 1 bloc à 4,43 (indice « 02 · Entrée atmosphérique », 12 px, couvert par le halo). Correctifs : voile fixe renforcé (colonne gauche sur ordinateur, tiers haut sur téléphone), halo serré + halo large, indices et signatures d'épigraphe en couleur de texte dans les scènes sur fond rendu ; héro téléphone : vaisseau dans le coin supérieur droit ; altitude « −80 M » sous le roc.
- 2026-10-18 — **C1, bug du tremblement corrigé** : l'animation « ver proche » portait sur `body` ; un `transform` sur `body` en fait le bloc conteneur de tout élément `position: fixed` (canvas du monde, voile, console), qui aurait sauté hors de l'écran au moment même où le ver approche. Le tremblement porte désormais sur `#world` et `.still-world` seulement ; preuve `scripts/diag-ver-tremble.mjs` (monde à 0 / 900 px, console à 10 / 60 px pendant le tremblement).
- 2026-10-18 — **C1, mesure finale** : Lighthouse mobile simulé après les finitions — performance 89 (deux mesures : TBT 180 et 210 ms), accessibilité 100, bonnes pratiques 100, référencement 63 (`noindex` voulu), FCP 1,4 s, LCP 3,3 s (modélisé), CLS 0, Speed Index 1,4 s. Version calme capturée (`docs/captures/v1-calme/`, mouvement réduit) ; contraste mesuré en jour, crépuscule et nuit (1 bloc à 4,43 couvert par le halo).
- 2026-10-18 — **C1, rail différé** : Lenis + GSAP (≈ 50 ko) chargés après l'hydratation (`ScrollRigLoader.tsx`), hors du paquet initial → Lighthouse mobile performance 91, TBT 130 ms, LCP modélisé 3,2 s. Dans un vrai Chromium (processeur ralenti × 4, réseau local), l'unique candidat LCP est le paragraphe du héro, peint à 0,36 s avec les polices chargées (`scripts/diag-lcp.mjs`) : le 3,2 s de Lighthouse est la moyenne de son modèle optimiste / pessimiste (tout le JavaScript compté avant le texte), pas un délai réel — à confirmer par PageSpeed sur la préversion.
- 2026-10-18 — **C1, retour sans éclair** : au retour d'une page (/lexique, /mentions-legales) dans la même session, l'intro rendue par le serveur apparaissait un instant avant d'être retirée à l'hydratation. Le script d'amorçage de `app/layout.tsx` lit la mémoire de session avant le premier rendu et pose `data-intro="seen"` ; CSS `display: none`. Preuve `scripts/diag-intro.mjs`. Message du ver au-dessus de la plaque d'altitude sur téléphone.

## Reste à faire

- Johan : créer le projet Vercel lié au dépôt (H7) et dire « mets en ligne » après validation.
- Johan : fournir une clé Pexels (gratuite) si l'on veut des vidéos réelles (H2).
- Johan : générer les images de `docs/medias.md` et les déposer dans `public/images/`.
- C2 : brancher ces images (déclaration `src/config/media.ts`, conversion AVIF/WebP, replis image des scènes et de la carte) — en V1 rien ne les lit encore.
- Johan : vérifier sur son téléphone (Android) : fluidité de la descente, le son (nappe, vent, grondement), « marcher sans rythme » au doigt, la lisibilité du héro sur le vaisseau, les infobulles au toucher, le menu des onglets de la console.
- Johan : cliquer une fois chaque lien officiel de la console (H5) et relire les mentions légales en ligne (H4).
- C2 (suggestions) : éclairage et détails du long-courrier (ombres portées, feux animés), raccord plus doux tempête → dunes, pied de page WebGL (lunes dans le monde), version anglaise, mesure LCP réelle sur préversion, image de partage mise à jour.
