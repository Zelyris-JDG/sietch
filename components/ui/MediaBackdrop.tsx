import Image from "next/image";

/**
 * Fond d'image décoratif d'une section (emplacements 5 « L'épice » et 10 « Le Sietch » de docs/medias.md).
 * Rendu nul sans `src` : aucun changement visuel tant que le fichier manque.
 *
 * À placer en premier enfant d'une `section.scene` (position: relative ; z-index: 1 — un contexte d'empilement) :
 * en `z-index: -2`, il passe sous le voile des sections plates (`.scene__veil`, z-index -1, basalte à 80 %) et sous
 * le contenu, au-dessus du fond transparent de la section. Composant serveur : pas d'état, `next/image` en `fill`,
 * chargement paresseux (ces sections sont loin sous le premier écran). Aucune animation : statique en mouvement réduit.
 *
 * - `variant="top"` : seule l'entrée de la section (un écran de haut) est couverte, fondue vers le bas.
 * - `variant="fill"` : toute la section, bords fondus. `opacity` tempère l'image (ex. 0.35 pour un fond « discret »).
 */
export function MediaBackdrop({ src, variant = "fill", opacity = 1, className = "" }: { src?: string | null; variant?: "fill" | "top"; opacity?: number; className?: string }) {
  if (!src) return null;
  return (
    <div className={`backdrop backdrop--${variant} ${className}`.trim()} style={opacity === 1 ? undefined : { opacity }} aria-hidden="true">
      <Image src={src} alt="" fill sizes="100vw" className="backdrop__img" />
    </div>
  );
}
