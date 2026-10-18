# Mise en ligne — Sietch, le Refuge des fans

Checklist à cocher, **rien n'est fait ici** : chaque case est une manœuvre de Johan (ou de l'agent sur son accord explicite, méthode commune, règle « mise en production »). Rédigée le 18/10/2026 au chantier C2. Les détails Vercel marqués *à vérifier* se lisent dans le tableau de bord au moment de la manœuvre : rien n'est affirmé de mémoire.

**Règle d'or : la fusion de la PR vers `main` n'a lieu qu'après le « mets en ligne » de Johan, donné sur la préversion Vercel.** Jamais de force-push, aucune branche supprimée sans son accord.

Ordre conseillé : 0 → 1 → 3 → 4 → 2 → 5 (le retrait du noindex est la dernière manœuvre avant la fusion).

---

## 0. Avant de commencer

- [ ] La PR du chantier vers `main` est ouverte et à jour (le dépôt : Zelyris-JDG/sietch).
  <https://github.com/Zelyris-JDG/sietch/pulls>
- [ ] Les cinq contrôles passent sur la branche (commande en 4.6).
- [ ] Les captures mobile et bureau de `docs/captures/` sont à jour (règle 8 de `CLAUDE.md`).
- [ ] Relecture finale : rien d'officiel (règle 1), rien d'inventé (règle 2), chaque fait noté dans `docs/sources.md`.

---

## 1. Domaine `sietch.zelyris.fr`

### 1.1 Relier le dépôt GitHub à Vercel (Johan — hypothèse H7)

- [ ] **a)** Dans Vercel : *Add New… → Project*, importer le dépôt GitHub `Zelyris-JDG/sietch` (l'application GitHub de Vercel doit avoir accès à ce dépôt).
  <https://vercel.com/new>
  <https://github.com/Zelyris-JDG/sietch>
- [ ] **b)** Vérifier la détection automatique : framework **Next.js**, gestionnaire **pnpm** (présence de `pnpm-lock.yaml`), commande de build `pnpm build` (= `next build`), **Node.js 22** (`"engines": { "node": "22.x" }` dans `package.json`) — *à vérifier dans Settings → General, réglage « Node.js Version »*.
- [ ] **c)** Variable d'environnement `NEXT_PUBLIC_SITE_URL` = `https://sietch.zelyris.fr`, pour l'environnement **Production** (*Settings → Environment Variables*).
  - Elle est lue dans `src/config/site.ts` : `url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sietch.zelyris.fr"`. La valeur par défaut est déjà la bonne : la variable est **facultative**, mais la poser rend l'adresse explicite et prête à changer sans toucher au code.
  - Elle alimente `metadataBase` (adresses absolues de l'image de partage `/og.png`) et l'URL Open Graph du site (`app/layout.tsx`).
  - C'est une variable `NEXT_PUBLIC_…`, incorporée au moment du build : **redéployer** après toute modification.
- [ ] **d)** Premier déploiement : chaque push d'une branche donne une préversion ; `main` donne la production (comportement par défaut de l'intégration Git — *à vérifier dans Settings → Git, « Production Branch » = `main`*).
- [ ] **e)** Noter l'adresse de la préversion de la branche du chantier : c'est sur elle que Johan donne son « mets en ligne ».

### 1.2 Ajouter le domaine dans Vercel

- [ ] **a)** Projet → *Settings → Domains → Add* → `sietch.zelyris.fr`.
- [ ] **b)** Vercel affiche l'enregistrement DNS attendu. Pour un sous-domaine, c'est un **CNAME** ; la valeur classique est `cname.vercel-dns.com` (la documentation actuelle montre aussi `cname.vercel-dns-0.com`) : **reprendre exactement la valeur affichée dans le tableau de bord**.
  <https://vercel.com/docs/domains/set-up-custom-domain>

### 1.3 Enregistrement DNS chez le registrar de `zelyris.fr`

- [ ] **a)** Dans la zone DNS de `zelyris.fr` (registrar ou hébergeur DNS du domaine — même manœuvre que pour `laguilde.zelyris.fr`) : type **CNAME**, nom/hôte `sietch`, cible = la valeur affichée par Vercel, TTL par défaut.
- [ ] **b)** Si les DNS de `zelyris.fr` sont gérés par Vercel lui-même, l'enregistrement se crée directement dans Vercel (*Domains → zelyris.fr → DNS Records*) — *à vérifier*.
- [ ] **c)** Attendre la propagation (quelques minutes à quelques heures), puis vérifier :
  `dig +short sietch.zelyris.fr CNAME` (ou `nslookup sietch.zelyris.fr`)
