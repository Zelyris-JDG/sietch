import localFont from "next/font/local";

/** Polices SIL OFL auto-hébergées (src/fonts/, licences à côté). Aucun appel à Google Fonts à l'affichage. */
export const archivo = localFont({
  src: [{ path: "../src/fonts/archivo-variable-normal.woff2", weight: "100 900", style: "normal" }],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const cormorant = localFont({
  src: [
    { path: "../src/fonts/cormorant-garamond-variable-normal.woff2", weight: "300 700", style: "normal" },
    { path: "../src/fonts/cormorant-garamond-variable-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
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
