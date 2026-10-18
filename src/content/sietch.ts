/**
 * Données du Sietch (partie utile). Tous les textes sont écrits pour ce site. Chaque fait et chaque lien est
 * vérifié et consigné dans docs/sources.md (dates de vérification). Un lien non vérifié n'est pas publié.
 */
/** Date de la dernière vérification des faits (docs/sources.md). À mettre à jour à chaque revérification. */
export const DATA_VERIFIED_LABEL = "18 octobre 2026";

export type Link = { label: string; href: string };

export type Film = {
  id: string;
  kind: "Film" | "Série";
  title: string;
  year: string;
  by: string;
  studio: string;
  dates: { label: string; value: string }[];
  text: string;
  links: Link[];
};

export const FILMS: Film[] = [
  {
    id: "lynch-1984",
    kind: "Film",
    title: "Dune",
    year: "1984",
    by: "David Lynch",
    studio: "Universal Pictures",
    dates: [
      { label: "États-Unis", value: "14 décembre 1984" },
      { label: "France", value: "6 février 1985 (le CNC indique le 24 janvier 1985)" },
      { label: "Ressortie France", value: "13 mai 2026" },
    ],
    text: "La première adaptation au cinéma : tout le roman en un seul film, des décors de cathédrale, une étrangeté assumée. Mal reçu à sa sortie, devenu un objet de culte, et revenu en salles en France au printemps 2026.",
    links: [],
  },
  {
    id: "villeneuve-2021",
    kind: "Film",
    title: "Dune",
    year: "2021",
    by: "Denis Villeneuve",
    studio: "Warner Bros. · Legendary",
    dates: [
      { label: "France", value: "15 septembre 2021" },
      { label: "États-Unis", value: "22 octobre 2021" },
      { label: "Ressortie France", value: "11 novembre 2026" },
    ],
    text: "La première moitié du roman : l’arrivée des Atréides sur Arrakis, la trahison, la fuite dans le désert. La France l’a découvert plus d’un mois avant les États-Unis.",
    links: [
      { label: "X · @dunemovie", href: "https://x.com/dunemovie" },
      { label: "Instagram · @dunemovie", href: "https://www.instagram.com/dunemovie" },
    ],
  },
  {
    id: "villeneuve-2024",
    kind: "Film",
    title: "Dune : Deuxième Partie",
    year: "2024",
    by: "Denis Villeneuve",
    studio: "Warner Bros. · Legendary",
    dates: [
      { label: "France", value: "28 février 2024" },
      { label: "États-Unis", value: "1er mars 2024" },
      { label: "Ressortie France", value: "11 novembre 2026" },
    ],
    text: "La seconde moitié du roman : la vie chez les Fremen, la guerre de l’épice et le prix d’une prophétie. Repoussé par la grève des acteurs de l’été 2023, puis avancé de deux semaines au 1er mars aux États-Unis.",
    links: [
      { label: "X · @dunemovie", href: "https://x.com/dunemovie" },
      { label: "Instagram · @dunemovie", href: "https://www.instagram.com/dunemovie" },
    ],
  },
  {
    id: "villeneuve-2026",
    kind: "Film",
    title: "Dune : Troisième Partie",
    year: "2026",
    by: "Denis Villeneuve",
    studio: "Warner Bros. · Legendary",
    dates: [
      { label: "France", value: "16 décembre 2026" },
      { label: "États-Unis", value: "18 décembre 2026" },
    ],
    text: "Le troisième volet, annoncé pour décembre 2026, adapte Le Messie de Dune, la suite du premier roman : ce qui arrive à un empereur qui a vu l’avenir.",
    links: [{ label: "X · @dunemovie", href: "https://x.com/dunemovie" }],
  },
  {
    id: "prophecy",
    kind: "Série",
    title: "Dune: Prophecy",
    year: "2024 –",
    by: "HBO · showrunner Alison Schapker",
    studio: "HBO · Legendary Television",
    dates: [
      { label: "Saison 1", value: "17 novembre 2024 (HBO et Max), six épisodes" },
      { label: "Saison 2", value: "renouvelée le 19 décembre 2024 ; tournage lancé le 11 novembre 2025 ; date non annoncée" },
    ],
    text: "Dix mille ans avant les films : deux sœurs Harkonnen fondent ce qui deviendra le Bene Gesserit. Inspirée du roman Sisterhood of Dune de Brian Herbert et Kevin J. Anderson.",
    links: [
      { label: "Dossier officiel Warner Bros. Discovery", href: "https://press.wbd.com/na/property/dune-prophecy" },
      { label: "HBO — page de la série", href: "https://www.hbo.com/dune-prophecy" },
    ],
  },
];