- [ ] **d)** Certificat TLS : émis automatiquement par Vercel une fois le DNS valide — *vérifier l'état du domaine dans Settings → Domains (configuration valide), puis le cadenas dans le navigateur*.
- [ ] **e)** Test : `https://sietch.zelyris.fr` répond. Tant que la PR n'est pas fusionnée, le domaine sert `main` (la version précédente ou rien) : c'est normal.

---

## 2. Retirer le `noindex` (levée de l'hypothèse H3) — dernière manœuvre avant la fusion

Le `noindex` de préversion est posé à **trois endroits** ; ils changent **ensemble, dans le même commit**, juste avant la fusion. Une fois ce commit poussé sur la branche, la préversion n'a plus notre protection : *vérifier avec `curl -sI <adresse-de-préversion>` si Vercel pose lui-même un en-tête `x-robots-tag` sur les préversions (à vérifier)* ; sinon, enchaîner rapidement avec la fusion.

### 2.1 `app/layout.tsx` — métadonnées (balise `<meta name="robots">`)

- [ ] Dans `export const metadata`, supprimer la ligne `robots: { index: false, follow: false },` et le commentaire « Préversion : jamais indexée… » au-dessus. Alternative explicite : `robots: { index: true, follow: true }`.
  - Effet : la balise `<meta name="robots" content="noindex, nofollow">` disparaît du HTML de toutes les pages.

### 2.2 `next.config.ts` — en-tête HTTP

- [ ] Dans `async headers()`, supprimer la ligne `{ key: "X-Robots-Tag", value: "noindex, nofollow" },` ; **garder** les trois autres en-têtes (`Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`) ; mettre à jour le commentaire « Préversion : jamais indexée… ».

### 2.3 `app/robots.ts` — fichier `robots.txt`

- [ ] Remplacer `disallow: "/"` par `allow: "/"` et adapter le commentaire. Optionnel : ajouter `sitemap: \`${site.url}/sitemap.xml\`` **seulement** si un `app/sitemap.ts` est créé (il n'existe pas en V1).

### 2.4 À adapter dans le même commit

- [ ] `tests/e2e/base.spec.ts` : le test « l'en-tête noindex est posé (préversion) » attend `noindex` ; l'inverser :
  ```ts
  test("aucun en-tête noindex (production)", async ({ request }) => {
    const r = await request.get("/");
    expect(r.headers()["x-robots-tag"]).toBeUndefined();
  });
  ```
  Et, si l'on veut, vérifier `robots.txt` : `expect(await (await request.get("/robots.txt")).text()).toContain("Allow: /");`
- [ ] `app/mentions-legales/page.tsx` porte son **propre** `robots: { index: false, follow: false }` dans ses métadonnées : sans lien avec la préversion, c'est une décision de Johan (garder la page légale hors index, ou non — faire comme sur zelyris.fr).
- [ ] `docs/BIBLE.md` : noter la levée de H3 au Journal des chantiers (ajout uniquement).

### 2.5 Vérifier après le déploiement de production

- [ ] `curl -sI https://sietch.zelyris.fr | grep -i x-robots-tag` → aucune ligne.
- [ ] `curl -s https://sietch.zelyris.fr/robots.txt` → `Allow: /`.
- [ ] Code source de la page d'accueil : aucune balise `<meta name="robots" content="noindex…">`.
- [ ] Lighthouse / PageSpeed : la note « Référencement » (63 en préversion, uniquement à cause du `noindex` voulu) doit remonter.

---

## 3. Mentions légales (hypothèse H4)

La page `/mentions-legales` reprend le **code source** de la page de zelyris.fr (dépôt Zelyris, version « 2 octobre 2026 »), zelyris.fr étant inaccessible depuis la session de travail. Johan relit une fois en ligne, sur la préversion.

- [ ] **a)** Comparer avec la page Mentions légales en ligne de zelyris.fr : mêmes données, même version.
  <https://zelyris.fr>
