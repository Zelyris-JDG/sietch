"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import { SCENES, type SceneId } from "../../src/lib/store";
import type { MediaId, MediaPaths } from "../../src/config/media";
import "./media.css";

/**
 * Monde « calme » : des couches fixes (dégradés, dunes en SVG) qui se fondent selon la scène courante
 * (attribut data-section posé par le rail). Sert de repli sans WebGL, en mouvement réduit et sur appareil faible ;
 * c'est une version complète de l'expérience, pas un message d'erreur.
 *
 * `images` (facultatif) : chemins publics des images de docs/medias.md présentes dans public/images/, calculés côté
 * serveur (src/lib/media.server.ts). Chaque couche superpose alors son image, fondue par l'opacité existante de la
 * couche (app/globals.css). Sans image, le balisage est exactement celui d'avant : rien ne change à l'écran.
 */

type Layer = {
  cls: string;
  /** Image horizontale (2560 × 1440). */
  wide?: MediaId;
  /** Image verticale (1440 × 2560) servie à la place quand l'écran est en hauteur (téléphone). */
  tall?: MediaId;
  /** Première scène où la couche devient visible : l'image est montée une scène avant, pas plus tôt. */
  from: SceneId;
  /** Image du héro : montée dès le rendu serveur, préchargée (seul poids ajouté au chemin critique, et seulement si elle existe). */
  eager?: boolean;
};

const LAYERS: readonly Layer[] = [
  { cls: "sw--space", wide: "orbit-dawn", from: "orbite", eager: true },
  { cls: "sw--planet", wide: "planet-surface-macro", from: "orbite" },
  { cls: "sw--storm", wide: "storm-wall", tall: "dusk-sand", from: "entree" },
  { cls: "sw--dunes", wide: "dunes-ridge", tall: "dusk-sand", from: "desert" },
  { cls: "sw--spice", wide: "spice-sand", from: "epice" },
  { cls: "sw--rock", wide: "basalt-wall", from: "maisons" },
  { cls: "sw--night", wide: "two-moons-night", from: "prescience" },
];

/**
 * Indice de la scène la plus profonde atteinte (data-section sur <html>), monotone : une image montée reste montée
 * quand le visiteur remonte. Rendu serveur et premier rendu client : 0 (orbite), pour une hydratation identique.
 * N'observe rien quand il n'y a aucune image.
 */
function useDeepestSection(active: boolean): number {
  const [reached, setReached] = useState(0);
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const read = () => {
      const s = html.dataset.section as SceneId | undefined;
      const i = s ? Math.max(0, SCENES.indexOf(s)) : 0;
      setReached((prev) => Math.max(prev, i));
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(html, { attributes: true, attributeFilter: ["data-section"] });
    return () => obs.disconnect();
  }, [active]);
  return reached;
}

/** Une image de couche : `next/image` seul quand il n'y a qu'une horizontale ; sinon un <picture> qui choisit la verticale en hauteur. */
function LayerImage({ wide, tall, eager }: { wide?: string; tall?: string; eager?: boolean }) {
  if (wide && !tall) return <Image src={wide} alt="" fill sizes="100vw" priority={eager} className="sw__img" />;
  const base = { alt: "", fill: true as const, sizes: "100vw" };
  const fallback = wide ?? tall;
  if (!fallback || !tall) return null;
  const { props: w } = getImageProps({ ...base, src: fallback });
  const { props: t } = getImageProps({ ...base, src: tall });
  return (
    <picture>
      <source media="(orientation: portrait)" srcSet={t.srcSet} sizes={t.sizes} />
      <img {...w} alt="" className={wide ? "sw__img" : "sw__img sw__img--portrait"} />
    </picture>
  );
}

export function StillWorld({ images }: { images?: MediaPaths }) {
  const hasImages = !!images && Object.keys(images).length > 0;
  const reached = useDeepestSection(hasImages);
  const src = (id?: MediaId) => (id && images?.[id]) || undefined;
  // Montée quand la scène est atteinte, ou une scène avant (préchargement discret) — sauf depuis le héro, où seule
  // l'image du héro est chargée : rien d'autre ne concurrence le premier écran.
  const wanted = (l: Layer) => {
    if (!hasImages) return false;
    if (l.eager) return true;
    const from = SCENES.indexOf(l.from);
    return reached >= from || (reached >= 1 && reached >= from - 1);
  };
  return (
    <div className="still-world" aria-hidden="true">
      {LAYERS.map((l) => (
        <div key={l.cls} className={`sw ${l.cls}`}>
          {l.cls === "sw--dunes" && (
            <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
              <defs>
                <linearGradient id="swsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1a10" /><stop offset="1" stopColor="#8a5a2a" /></linearGradient>
                <linearGradient id="swd1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c99a5b" /><stop offset="1" stopColor="#7a4a1f" /></linearGradient>
                <linearGradient id="swd2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b07f44" /><stop offset="1" stopColor="#4a2a12" /></linearGradient>
                <linearGradient id="swd3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2412" /><stop offset="1" stopColor="#1a100a" /></linearGradient>
              </defs>
              <rect width="1440" height="900" fill="url(#swsky)" />
              <path d="M0 560 C 260 470, 420 640, 700 540 S 1120 430, 1440 520 V900 H0 Z" fill="url(#swd1)" />
              <path d="M0 680 C 200 620, 460 760, 760 660 S 1180 600, 1440 690 V900 H0 Z" fill="url(#swd2)" />
              <path d="M0 800 C 300 740, 600 860, 900 790 S 1300 760, 1440 820 V900 H0 Z" fill="url(#swd3)" />
            </svg>
          )}
          {wanted(l) && (src(l.wide) || src(l.tall)) && <LayerImage wide={src(l.wide)} tall={src(l.tall)} eager={l.eager} />}
        </div>
      ))}
    </div>
  );
}
