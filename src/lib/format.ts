/** Altitude lisible pour la console : kilomètres au-dessus de 1 km, mètres en dessous ; sous le roc, valeur négative
 *  (signe moins typographique U+2212), la ligne de phase disant « SOUS LE ROC » — la plaque reste étroite. */
export function formatAltitude(m: number): string {
  if (m < 0) return `−${Math.round(-m)} M`;
  if (m >= 100_000) return `${Math.round(m / 1000).toLocaleString("fr-FR")} KM`;
  if (m >= 10_000) return `${(m / 1000).toFixed(1).replace(".", ",")} KM`;
  if (m >= 1000) return `${(m / 1000).toFixed(2).replace(".", ",")} KM`;
  return `${Math.round(m)} M`;
}
