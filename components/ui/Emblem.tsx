/** Emblèmes originaux des Maisons et des ordres — tracés géométriques dessinés pour ce site, aucune armoirie officielle. */
export function Emblem({ id, className }: { id: string; className?: string }) {
  const common = { className, viewBox: "0 0 72 72", fill: "none", stroke: "currentColor", strokeWidth: 1.4, "aria-hidden": true as const };
  switch (id) {
    case "atreides": // le phare : un triangle dressé, une lumière, trois vagues
      return (
        <svg {...common}>
          <path d="M36 10 L52 52 H20 Z" />
          <circle cx="36" cy="8" r="2.6" fill="currentColor" stroke="none" />
          <path d="M14 58 q5 -4 10 0 t10 0 t10 0 t10 0 t4 0" />
          <path d="M18 64 q5 -4 10 0 t10 0 t10 0 t6 0" opacity=".6" />
        </svg>
      );
    case "harkonnen": // l'hexagone plein, entaillé
      return (
        <svg {...common}>
          <path d="M36 8 L60 22 V50 L36 64 L12 50 V22 Z" fill="currentColor" fillOpacity=".92" />
          <path d="M22 18 L50 54" stroke="#0b0908" strokeWidth="3" />
          <path d="M22 18 L50 54" stroke="currentColor" strokeWidth="1" opacity=".5" />
        </svg>
      );
    case "corrino": // le soleil du trône : douze rayons et une barre
      return (
        <svg {...common}>
          <circle cx="36" cy="34" r="12" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = 36 + Math.cos(a) * 17, y1 = 34 + Math.sin(a) * 17;
            const x2 = 36 + Math.cos(a) * (i % 3 === 0 ? 27 : 22), y2 = 34 + Math.sin(a) * (i % 3 === 0 ? 27 : 22);
            return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />;
          })}
          <path d="M36 46 V66" strokeWidth="2.2" />
        </svg>
      );
    case "fremen": // le croissant et la goutte
      return (
        <svg {...common}>
          <path d="M44 10 a26 26 0 1 0 0 52 a20 20 0 1 1 0 -52 Z" />
          <path d="M40 30 c-4 6 -6 9 -6 13 a6 6 0 0 0 12 0 c0 -4 -2 -7 -6 -13 Z" fill="currentColor" fillOpacity=".9" />
        </svg>
      );
    case "bene-gesserit": // le voile : un cercle, une ligne, un œil clos
      return (
        <svg {...common}>
          <circle cx="36" cy="36" r="26" />
          <path d="M14 30 H58" />
          <path d="M26 42 q10 8 20 0" />
          <circle cx="36" cy="40" r="1.6" fill="currentColor" stroke="none" />
          <path d="M20 14 q16 -8 32 0" opacity=".5" />
        </svg>
      );
    case "guilde": // l'espace replié : deux cercles, une seule ligne
      return (
        <svg {...common}>
          <circle cx="24" cy="36" r="14" />
          <circle cx="48" cy="36" r="14" />
          <path d="M6 36 H66" strokeDasharray="2 4" />
          <path d="M36 22 V50" strokeWidth="2" />
        </svg>
      );
    default:
      return <svg {...common}><circle cx="36" cy="36" r="20" /></svg>;
  }
}
