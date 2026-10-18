/** Identité du site — source unique. Adresse de production : à définir (hypothèse H6, docs/BIBLE.md). */
export const site = {
  name: "Sietch",
  title: "Sietch — Le Refuge des fans de Dune",
  shortTitle: "Sietch — Le Refuge des fans",
  description:
    "Un refuge non officiel pour les fans de l'univers de Dune : une descente depuis l'orbite d'Arrakis jusqu'au sable, puis le Sietch — films, livres, Dune: Awakening, carte d'Arrakis, chronologie et lexique.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sietch.zelyris.fr",
  locale: "fr_FR",
  maker: { name: "Zelyris", url: "https://zelyris.fr" },
  disclaimer:
    "Site de fan non officiel, sans lien avec Herbert Properties LLC, Legendary Entertainment, Warner Bros. ou Funcom. Dune et les marques associées appartiennent à leurs propriétaires.",
} as const;

/** Clés de mémorisation côté navigateur (jamais de donnée personnelle). */
export const storageKeys = {
  sound: "sietch-son",
  wormDiscovered: "sietch-ver-decouvert",
  introSeen: "sietch-intro",
} as const;
