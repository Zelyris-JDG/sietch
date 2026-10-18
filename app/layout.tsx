import type { Metadata, Viewport } from "next";
import { archivo, cormorant, cormorantRoman, plexMono } from "./fonts";
import { site, storageKeys } from "../src/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.shortTitle}` },
  description: site.description,
  applicationName: site.name,
  // Préversion : jamais indexée tant que Johan n'a pas dit « mets en ligne » (hypothèse H3).
  robots: { index: false, follow: false },
  openGraph: { type: "website", locale: site.locale, siteName: site.shortTitle, title: site.title, description: site.description, url: site.url, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Le long-courrier de la Guilde au-dessus d’Arrakis, vu depuis sa soute : image originale du site." }] },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#0b0908",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Ciel réel et mouvement réduit posés AVANT le premier rendu (aucun flash) — hypothèse H9. */
const bootScript = `(function(){try{var h=new Date().getHours(),s=(h>=7&&h<17)?"day":((h>=17&&h<20)||(h>=5&&h<7))?"dusk":"night";var q=new URLSearchParams(location.search).get("ciel");var m={jour:"day",crepuscule:"dusk",nuit:"night"};if(q&&m[q])s=m[q];var d=document.documentElement;d.setAttribute("data-sky",s);if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-motion","reduce");try{if(sessionStorage.getItem("${storageKeys.introSeen}")==="1")d.setAttribute("data-intro","seen");}catch(e){}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-sky="night" suppressHydrationWarning className={`${archivo.variable} ${cormorant.variable} ${cormorantRoman.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Aller au contenu</a>
        {children}
      </body>
    </html>
  );
}
