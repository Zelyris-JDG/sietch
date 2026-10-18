import localFont from "next/font/local";

/**
 * Polices SIL OFL auto-hébergées (src/fonts/, licences à côté). Aucun appel à Google Fonts à l'affichage.
 * Depuis C2, les fichiers sont des sous-ensembles latins et des instances partielles (Archivo : graisses 300–500,
 * largeurs 100–125 % ; Cormorant : 300–500), renommés selon l'OFL (versions modifiées) : 90 → 38 ko pour Archivo.
 * Voir docs/sources.md (« Licences techniques »). Les graisses et largeurs déclarées ici doivent couvrir celles du CSS.
 */
export const archivo = localFont({
  src: [{ path: "../src/fonts/archivo-variable-normal.woff2", weight: "300 500", style: "normal" }],
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/* Les épigraphes sont en italique : seul l'italique est préchargé (élément visible dès le héro) ; le romain
   n'est téléchargé que s'il sert. */
export const cormorant = localFont({
  src: [{ path: "../src/fonts/cormorant-garamond-variable-italic.woff2", weight: "300 500", style: "italic" }],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});

export const cormorantRoman = localFont({
  src: [{ path: "../src/fonts/cormorant-garamond-variable-normal.woff2", weight: "300 500", style: "normal" }],
  variable: "--font-cormorant-roman",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const plexMono = localFont({
  src: [
    { path: "../src/fonts/plexmono-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../src/fonts/plexmono-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
});
