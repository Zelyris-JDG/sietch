# Médias — images à générer par Johan (ChatGPT)

Règles : **paysages et matières uniquement** ; aucun personnage, aucun véhicule ou design des films / de la série / du jeu, aucun logo, aucun texte dans l'image. Format : 2560 × 1440 (16:9) sauf mention ; exporter en PNG et déposer dans `public/images/<nom>.png`. Depuis le chantier C2, chaque emplacement est branché : une image déposée s'affiche automatiquement, servie en AVIF/WebP par `next/image` ; tant qu'elle manque, la scène garde son rendu procédural (voir « Marche à suivre » plus bas).

| # | Nom de fichier | Prompt (à coller tel quel) | Emplacement prévu |
|---|---|---|---|
| 1 | `orbit-dawn.png` | Vue depuis l'orbite basse d'une planète désertique entièrement ocre et beige, terminateur jour/nuit visible, fine atmosphère orangée sur le limbe, étoiles rares, aucun continent vert, aucune mer, style photographie spatiale réaliste, sans texte, sans vaisseau. | Repli image de la scène 1 (sans WebGL) et image de partage. |
| 2 | `planet-surface-macro.png` | Texture vue du dessus d'un désert de sable ocre strié de dunes longitudinales, ombres rasantes, quelques affleurements de roche noire basaltique, échelle d'une centaine de kilomètres, rendu satellite réaliste, sans texte. | Texture de la planète (shader) si Johan la préfère au bruit procédural. |
| 3 | `storm-wall.png` | Mur de tempête de poussière orange brun avançant sur une plaine de sable, lumière diffuse, grain photographique, ciel presque effacé, aucun objet, aucune personne, sans texte. | Repli image de la scène 2 (tempête). |
| 4 | `dunes-ridge.png` | Immenses dunes de sable ocre au coucher du soleil, crête nette dont le vent arrache un voile de sable, ombres longues bleutées, ciel pâle, aucun être vivant, aucune trace, photographie grand format très épurée, sans texte. | Repli image de la scène 3 (désert) ; arrière-plan du pied de page. |
| 5 | `spice-sand.png` | Gros plan macro de sable fin mêlé de grains ambrés et cuivrés brillants, lumière chaude rasante, faible profondeur de champ, sans texte. | Fond discret de la section « L'épice ». |
| 6 | `basalt-wall.png` | Paroi de roche volcanique noire finement texturée, légèrement humide, lumière froide venue d'en haut, cadrage serré, aspect caverne, sans texte. | Fond du Sietch (console) en version image. |
| 7 | `shield-wall.png` | Falaises monumentales de roche brune formant une muraille naturelle au-dessus d'une plaine de sable, brume de chaleur, vue aérienne lointaine, sans texte. | Fiche « Mur du Bouclier » de la carte d'Arrakis. |
| 8 | `polar-ice.png` | Calotte de glace sale et de roche sombre sur une planète désertique, vue aérienne, lumière rasante froide, sans texte. | Fiches « Pôles » de la carte. |
| 9 | `two-moons-night.png` | Nuit profonde sur un désert de sable, ciel bleu nuit étoilé avec deux lunes de tailles différentes (l'une plus grande et plus basse), dunes bleutées, sans texte. | Pied de page « nuit aux deux lunes » en version image. |
| 10 | `cavern-light.png` | Intérieur d'une grotte de roche brune, un rai de lumière chaude tombe d'une faille vers le sol de sable, poussière en suspension, aucune personne, sans texte. | Entrée de la section « Le Sietch ». |
| 11 | `rock-outcrop.png` | Affleurement rocheux isolé dans un désert immense, midi écrasant, ombres très courtes, ciel blanc de chaleur, sans texte. | Fiche « Désert profond » de la carte ; variante « jour écrasant » du ciel réel. |
| 12 | `dusk-sand.png` (vertical 1440 × 2560) | Dunes à la tombée du jour, dégradé du ciel de l'orange à l'indigo, un filet de sable qui coule d'une crête, cadrage vertical, sans texte. | Repli image sur téléphone (scènes 2 à 4). |

## Marche à suivre (une commande)

1. Déposer chaque fichier dans `public/images/` sous le nom prévu dans le tableau (`.png` de préférence ; `.jpg`, `.webp` ou `.avif` acceptés).
2. Lancer `pnpm medias` : la commande liste les 12 emplacements (présent / manquant), vérifie les dimensions (ratio, taille minimale) et écrit à côté de chaque image un `.webp` et un `.avif` de même nom.
3. Commit + push (les images et leurs versions légères) : la préversion Vercel les affiche automatiquement, rien d'autre à brancher.

## Comment c'est branché (C2)

- `src/config/media.ts` déclare les 12 emplacements (identifiant = nom de fichier sans extension, alt en français, dimensions, usage) ; fichier pur, sans accès disque, importable côté client. Le test `tests/unit/media.test.mjs` vérifie qu'il reste conforme au tableau ci-dessus.
- `src/lib/media.server.ts` (`presentMedia()`) lit `public/images/` au rendu serveur — donc au build (et à chaque déploiement Vercel) — et renvoie les chemins des fichiers présents. Extensions acceptées, par ordre de préférence : `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif` (la source la plus riche d'abord : `next/image` produit lui-même l'AVIF/WebP servi). Les pages restent pré-rendues statiquement. Le paquet `server-only` n'est pas installé : le suffixe `.server.ts` tient lieu de garde, à n'importer que depuis `app/page.tsx`.
- Version calme (`components/world/StillWorld.tsx`, prop `images`) : une image par couche, fondue par l'opacité existante de la couche — 1 espace (préchargée, seule image sur le chemin critique, et seulement si elle existe), 2 limbe de la planète (masquée en disque), 3 tempête, 4 dunes, 5 épice, 6 roche (Maisons, Sietch), 9 nuit (prescience, pied de page). Sur un écran en hauteur (téléphone), la 12 remplace la 3 et la 4 (`<picture>`, `(orientation: portrait)`). Les images des scènes suivantes ne sont montées qu'une scène à l'avance : rien ne pèse sur le premier écran.
- Carte d'Arrakis (`components/sietch/ArrakisMap.tsx`, prop `images`) : vignette dans la fiche « Mur du Bouclier » (7), « Pôle Nord » / « Pôle Sud » (8) et « Désert profond » (11), avec un alt descriptif.
- Fonds de section (`components/ui/MediaBackdrop.tsx`) : entrée de « Le Sietch » (10) et fond discret de « L'épice » (5), sous le voile et sous le texte ; alt vide (décoratif) ; aucune animation.
- Non branchés en C2, déclarés quand même : la texture 2 dans le nuanceur WebGL de la planète et la variante « jour écrasant » de la 11 (monde three.js), l'arrière-plan du pied de page avec la 4, l'image de partage avec la 1.
- Sans fichier : balisage et rendu strictement identiques à la V1 (captures `docs/captures/c2-medias/`).