- [ ] **b)** Identité de l'éditeur (`src/content/legal.ts`) : Johan De Grave — entrepreneur individuel, nom commercial Zelyris, SIREN 838 973 626, SIRET 838 973 626 00024, code APE 6201Z, adresse (Montpellier), e-mail `contact@zelyris-tech.com`, téléphone, site `https://zelyris.fr`, directeur de la publication, activité, mention TVA (article 293 B du CGI).
- [ ] **c)** Hébergeur : Vercel Inc., adresse relevée le 23/08/2026 sur la page légale publique de Vercel, site `https://vercel.com` — toujours exacte ?
  <https://vercel.com/legal>
- [ ] **d)** Données personnelles : aucun cookie, aucune mesure d'audience, et **trois mémorisations** dans le navigateur, sans identifiant (hypothèse H12) : le son (`localStorage`, clé `sietch-son`), le message du ver déjà découvert (`localStorage`, `sietch-ver-decouvert`), l'introduction déjà vue (`sessionStorage`, `sietch-intro`). Si une mesure d'audience est ajoutée un jour, cette section change.
- [ ] **e)** Section « Site de fan non officiel » : la clause de retrait sur demande d'un titulaire de droits est présente ; le pied de page porte bien « Site de fan non officiel… » et « Conçu par Zelyris » (lien zelyris.fr) sur toutes les pages (règle 3).
- [ ] **f)** La date « Dernière mise à jour : 18 octobre 2026 » (`app/mentions-legales/page.tsx`) est à changer si le contenu change.

---

## 4. Vérifications finales

### 4.1 Liens officiels (hypothèse H5) — Johan clique chacun une fois, depuis la préversion

Les sites officiels étaient bloqués depuis la session : chaque adresse a été recoupée par la recherche web (`docs/sources.md`), jamais ouverte. Un lien qui ne mène pas où il doit est **retiré**, pas corrigé au hasard.

- [ ] Jeu Dune: Awakening — site officiel
  <https://duneawakening.com>
- [ ] Jeu — actualités
  <https://duneawakening.com/news/>
- [ ] Jeu — fiche Steam (identifiant 1172710)
  <https://store.steampowered.com/app/1172710/>
- [ ] Jeu — Discord officiel
  <https://discord.com/servers/dune-awakening-1006265467754790943>
- [ ] Jeu — centre d'aide Funcom
  <https://funcom.helpshift.com/hc/en/4-dune-awakening/>
- [ ] Jeu — éditeur Funcom
  <https://www.funcom.com>
- [ ] X · @DuneAwakening (kit presse Funcom)
  <https://x.com/DuneAwakening>
- [ ] YouTube · Funcom (kit presse Funcom)
  <https://www.youtube.com/funcom>
- [ ] Communauté du jeu — wiki
  <https://awakening.wiki>
- [ ] Communauté du jeu — cartes interactives
  <https://duneawakening.th.gl>
- [ ] Communauté du jeu — objets et recettes
  <https://dune.gaming.tools>
- [ ] Communauté du jeu — application compagnon
  <https://companion.gaming.tools/games/dune>
- [ ] Communauté du jeu — discussions Steam
  <https://steamcommunity.com/app/1172710/discussions/>
- [ ] Films — compte X
  <https://x.com/dunemovie>
- [ ] Films — compte Instagram
  <https://www.instagram.com/dunemovie>
- [ ] Films — Legendary
  <https://www.legendary.com>
- [ ] Films — Warner Bros.
  <https://www.warnerbros.com>
- [ ] Série — HBO
  <https://www.hbo.com/dune-prophecy>
- [ ] Série — communiqués Warner Bros. Discovery
  <https://press.wbd.com/na/property/dune-prophecy>
- [ ] Livres — site officiel des romans
  <https://dunenovels.com>
- [ ] Livres — site de Brian Herbert
  <https://brianherbertnovels.com>
- [ ] Pied de page — Zelyris
  <https://zelyris.fr>
- [ ] Chaque lien externe s'ouvre dans un nouvel onglet (`target="_blank"`, `rel="noopener noreferrer"`, mention « (nouvel onglet) » pour les lecteurs d'écran).

### 4.2 Téléphone Android (Johan)