export type Novel = { n: number; fr: string; en: string; year: number; text: string };

export const NOVELS: Novel[] = [
  { n: 1, fr: "Dune", en: "Dune", year: 1965, text: "Le livre fondateur : une famille envoyée sur la planète la plus dangereuse de l’Imperium, et un fils qui apprend à marcher dans le désert." },
  { n: 2, fr: "Le Messie de Dune", en: "Dune Messiah", year: 1969, text: "Douze ans plus tard : ce qu’il en coûte d’avoir gagné. Court, sombre, indispensable pour comprendre le projet de Frank Herbert." },
  { n: 3, fr: "Les Enfants de Dune", en: "Children of Dune", year: 1976, text: "Les jumeaux, le désert qui recule, et un choix qui engage l’humanité pour des millénaires." },
  { n: 4, fr: "L’Empereur-Dieu de Dune", en: "God Emperor of Dune", year: 1981, text: "Trois mille cinq cents ans plus tard, le Tyran règne. Le roman le plus philosophique du cycle, et le plus étrange." },
  { n: 5, fr: "Les Hérétiques de Dune", en: "Heretics of Dune", year: 1984, text: "Quinze siècles après la mort du Tyran : la Dispersion revient, et le Bene Gesserit découvre des adversaires à sa mesure." },
  { n: 6, fr: "La Maison des Mères", en: "Chapterhouse: Dune", year: 1985, text: "Le dernier roman de Frank Herbert, mort en 1986 : l’ordre assiégé sur sa planète secrète, et une fin ouverte." },
];

export type Cycle = { name: string; years: string; books: string[]; text: string };

export const EXPANDED: Cycle[] = [
  { name: "Prélude à Dune", years: "1999 – 2001", books: ["House Atreides", "House Harkonnen", "House Corrino"], text: "La génération qui précède le premier roman : Leto jeune duc, Jessica, le baron." },
  { name: "Legends of Dune", years: "2002 – 2004", books: ["The Butlerian Jihad", "The Machine Crusade", "The Battle of Corrin"], text: "Dix mille ans plus tôt : la guerre contre les machines pensantes et la naissance des grandes institutions." },
  { name: "Suites de Frank Herbert", years: "2006 – 2007", books: ["Hunters of Dune", "Sandworms of Dune"], text: "La conclusion du cycle, écrite d’après les notes laissées par Frank Herbert." },
  { name: "Heroes of Dune", years: "2008 – 2023", books: ["Paul of Dune", "The Winds of Dune", "Princess of Dune"], text: "Des récits intercalés entre les romans originaux." },
  { name: "Great Schools of Dune", years: "2012 – 2016", books: ["Sisterhood of Dune", "Mentats of Dune", "Navigators of Dune"], text: "La fondation des grandes écoles : c’est le cycle dont s’inspire la série Dune: Prophecy." },
  { name: "Trilogie de Caladan", years: "2020 – 2022", books: ["The Duke of Caladan", "The Lady of Caladan", "The Heir of Caladan"], text: "Les mois qui précèdent immédiatement Dune, vus de Caladan." },
];

export const READING_GUIDE: { title: string; text: string }[] = [
  { title: "Commencez par Dune (1965)", text: "Le premier roman se suffit à lui-même. Lisez-le sans rien d’autre, appendices compris : le glossaire de la fin répond à la plupart des questions." },
  { title: "Enchaînez Le Messie puis Les Enfants", text: "Les trois premiers livres forment un seul arc. Le Messie est court et change le sens du premier ; Les Enfants referme l’histoire de la famille." },
  { title: "Puis L’Empereur-Dieu, si le premier arc vous a plu", text: "Le quatrième roman saute trois millénaires et change de registre. Beaucoup s’y arrêtent ; ceux qui continuent le citent comme leur préféré." },
  { title: "Les Hérétiques et La Maison des Mères vont ensemble", text: "Les deux derniers se lisent d’affilée. La fin reste ouverte : les suites de Brian Herbert et Kevin J. Anderson la referment, dans un autre style." },
  { title: "L’univers étendu après, jamais avant", text: "Les préquelles expliquent ce que Frank Herbert laissait dans l’ombre. Lues en premier, elles ôtent le mystère ; lues après, elles prolongent le plaisir." },
];

