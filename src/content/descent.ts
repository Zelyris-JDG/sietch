/**
 * Textes de la descente (page principale). Tous originaux. Syntaxe des termes du lexique : [[id|texte affiché]]
 * ou [[id]] (le mot du lexique est alors affiché). Épigraphes signées « — Carnets du Sietch » : écrites pour ce site.
 */
export type Epigraph = { text: string; sign: string };
export type Scene = {
  id: "orbite" | "entree" | "desert" | "epice" | "maisons" | "sietch" | "prescience";
  index: string;
  kicker: string;
  title: string;
  epigraph: Epigraph;
  paragraphs: string[];
  aside?: string;
};

const SIGN = "Carnets du Sietch";

export const SCENES_CONTENT: Scene[] = [
  {
    id: "orbite",
    index: "01",
    kicker: "Arrakis · orbite basse",
    title: "Le refuge des fans",
    epigraph: { text: "Tout ce qui tombe sur Arrakis finit dans le sable. Le reste apprend à marcher.", sign: SIGN },
    paragraphs: [
      "Vous êtes dans la soute d'un [[long-courrier|long-courrier]] de la [[guilde|Guilde spatiale]]. Sous vous, la seule planète où naît l'[[epice|épice]]. Autour de vous, des coques plus grandes que des villes, et des feux de position qui n'éclairent rien.",
      "Descendez.",
    ],
  },
  {
    id: "entree",
    index: "02",
    kicker: "Entrée atmosphérique",
    title: "Le ciel se négocie",
    epigraph: { text: "Le ciel d'Arrakis ne se traverse pas. Il se négocie.", sign: SIGN },
    paragraphs: [
      "La frégate quitte l'ombre du vaisseau. [[arrakis|Arrakis]] grandit : une sphère d'ocre sans mer ni forêt, deux calottes de glace sale aux pôles et, entre les deux, du sable à perte de monde.",
      "Puis la poussière se lève. Une [[coriolis|tempête de Coriolis]] peut arracher la chair des os ; la nôtre nous rend seulement aveugles, le temps de descendre.",
    ],
  },
  {
    id: "desert",
    index: "03",
    kicker: "Le désert profond",
    title: "Marchez sans rythme",
    epigraph: { text: "Ici, le silence n'est pas vide. Il écoute.", sign: SIGN },
    paragraphs: [
      "Des dunes hautes comme des collines. Le vent qui fume sur les crêtes. Et, quelque part sous vos pieds, une chose immense qui perçoit chaque pas régulier.",
      "Les [[fremen|Fremen]] n'ont qu'une règle pour traverser le [[desert-profond|désert profond]] : ne jamais marcher en cadence. Un pas, une pause, deux pas. Comme le sable que le vent déplace.",
    ],
    aside: "Le ver n'apparaît jamais sur ce site. On le sent : le sable ondule, le sol vibre, quelque chose gronde.",
  },
  {
    id: "epice",
    index: "04",
    kicker: "Le mélange",
    title: "L'épice",
    epigraph: { text: "Une pincée de cannelle, dit-on. Puis un empire entier qui ne peut plus s'en passer.", sign: SIGN },
    paragraphs: [
      "L'[[epice|épice]] prolonge la vie, ouvre l'esprit, et permet aux [[navigateur|Navigateurs]] de la Guilde de replier l'espace sans jeter leurs vaisseaux dans une étoile. Elle n'existe que sur Arrakis, où elle naît du cycle des [[ver|vers des sables]].",
      "Qui tient Arrakis tient l'[[imperium|Imperium]]. Voilà toute l'histoire de Dune, et la raison pour laquelle une famille, les [[atreides|Atréides]], y fut envoyée pour périr.",
    ],
  },
  {
    id: "maisons",
    index: "05",
    kicker: "Les Maisons et les ordres",
    title: "Qui tient le sable",
    epigraph: { text: "Un emblème n'est qu'une promesse peinte sur un bouclier.", sign: SIGN },
    paragraphs: [
      "Trois Maisons, un peuple, un ordre et un monopole se partagent l'histoire d'Arrakis. Les emblèmes ci-dessous sont les nôtres, dessinés pour ce refuge : ils n'imitent aucune armoirie officielle.",
    ],
  },
  {
    id: "sietch",
    index: "06",
    kicker: "Le Sietch",
    title: "La console",
    epigraph: { text: "Un refuge se juge à ce qu'on y trouve quand on a soif.", sign: SIGN },
    paragraphs: [
      "La partie utile. Les films, les livres par où commencer, le jeu, les réseaux officiels, une carte d'Arrakis et dix mille ans d'histoire. Tous les liens s'ouvrent dans un nouvel onglet.",
    ],
  },
  {
    id: "prescience",
    index: "07",
    kicker: "Prescience",
    title: "Ce qui vient",
    epigraph: { text: "Voir l'avenir n'est pas le choisir. C'est seulement cesser d'être surpris.", sign: SIGN },
    paragraphs: [
      "Prenez l'[[epice|épice]] : le refuge bascule dans le bleu de l'[[ibad|Ibad]] et compte les jours jusqu'aux prochaines sorties. Un clic suffit pour revenir au présent.",
    ],
  },
];