- [ ] Fluidité de la descente du début à la fin (aucun à-coup, aucun saut du canvas).
- [ ] Son : coupé par défaut, bouton visible, activation au geste, nappe + vent + grondement, choix mémorisé au rechargement.
- [ ] « Marcher sans rythme » au doigt : balayages réguliers sur le sable → le ver approche (tremblement, grondement) ; irréguliers → il s'éloigne ; le message n'apparaît qu'une fois.
- [ ] Lisibilité du héro sur le vaisseau (ciel de jour : `?ciel=jour`, crépuscule : `?ciel=crepuscule`, nuit : `?ciel=nuit`).
- [ ] Infobulles des termes au toucher (ouverture, fermeture en touchant ailleurs, toujours dans l'écran).
- [ ] Onglets de la console Mentat, lieux de la carte d'Arrakis, prescience aller-retour.
- [ ] Téléphone à l'horizontale : l'intro reste défilable et ses boutons accessibles.
- [ ] Pages `/lexique` (recherche, filtres) et `/mentions-legales` ; une adresse fausse → page 404 « Hors des cartes ».

### 4.3 Safari et Firefox

- [ ] Safari (iPhone ou Mac) et Firefox : descente, son, infobulles, console, lexique — seul Chromium a été exécuté pendant les chantiers (WebKit et Gecko jamais lancés).
- [ ] Safari : vérifier l'icône de l'onglet (`app/icon.svg` — la prise en charge des favicons SVG varie selon les navigateurs ; si elle manque, prévoir un `app/icon.png` au chantier suivant).

### 4.4 PageSpeed sur la préversion

- [ ] Lancer PageSpeed Insights sur l'adresse de la préversion, profil mobile : **LCP < 2,5 s** (règle 5), CLS 0, accessibilité 100. Le LCP « modélisé » par Lighthouse en local était 3,2 s alors que le héro est peint à 0,36 s dans un vrai navigateur : c'est ici qu'on tranche.
  <https://pagespeed.web.dev/>
- [ ] Si le LCP mobile dépasse 2,5 s sur la préversion : noter la valeur dans la bible, ne pas mettre en ligne avant correction.

### 4.5 Partage, favicon, 404

- [ ] Image de partage `public/og.png` (1 200 × 630, déclarée dans `app/layout.tsx`) : tester l'adresse de la préversion dans un aperçu de partage (outils tiers ; la carte doit montrer le titre, la description et l'image).
  <https://www.opengraph.xyz/>
  <https://developers.facebook.com/tools/debug/>
  <https://www.linkedin.com/post-inspector/>
- [ ] L'image ne reprend rien d'officiel (c'est le long-courrier original vu depuis sa soute).
- [ ] Favicon : `app/icon.svg` visible dans l'onglet (Chrome, Firefox, Safari — voir 4.3).
- [ ] Page 404 : ouvrir une adresse inexistante → page « Hors des cartes », boutons « Revenir à la descente » et « Lexique » ; `curl -sI https://<préversion>/une-adresse-inexistante | head -1` → statut `404`.

### 4.6 Contrôles du dépôt (sur la branche, avant la fusion)

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e`
- [ ] Captures mobile et bureau régénérées dans `docs/captures/` (`pnpm captures --label=<nom>`).

---

## 5. Le jour J

- [ ] **a)** Johan dit « **mets en ligne** » sur la préversion Vercel.
- [ ] **b)** Commit du retrait du `noindex` (section 2) poussé sur la branche ; contrôles verts ; PR à jour.
- [ ] **c)** Fusion de la PR vers `main` (fusion simple, sans force-push ; aucune branche supprimée sans l'accord de Johan).
  <https://github.com/Zelyris-JDG/sietch/pulls>
- [ ] **d)** Vercel déploie `main` en production ; vérifier le déploiement dans le tableau de bord, puis la section 2.5 et le domaine (1.3 e).
- [ ] **e)** Aperçu de partage (4.5) et PageSpeed (4.4) refaits sur `https://sietch.zelyris.fr`.
- [ ] **f)** Bible : entrée au Journal des chantiers (mise en ligne, date), H3 levée, H6 confirmée (adresse `sietch.zelyris.fr`), H7 close.
- [ ] **g)** Retour arrière si nécessaire : Vercel permet de remettre en production un déploiement précédent depuis la liste des déploiements (*à vérifier dans le tableau de bord : Deployments → menu du déploiement*) ; côté code, un commit de retour sur `main`, jamais de force-push.