export const BOOK_LINKS: Link[] = [
  { label: "dunenovels.com — site officiel des romans (Herbert Properties LLC)", href: "https://dunenovels.com" },
  { label: "Brian Herbert — site de l’auteur", href: "https://brianherbertnovels.com" },
];

export const GAME = {
  title: "Dune: Awakening",
  studio: "Funcom",
  genre: "Survie en ligne, monde ouvert",
  pitch:
    "Un jeu de survie en ligne sur Arrakis, dans une histoire alternative à celle des romans. On crée son personnage, on apprend à récolter l’eau et l’épice, à bâtir un abri, à traverser les tempêtes et à éviter ce qui vit sous le sable : seul, avec des amis, ou face aux autres dans le désert profond.",
  platforms: [
    { name: "PC (Steam)", date: "10 juin 2025" },
    { name: "PlayStation 5", date: "22 septembre 2026" },
    { name: "Xbox Series X|S", date: "22 septembre 2026 · dans le Xbox Game Pass le même jour" },
    { name: "Japon (PS5, physique et numérique)", date: "29 octobre 2026" },
  ],
  facts: [
    "Mise à jour 1.5 (17 septembre 2026) : mode solo complet, options de personnalisation de la partie, fin de l’histoire du Livre Un.",
    "Consoles : accès anticipé le 17 septembre 2026 pour les éditions Deluxe et Ultimate ; jeu croisé PC / consoles annoncé pour après le lancement, toujours sans date au 18 octobre 2026 (seule passerelle : Xbox ↔ PC Microsoft Store).",
    "Éditions console annoncées par Funcom : Standard 49,99 $, Deluxe 69,99 $, Ultimate 89,99 $.",
  ],
  links: [
    { label: "Site officiel", href: "https://duneawakening.com" },
    { label: "Steam", href: "https://store.steampowered.com/app/1172710/" },
    { label: "Discord officiel", href: "https://discord.com/servers/dune-awakening-1006265467754790943" },
    { label: "Actualités officielles", href: "https://duneawakening.com/news/" },
    { label: "Centre d’aide Funcom", href: "https://funcom.helpshift.com/hc/en/4-dune-awakening/" },
    { label: "X · @DuneAwakening", href: "https://x.com/DuneAwakening" },
    { label: "YouTube · Funcom", href: "https://www.youtube.com/funcom" },
    { label: "Funcom", href: "https://www.funcom.com" },
  ] as Link[],
  news: [
    { date: "2026-10-12", label: "12 oct. 2026", text: "Problème connu signalé par Funcom : désactiver les vers des sables ou la stabilité des constructions sur un appareil, puis se connecter sur un autre, peut les réactiver et faire perdre une progression. Conseil officiel : ne pas changer d’appareil tant que le correctif solo n’est pas publié." },
    { date: "2026-10-09", label: "9 oct. 2026", text: "Correctif 1.5.3.7 : un endroit où l’on restait coincé près de la résidence des Atréides à Arrakeen, et le bouton « Débloquer » à Arrakeen et Harko Village." },
    { date: "2026-10-06", label: "6 oct. 2026", text: "Correctif 1.5.3.6 : lancement possible sur Steam sans BattlEye pour le solo et les serveurs privés qui ne l’exigent pas ; stabilité serveur et client." },
    { date: "2026-09-30", label: "30 sept. 2026", text: "Mise à jour 1.5.15.0 ouverte sur le client de test public : contenu susceptible de changer avant publication." },
    { date: "2026-09-22", label: "22 sept. 2026", text: "Sortie sur PlayStation 5 et Xbox Series X|S, et arrivée dans le Xbox Game Pass." },
    { date: "2026-09-17", label: "17 sept. 2026", text: "Mise à jour 1.5 sur toutes les plateformes : mode solo complet, personnalisation de la partie, conclusion du Livre Un." },
  ],
  community: [
    { label: "Dune: Awakening Community Wiki", href: "https://awakening.wiki", text: "Le wiki communautaire : objets, lieux, mécaniques." },
    { label: "Cartes interactives TH.GL", href: "https://duneawakening.th.gl", text: "Hagga Basin, Arrakeen, Harko Village, désert profond ; filtres partagés, tracés, heures de réinitialisation du désert profond." },
    { label: "Base d’objets et de recettes", href: "https://dune.gaming.tools", text: "Objets, recettes, composants : où trouver quoi, et avec quoi le fabriquer." },
    { label: "Application compagnon (Windows)", href: "https://companion.gaming.tools/games/dune", text: "Carte en direct, superposition, suivi de base et de recettes. Gratuite, avec publicité." },
    { label: "Forums Steam", href: "https://steamcommunity.com/app/1172710/discussions/", text: "Discussions et annonces de correctifs." },
  ] as (Link & { text: string })[],
};

