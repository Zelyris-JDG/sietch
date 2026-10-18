# CLAUDE.md — Sietch, le Refuge des fans

@docs/BIBLE.md

Site de fan (non officiel) de l'univers de Dune, deuxième exemple de la gamme Opus de Zelyris. Lis `docs/BIBLE.md` avant toute action.

## Règles courtes

1. **Propriété intellectuelle, non négociable** : rien d'officiel n'est repris — ni logo/lettrage « DUNE », ni image, son, vidéo, personnage, design signature (long-courrier, ornithoptère, gueule du ver, armoiries, distilles des films/série/jeu), ni citation longue des livres, ni modèle 3D récupéré. Autorisés : les noms et le vocabulaire de l'univers, des paysages, vaisseaux et emblèmes entièrement réinventés, des épigraphes ORIGINALES signées « — Carnets du Sietch », des liens vers les sites officiels. Le ver n'est jamais montré.
2. **Rien n'est inventé** : chaque fait (date, lien, titre, plateforme) est vérifié sur le web et noté dans `docs/sources.md`. Un lien non vérifié n'est pas publié. Tous les textes sont écrits par nous (aucune copie de résumé officiel ou de wiki).
3. **Pied de page obligatoire** : mention « Site de fan non officiel… », « Conçu par Zelyris » (lien zelyris.fr), page Mentions légales reprise de zelyris.fr.
4. **Polices** : SIL OFL uniquement (`src/fonts/`, licences à côté), servies par `next/font/local`. Aucun appel à fonts.googleapis.com. Aucune police n'imite le logo des films.
5. **Garde-fous techniques** : contraste WCAG AA ; `prefers-reduced-motion` = version calme, statique et complète ; navigation clavier ; texte en vrai HTML ; three.js chargé seulement quand il sert ; repli image si WebGL manque ou si l'appareil est faible ; fluide sur un Android d'entrée de gamme ; LCP < 2,5 s sur mobile.
6. **Son** : généré en direct (Web Audio API), désactivé par défaut, bouton visible, choix mémorisé. Jamais d'`AudioContext` avant un geste du visiteur.
7. **Secrets, paiements, comptes, mise en production** : jamais sans l'accord de Johan. Les secrets déjà configurés peuvent être utilisés.
8. **Validation d'un chantier** : `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e` + captures mobile et bureau dans `docs/captures/`.

## Méthode de travail

Méthode commune aux projets de Johan (atelier → chantier → bible).

1. **Atelier** (discussion Claude, titre « 💬 Sietch An ») : on réfléchit, on décide, on rédige le prompt du chantier. **Chantier** (discussion Claude Code, titre « 🌐 Sietch Cn ») : on construit. **Bible** (`docs/BIBLE.md`) : on consigne (vision, DA, décisions, hypothèses, journal) — ajout uniquement, on ne réécrit jamais le passé.
2. **Une discussion par chantier, qui part de `main`** à jour, sur une branche dédiée poussée sur GitHub à chaque étape importante (au moins toutes les 30 minutes en travail autonome).
3. **PR vers `main` dès le premier push.** La fusion se fait **en fin de chantier, après le « mets en ligne » de Johan** donné sur la préversion Vercel. Jamais de force-push, jamais de réécriture d'une branche déjà poussée, aucune branche supprimée sans son accord.
4. **Format du titre de session** : « 🌐 Sietch Cn » pour un chantier (n = numéro noté dans la bible, à corriger dans la première réponse s'il est faux), « 💬 Sietch An » pour un atelier.
5. **Travail autonome** : ne pas s'arrêter pour des questions ; prendre l'hypothèse la plus raisonnable et réversible, la noter dans la bible (section « Hypothèses »), continuer. On n'arrête Johan que pour : mise en ligne, décision irréversible, création de compte, mot de passe, nouveau secret, paiement.
6. **Fin de chantier** : tests → entrée au Journal des chantiers de la bible (+ Décisions, Hypothèses, Reste à faire) → commit, push, PR à jour → résumé en français pour Johan (préversion, fait / reste, hypothèses, images à générer, points à vérifier sur son téléphone).
