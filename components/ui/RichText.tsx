import { Fragment } from "react";
import { TERM_BY_ID } from "../../src/content/lexique";
import { Term } from "./Term";

const TOKEN = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

/** Rend un texte contenant des termes [[id|label]] du lexique vivant. */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>);
    const id = m[1];
    const label = m[2] ?? TERM_BY_ID[id]?.word ?? id;
    parts.push(
      <Term key={k++} id={id}>
        {label}
      </Term>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{parts}</>;
}

/** Version texte brut (métadonnées, tests) : retire la syntaxe des termes. */
export function plainText(text: string): string {
  return text.replace(TOKEN, (_, id: string, label?: string) => label ?? TERM_BY_ID[id]?.word ?? id);
}