export type NetworkGroup = { id: string; title: string; links: (Link & { note?: string })[] };

export const NETWORKS: NetworkGroup[] = [
  {
    id: "films",
    title: "Films",
    links: [
      { label: "X · @dunemovie", href: "https://x.com/dunemovie", note: "Compte des films (cité par Legendary)" },
      { label: "Instagram · @dunemovie", href: "https://www.instagram.com/dunemovie" },
      { label: "Legendary Entertainment", href: "https://www.legendary.com" },
      { label: "Warner Bros.", href: "https://www.warnerbros.com" },
    ],
  },
  {
    id: "serie",
    title: "Série",
    links: [
      { label: "Dune: Prophecy — dossier officiel WBD", href: "https://press.wbd.com/na/property/dune-prophecy" },
      { label: "HBO — page de la série", href: "https://www.hbo.com/dune-prophecy" },
    ],
  },
  {
    id: "jeu",
    title: "Jeu",
    links: [
      { label: "duneawakening.com", href: "https://duneawakening.com" },
      { label: "Steam", href: "https://store.steampowered.com/app/1172710/" },
      { label: "Discord officiel", href: "https://discord.com/servers/dune-awakening-1006265467754790943" },
      { label: "X · @DuneAwakening", href: "https://x.com/DuneAwakening", note: "Cité par le kit presse Funcom" },
      { label: "YouTube · Funcom", href: "https://www.youtube.com/funcom", note: "Bandes-annonces et directs du studio" },
      { label: "Funcom", href: "https://www.funcom.com" },
    ],
  },
  {
    id: "livres",
    title: "Livres",
    links: [
      { label: "dunenovels.com", href: "https://dunenovels.com", note: "Herbert Properties LLC" },
      { label: "Brian Herbert", href: "https://brianherbertnovels.com" },
    ],
  },
];

export type Place = { id: string; name: string; x: number; y: number; kind: string; text: string; termId?: string };

/** Carte originale d'Arrakis : positions stylisées sur notre propre projection (600 × 400), aucune carte officielle reprise. */
export const PLACES: Place[] = [
  { id: "pole-nord", name: "Pôle Nord", x: 300, y: 34, kind: "Calotte", text: "De la glace mêlée de poussière, exploitée pour l’eau par les villes du nord. Les colonies impériales se serrent autour, dans les seules latitudes vivables.", termId: undefined },
  { id: "arrakeen", name: "Arrakeen", x: 262, y: 128, kind: "Capitale", text: "Première ville de la planète, au pied du Mur du Bouclier. L’astroport, le palais du gouverneur et la résidence qui attend chaque nouvelle Maison mandataire.", termId: "arrakeen" },
  { id: "carthag", name: "Carthag", x: 352, y: 104, kind: "Ville", text: "La ville-usine des Harkonnen, à quelque deux cents kilomètres au nord-est d’Arrakeen. Bâtie pour le rendement, pas pour durer.", termId: "carthag" },
  { id: "mur-du-bouclier", name: "Mur du Bouclier", x: 300, y: 176, kind: "Relief", text: "Une muraille de roche qui coupe le nord habité des grandes tempêtes du sud. Sa brèche décide des batailles : quiconque la tient contrôle Arrakeen.", termId: "mur-du-bouclier" },
  { id: "sietch-tabr", name: "Sietch Tabr", x: 196, y: 222, kind: "Sietch", text: "Communauté fremen creusée dans un massif au sud du Mur. Un refuge de plusieurs milliers d’habitants, invisible du ciel, que l’Imperium ignore.", termId: "sietch-tabr" },
  { id: "desert-profond", name: "Désert profond", x: 330, y: 300, kind: "Région", text: "Au sud, les cartes s’arrêtent. Des dunes de plusieurs centaines de mètres, des tempêtes qui durent des jours, les plus grands vers, et des sietchs que personne n’a comptés.", termId: "desert-profond" },
  { id: "pole-sud", name: "Pôle Sud", x: 300, y: 370, kind: "Calotte", text: "Officiellement inhabitable. Officieusement, le cœur du monde fremen : des réserves d’eau cachées et un rêve patient de verdure.", termId: undefined },
];

