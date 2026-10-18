/**
 * Mentions légales — reprise de la page de zelyris.fr (dépôt Zelyris, src/content/legal.ts + src/config/business.ts,
 * version « 2 octobre 2026 »), adaptée au seul nom de ce site. Hypothèse H4 (docs/BIBLE.md) : zelyris.fr étant inaccessible
 * depuis la session, la source est le code qui génère la page en ligne ; Johan la relit une fois en ligne.
 * Ne rien inventer ici : toute donnée absente reste absente.
 */
import { site } from "../config/site";

export const publisher = {
  legalName: "Johan De Grave",
  legalForm: "Entrepreneur individuel",
  tradeName: "Zelyris",
  publicationDirector: "Johan De Grave",
  siren: "838 973 626",
  siret: "838 973 626 00024",
  apeCode: "6201Z",
  activityNature: "Activité libérale non réglementée",
  activityDescription:
    "Création, développement, personnalisation, maintenance et mise à jour de sites internet, applications et outils logiciels pour professionnels et particuliers ; conception de tableaux de bord et d’outils internes de gestion ; automatisation de processus numériques ; intégration et configuration de solutions logicielles et d’outils d’intelligence artificielle.",
  address: "172 rue Raimon de Trencavel, Résidence Clos des Muses, Bât. E2, 34070 Montpellier, France",
  email: "contact@zelyris-tech.com",
  phone: "06 20 00 12 27",
  siteUrl: "https://zelyris.fr",
  vatMention: "TVA non applicable, article 293 B du CGI",
} as const;

/** Hébergeur — relevé par Zelyris le 23/08/2026 sur la page légale publique de Vercel. */
export const hostingProvider = {
  name: "Vercel Inc.",
  address: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
  site: "https://vercel.com",
} as const;

export type LegalSection = { heading: string; paragraphs?: string[]; list?: string[] };

export const legalSections: LegalSection[] = [
  {
    heading: "Éditeur du site",
    list: [
      `${publisher.legalName} — ${publisher.legalForm}`,
      `Nom commercial : ${publisher.tradeName}`,
      `SIREN : ${publisher.siren}`,
      `SIRET : ${publisher.siret}`,
      `Code APE : ${publisher.apeCode}`,
      `Adresse : ${publisher.address}`,
      `E-mail : ${publisher.email}`,
      `Téléphone : ${publisher.phone}`,
      `Site : ${publisher.siteUrl}`,
    ],
  },
  { heading: "Directeur de la publication", paragraphs: [publisher.publicationDirector] },
  { heading: "Activité", paragraphs: [publisher.activityNature, publisher.activityDescription] },
  { heading: "TVA", paragraphs: [`${publisher.vatMention}.`] },
  { heading: "Hébergement", list: [hostingProvider.name, hostingProvider.address, hostingProvider.site] },
  { heading: "Contact", paragraphs: [`Toute demande relative au site peut être adressée à ${publisher.email} ou au ${publisher.phone}.`] },
  {
    heading: "Site de fan non officiel",
    paragraphs: [
      site.disclaimer,
      "Aucun élément officiel n'est reproduit : ni logo, ni image, ni son, ni extrait des films, de la série ou du jeu. Les paysages, vaisseaux et emblèmes de ce site sont des créations originales ; les épigraphes signées « Carnets du Sietch » sont écrites pour ce site. Les noms et le vocabulaire de l'univers sont cités à titre de référence culturelle. Les liens vers les sites officiels sont fournis pour information et s'ouvrent dans un nouvel onglet.",
      "Si vous êtes titulaire de droits et souhaitez le retrait d'un contenu, écrivez à l'adresse ci-dessus : il sera retiré sans délai.",
    ],
  },
  {
    heading: "Propriété intellectuelle",
    paragraphs: [
      "Les textes, visuels originaux, mises en page et code de ce site sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable est interdite.",
    ],
  },
  {
    heading: "Données personnelles",
    paragraphs: [
      "Ce site ne collecte aucune donnée personnelle, ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience. Trois informations sont mémorisées uniquement dans votre navigateur, sans identifiant : le son (activé ou coupé), le message du ver déjà découvert, et l'introduction déjà vue (le temps d'une session). Elles peuvent être effacées depuis ses réglages.",
    ],
  },
];
