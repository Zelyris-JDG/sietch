/** Altitude lisible pour la console : kilomètres au-dessus de 1 km, mètres en dessous, profondeur sous le roc. */
export function formatAltitude(m: number): string {
  if (m < 0) return `${Math.round(-m)} M SOUS LE ROC`;
  if (m >= 100_000) return `${Math.round(m / 1000).toLocaleString("fr-FR")} KM`;
  if (m >= 10_000) return `${(m / 1000).toFixed(1).replace(".", ",")} KM`;
  if (m >= 1000) return `${(m / 1000).toFixed(2).replace(".", ",")} KM`;
  return `${Math.round(m)} M`;
}