export type Era = { when: string; title: string; text: string; key?: boolean; /** Repère « vous êtes ici » (l'année du roman Dune). */ here?: boolean };

/** Chronologie indicative, en années du calendrier de la Guilde (av. G. / ap. G.), d'après les appendices des romans ; ≈ marque une estimation. */
export const TIMELINE: Era[] = [
  { when: "≈ 201 à 108 av. G.", title: "Le Jihad butlérien", text: "L’humanité se soulève contre les machines pensantes. Au bout d’un siècle de guerre, un interdit : plus aucune machine à l’image de l’esprit humain. Mentats, Navigateurs et Bene Gesserit naîtront de ce vide.", key: true },
  { when: "≈ 88 av. G.", title: "La bataille de Corrin", text: "La Maison qui l’emporte prend le nom de Corrino et le trône impérial, qu’elle gardera dix mille ans." },
  { when: "An 0", title: "Fondation de la Guilde spatiale", text: "Le monopole du voyage entre les étoiles est établi. Le calendrier de l’Imperium commence ici.", key: true },
  { when: "≈ 10 191 ap. G.", title: "Les Atréides arrivent sur Arrakis", text: "Le roman Dune s’ouvre. L’Empereur confie la planète de l’épice au duc Leto, et le piège se referme.", key: true, here: true },
  { when: "≈ 10 193 ap. G.", title: "La chute de Shaddam IV", text: "Les Fremen renversent l’ordre impérial. Un nouvel empereur, venu du désert, voit l’avenir et s’en effraie." },
  { when: "≈ 10 205 ap. G.", title: "Après douze ans de Jihad", text: "Le Messie de Dune : la guerre sainte menée au nom de Muad’Dib a embrasé l’Imperium. L’empereur cherche une sortie." },
  { when: "≈ 10 219 ap. G.", title: "Leto II monte sur le trône", text: "Les Enfants de Dune : l’un des jumeaux accepte un destin que son père avait refusé, et commence à changer de nature." },
  { when: "≈ 13 720 ap. G.", title: "La mort du Tyran", text: "L’Empereur-Dieu de Dune : après trois mille cinq cents ans de paix forcée, le Sentier d’Or s’achève. Arrakis a reverdi ; l’épice se raréfie.", key: true },
  { when: "Ensuite", title: "La Famine, puis la Dispersion", text: "Sans Tyran et presque sans épice, l’humanité se disperse vers l’inconnu. Ce qui en reviendra n’aura plus les mêmes règles." },
  { when: "≈ 15 200 ap. G.", title: "Les Hérétiques de Dune", text: "Quinze siècles après le Tyran, la Dispersion revient : les Honorées Matriarches contre le Bene Gesserit. Arrakis redevient désert." },
  { when: "≈ 15 230 ap. G.", title: "La Maison des Mères", text: "Le Bene Gesserit assiégé sur sa planète secrète. Le dernier roman de Frank Herbert se referme sur une question.", key: true },
];

export type Release = {
  id: string;
  kind: string;
  title: string;
  /** ISO (AAAA-MM-JJ) ; null si la date n'est pas annoncée. */
  date: string | null;
  where: string;
  note?: string;
  links?: Link[];
};

