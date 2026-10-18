import type { Metadata } from "next";
import Link from "next/link";
import { TERMS, TERM_GROUPS } from "../../src/content/lexique";

export const metadata: Metadata = { title: "Lexique", description: "Les mots de l'univers de Dune, définis en quelques lignes : lieux, peuples, objets, pouvoirs, histoire." };

export default function LexiquePage() {
  return (
    <main id="main" tabIndex={-1} className="page">
      <Link href="/" className="page__back">← Revenir à la descente</Link>
      <p className="caps">Le refuge · lexique vivant</p>
      <h1 className="monument monument--small">Les mots du sable</h1>
      <p className="prose">Chaque terme de ce site s’explique au survol ou au toucher. Les voici tous, classés. Définitions courtes, écrites pour ce refuge ; rien n’est copié d’un wiki ni d’un texte officiel.</p>
      {TERM_GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`g-${g.id}`}>
          <h2 id={`g-${g.id}`}>{g.label}</h2>
          <dl className="lexicon">
            {TERMS.filter((t) => t.group === g.id).map((t) => (
              <div key={t.id} id={t.id}>
                <dt>{t.word}</dt>
                <dd>{t.def}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </main>
  );
}
