/**
 * Emplacements d'images du site (docs/medias.md) : déclaration pure, sans accès disque, importable côté client.
 * L'identifiant est stable et sert de nom de fichier attendu dans `public/images/` (`<id>.<extension acceptée>`).
 * Quand le fichier manque, l'emplacement garde son rendu procédural : rien ne change à l'écran.
 * La détection des fichiers présents est faite côté serveur, au build : `src/lib/media.server.ts`.
 */
export type MediaId =
  | "orbit-dawn"
  | "planet-surface-macro"
  | "storm-wall"
  | "dunes-ridge"
  | "spice-sand"
  | "basalt-wall"
  | "shield-wall"
  | "polar-ice"
  | "two-moons-night"
  | "cavern-light"
  | "rock-outcrop"
  | "dusk-sand";

export type MediaSlot = {
  /** Identifiant stable = nom de fichier attendu, sans extension (`public/images/<id>.png`). */
  id: MediaId;
  /** Numéro dans le tableau de docs/medias.md. */
  n: number;
  /** Texte alternatif en français, utilisé quand l'image est un contenu (fiches de la carte) ; les fonds décoratifs passent alt="". */
  alt: string;
  /** Dimensions attendues (pixels). */
  width: number;
  height: number;
  /** Où l'image s'affiche une fois déposée. */
  usage: string;
};

/**
 * Extensions acceptées, de la source la plus riche à la plus compressée. La première trouvée sert de source à
 * `next/image`, qui en tire lui-même l'AVIF/WebP servi (next.config.ts, `images.formats`) : partir du PNG évite
 * de compresser deux fois. Les `.webp`/`.avif` écrits par `pnpm medias` restent utiles aux usages hors next/image.
 */
export const MEDIA_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif"] as const;
export type MediaExtension = (typeof MEDIA_EXTENSIONS)[number];

/** Chemin public d'un fichier accepté. */
export function mediaPath(id: MediaId, ext: MediaExtension): string {
  return `/images/${id}.${ext}`;
}

const WIDE = { width: 2560, height: 1440 } as const;

export const MEDIA: readonly MediaSlot[] = [
  { id: "orbit-dawn", n: 1, ...WIDE, alt: "Arrakis vue depuis l’orbite basse : un globe de sable ocre et beige, le terminateur entre jour et nuit, une fine atmosphère orangée sur le limbe.", usage: "Version calme de la scène 1 (couche « espace » du monde calme) ; image de partage à venir." },
  { id: "planet-surface-macro", n: 2, ...WIDE, alt: "Désert d’Arrakis vu du ciel : dunes longitudinales striées d’ombres rasantes, affleurements de roche noire.", usage: "Version calme : texture du limbe de la planète (couche « planète », masquée en disque). Texture du nuanceur WebGL : chantier suivant." },
  { id: "storm-wall", n: 3, ...WIDE, alt: "Mur de tempête de poussière brun orangé avançant sur une plaine de sable, sous une lumière diffuse.", usage: "Version calme de la scène 2 (couche « tempête »), à l’horizontale." },
  { id: "dunes-ridge", n: 4, ...WIDE, alt: "Dunes immenses au couchant, ombres longues bleutées, un voile de sable arraché à la crête.", usage: "Version calme de la scène 3 (couche « dunes »), à l’horizontale ; arrière-plan du pied de page à venir." },
  { id: "spice-sand", n: 5, ...WIDE, alt: "Sable fin mêlé de grains ambrés et cuivrés brillants, en très gros plan, lumière chaude rasante.", usage: "Version calme de la scène 4 (couche « épice ») ; fond discret de la section « L’épice » (MediaBackdrop)." },
  { id: "basalt-wall", n: 6, ...WIDE, alt: "Paroi de roche volcanique noire finement texturée, légèrement humide, éclairée d’en haut.", usage: "Version calme des sections souterraines (couche « roche » : Maisons, Sietch)." },
  { id: "shield-wall", n: 7, ...WIDE, alt: "Falaises monumentales de roche brune dressées au-dessus d’une plaine de sable, dans la brume de chaleur.", usage: "Vignette de la fiche « Mur du Bouclier » de la carte d’Arrakis." },
  { id: "polar-ice", n: 8, ...WIDE, alt: "Calotte de glace sale et de roche sombre sur une planète désertique, vue d’avion, lumière rasante et froide.", usage: "Vignette des fiches « Pôle Nord » et « Pôle Sud » de la carte." },
  { id: "two-moons-night", n: 9, ...WIDE, alt: "Nuit profonde sur le désert : deux lunes de tailles différentes dans un ciel bleu nuit étoilé, dunes bleutées.", usage: "Version calme de la prescience et du pied de page (couche « nuit »)." },
  { id: "cavern-light", n: 10, ...WIDE, alt: "Intérieur d’une grotte de roche brune : un rai de lumière chaude tombe d’une faille sur un sol de sable, poussière en suspension.", usage: "Entrée de la section « Le Sietch » (MediaBackdrop, haut de la section)." },
  { id: "rock-outcrop", n: 11, ...WIDE, alt: "Affleurement rocheux isolé dans un désert immense, à midi, ombres très courtes, ciel blanc de chaleur.", usage: "Vignette de la fiche « Désert profond » de la carte. Variante « jour écrasant » du ciel réel : chantier suivant." },
  { id: "dusk-sand", n: 12, width: 1440, height: 2560, alt: "Dunes à la tombée du jour, ciel dégradé de l’orange à l’indigo, un filet de sable coulant d’une crête.", usage: "Version calme sur téléphone (écran en hauteur) : remplace les images 3 et 4 dans les couches « tempête » et « dunes »." },
];

export const MEDIA_BY_ID = Object.fromEntries(MEDIA.map((m) => [m.id, m])) as Record<MediaId, MediaSlot>;

/** Chemins publics des images présentes (`/images/<id>.<ext>`), calculés côté serveur ; une clé absente = fichier manquant. */
export type MediaPaths = Partial<Record<MediaId, string>>;