export const RELEASES: Release[] = [
  { id: "dune-3", kind: "Film", title: "Dune : Troisième Partie", date: "2026-12-16", where: "Sortie en France", note: "États-Unis : 18 décembre 2026. Warner Bros. · Legendary.", links: [{ label: "X · @dunemovie", href: "https://x.com/dunemovie" }] },
  { id: "awakening-japon", kind: "Jeu", title: "Dune: Awakening au Japon", date: "2026-10-29", where: "PS5, éditions physique et numérique (Spike Chunsoft)", links: [{ label: "Site officiel", href: "https://duneawakening.com" }] },
  { id: "prophecy-s2", kind: "Série", title: "Dune: Prophecy — saison 2", date: null, where: "HBO", note: "Tournage lancé le 11 novembre 2025 (communiqué Warner Bros. Discovery), huit épisodes. HBO l’avait inscrite dans sa bande-annonce « 2026 » ; en octobre 2026, la presse penche pour 2027.", links: [{ label: "Dossier officiel WBD", href: "https://press.wbd.com/na/property/dune-prophecy" }] },
  { id: "awakening-consoles", kind: "Jeu", title: "Dune: Awakening sur PS5 et Xbox Series X|S", date: "2026-09-22", where: "Sortie consoles", note: "Mode solo complet, Xbox Game Pass le même jour.", links: [{ label: "Site officiel", href: "https://duneawakening.com" }] },
  { id: "reprise-2026", kind: "Film", title: "Dune et Dune : Deuxième Partie de retour en salles", date: "2026-11-11", where: "Ressortie en France", note: "Les deux premiers volets ressortent avant la Troisième Partie, à l’initiative de Warner. Séances à venir.", links: [{ label: "X · @dunemovie", href: "https://x.com/dunemovie" }] },
  { id: "lynch-reprise", kind: "Film", title: "Dune (1984) de retour en salles", date: "2026-05-13", where: "Ressortie en France" },
];

/* ---- C2 · Compte à rebours de la console ------------------------------------------------------------------ */

/**
 * Dune : Troisième Partie — dates ISO pour le compte à rebours de la console (jours civils calculés chez le visiteur).
 * Ce sont les mêmes dates que FILMS (villeneuve-2026) et RELEASES (dune-3), vérifiées le 18/10/2026 (docs/sources.md) ;
 * un test unitaire garantit qu'elles restent identiques. À corriger ici aussi si les dates changent.
 */
export const PART_THREE = {
  filmId: "villeneuve-2026",
  releaseId: "dune-3",
  title: "Dune : Troisième Partie",
  /** Sortie en France (AAAA-MM-JJ). */
  fr: "2026-12-16",
  /** Sortie aux États-Unis (AAAA-MM-JJ). */
  us: "2026-12-18",
} as const;

/* ---- C2 · Guide de lecture interactif --------------------------------------------------------------------- */

export type ReadingQuestionId = "films" | "envie" | "rythme";
export type ReadingOption = { id: string; label: string };
export type ReadingQuestion = { id: ReadingQuestionId; label: string; options: ReadingOption[] };

/** Trois questions courtes, à boutons ; chaque combinaison de réponses mène à un parcours de READING_PATHS. */
export const READING_QUESTIONS: ReadingQuestion[] = [
  { id: "films", label: "Vous avez vu les films de Denis Villeneuve ?", options: [{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }] },
  { id: "envie", label: "Vous cherchez :", options: [{ id: "histoire", label: "Une seule histoire complète" }, { id: "saga", label: "Toute la saga" }, { id: "origines", label: "L’origine de l’univers" }] },
  { id: "rythme", label: "Plutôt :", options: [{ id: "dense", label: "Un roman dense" }, { id: "rapide", label: "Une lecture plus rapide" }] },
];

export type ReadingAnswers = Partial<Record<ReadingQuestionId, string>>;

export type ReadingPath = {
  id: string;
  /** Réponses requises (identifiants d'options) ; une question absente accepte toute réponse. */
  match: ReadingAnswers;
  /** Titre par lequel commencer : un roman de NOVELS (titre français) ou un livre d'EXPANDED (titre original). */
  start: string;
  /** Auteur(s), année de parution (docs/sources.md), cycle. */
  meta: string;
  /** Ordre suggéré, une étape par entrée. */
  order: string[];
  /** Pourquoi, en deux ou trois lignes — texte écrit pour ce site, sans citation des livres. */
  why: string;
};

const SIX = ["Dune", "Le Messie de Dune", "Les Enfants de Dune", "L’Empereur-Dieu de Dune", "Les Hérétiques de Dune", "La Maison des Mères"];
const ORIGINS_ORDER = [
  "Legends of Dune : The Butlerian Jihad, The Machine Crusade, The Battle of Corrin",
  "Great Schools of Dune : Sisterhood of Dune, Mentats of Dune, Navigators of Dune",
  "Dune, pour mesurer dix mille ans plus tard ce qu’il en reste",
];
const SCHOOLS_ORDER = [
  "Great Schools of Dune : Sisterhood of Dune, Mentats of Dune, Navigators of Dune",
  "Legends of Dune, pour remonter encore — ou Dune, pour redescendre",
];

/** Les douze parcours (2 × 3 × 2 réponses) : le premier dont toutes les conditions sont remplies l'emporte. */
export const READING_PATHS: ReadingPath[] = [
  {
    id: "relire-dune",
    match: { films: "oui", envie: "histoire", rythme: "dense" },
    start: "Dune",
    meta: "Frank Herbert · 1965",
    order: ["Dune, appendices compris", "Le Messie de Dune, si l’envie de la suite vient"],
    why: "Les deux films suivent le premier roman ; le livre, lui, donne ce que l’écran tait : les pensées de chacun, les appendices, le glossaire. Même en connaissant la fin, c’est une histoire complète — et elle n’a pas besoin de suite.",
  },
  {
    id: "messie-direct",
    match: { films: "oui", envie: "histoire", rythme: "rapide" },
    start: "Le Messie de Dune",
    meta: "Frank Herbert · 1969",
    order: ["Le Messie de Dune", "Les Enfants de Dune, pour refermer l’histoire de la famille", "Dune, plus tard, pour revenir au début"],
    why: "Les films vous ont raconté le premier roman ; inutile de le relire pour comprendre la suite. Le Messie reprend douze ans plus tard : un livre court, qui dit le prix de la victoire. Les Enfants referme ensuite l’histoire de la famille.",
  },
  {
    id: "dune-seul",
    match: { films: "non", envie: "histoire", rythme: "dense" },
    start: "Dune",
    meta: "Frank Herbert · 1965",
    order: ["Dune, appendices compris — rien d’autre n’est nécessaire"],
    why: "Le premier roman est une histoire entière, avec sa fin. Lisez-le sans rien autour, appendices compris : le glossaire de la fin répond à la plupart des questions. Si l’envie vient ensuite, Le Messie de Dune attend douze ans plus tard.",
  },
  {
    id: "films-puis-dune",
    match: { films: "non", envie: "histoire", rythme: "rapide" },
    start: "Dune",
    meta: "Frank Herbert · 1965",
    order: ["Les deux films de Denis Villeneuve (2021, 2024), en guise de carte", "Dune, le roman"],
    why: "Pas de raccourci : le premier roman est la seule porte, mais il se suffit à lui-même. Pour aller plus vite, voyez d’abord les deux films : ils racontent ce même livre, en deux moitiés. Le texte, ensuite, file — et l’on y découvre tout ce que l’écran a laissé de côté.",
  },
  {
    id: "saga-complete-films",
    match: { films: "oui", envie: "saga", rythme: "dense" },
    start: "Dune",
    meta: "Frank Herbert · 1965 — puis les cinq suivants, jusqu’en 1985",
    order: SIX,
    why: "Les films vous ont donné le premier roman en images ; le livre, lui, pose tout ce que les cinq suivants déploient. Ordre de publication, sans sauter : chaque roman change le sens du précédent, et Frank Herbert a écrit les six en vingt ans. L’univers étendu vient après, jamais avant.",
  },
  {
    id: "saga-complete",
    match: { films: "non", envie: "saga", rythme: "dense" },
    start: "Dune",
    meta: "Frank Herbert · 1965 — puis les cinq suivants, jusqu’en 1985",
    order: SIX,
    why: "L’ordre de publication est le bon : chaque roman change le sens du précédent, et Frank Herbert les a écrits en vingt ans, de 1965 à 1985. Les trois premiers forment un arc ; le quatrième saute trois millénaires et change de registre ; les deux derniers vont ensemble. L’univers étendu vient après, jamais avant.",
  },
  {
    id: "saga-depuis-messie",
    match: { films: "oui", envie: "saga", rythme: "rapide" },
    start: "Le Messie de Dune",
    meta: "Frank Herbert · 1969",
    order: [...SIX.slice(1), "Dune, pour finir par le commencement"],
    why: "Puisque les films vous ont raconté le premier roman, entrez dans la saga par sa suite : Le Messie, court, puis Les Enfants, et ainsi de suite dans l’ordre de publication. Revenez à Dune quand vous voudrez le texte lui-même — il n’aura rien perdu.",
  },
  {
    id: "saga-en-deux-temps",
    match: { films: "non", envie: "saga", rythme: "rapide" },
    start: "Dune",
    meta: "Frank Herbert · 1965",
    order: [...SIX.slice(0, 3), "— une pause, aussi longue qu’il faut —", ...SIX.slice(3)],
    why: "Toute la saga, mais en deux temps. Les trois premiers romans se lisent d’affilée et referment l’histoire de la famille ; beaucoup s’arrêtent là, sans regret. Les trois derniers changent d’époque et de registre : reprenez-les plus tard, l’un après l’autre.",
  },
  {
    id: "origines-jihad",
    match: { films: "oui", envie: "origines", rythme: "dense" },
    start: "The Butlerian Jihad",
    meta: "Brian Herbert et Kevin J. Anderson · 2002 · cycle Legends of Dune",
    order: ORIGINS_ORDER,
    why: "Dix mille ans avant les films : la guerre contre les machines pensantes, puis la naissance des grandes écoles. Six romans dans l’ordre de l’histoire, écrits de 2002 à 2016. Comme les films vous ont donné le récit principal, ces origines ne vous gâcheront aucune surprise.",
  },
  {
    id: "origines-jihad-avertissement",
    match: { films: "non", envie: "origines", rythme: "dense" },
    start: "The Butlerian Jihad",
    meta: "Brian Herbert et Kevin J. Anderson · 2002 · cycle Legends of Dune",
    order: ORIGINS_ORDER,
    why: "Dix mille ans avant Dune : la guerre contre les machines pensantes, puis la naissance des grandes écoles — six romans dans l’ordre de l’histoire. Un avertissement, pourtant : ces préquelles expliquent ce que Frank Herbert laissait dans l’ombre. Si le mystère vous importe, lisez d’abord Dune, puis revenez ici.",
  },
  {
    id: "origines-ecoles",
    match: { films: "oui", envie: "origines", rythme: "rapide" },
    start: "Sisterhood of Dune",
    meta: "Brian Herbert et Kevin J. Anderson · 2012 · cycle Great Schools of Dune",
    order: SCHOOLS_ORDER,
    why: "Trois romans au lieu de six : le chemin le plus court vers la fondation des grandes écoles — Sœurs, Mentats, Navigateurs —, et c’est le cycle dont s’inspire la série Dune: Prophecy. La guerre contre les machines, racontée dans Legends of Dune, peut attendre.",
  },
  {
    id: "origines-ecoles-avertissement",
    match: { films: "non", envie: "origines", rythme: "rapide" },
    start: "Sisterhood of Dune",
    meta: "Brian Herbert et Kevin J. Anderson · 2012 · cycle Great Schools of Dune",
    order: SCHOOLS_ORDER,
    why: "Trois romans au lieu de six : la fondation des grandes écoles, le cycle dont s’inspire la série Dune: Prophecy. Mais ces préquelles racontent ce que Frank Herbert laissait dans l’ombre : sans avoir lu ni vu Dune, vous lisez l’histoire à l’envers. Cela se fait — sachez-le seulement.",
  },
];

/** Parcours recommandé pour un jeu de réponses complet ; null tant qu'une question reste sans réponse. */
export function recommendReading(answers: ReadingAnswers): ReadingPath | null {
  if (READING_QUESTIONS.some((q) => !answers[q.id])) return null;
  return READING_PATHS.find((p) => (Object.keys(p.match) as ReadingQuestionId[]).every((k) => answers[k] === p.match[k])) ?? null;
}
