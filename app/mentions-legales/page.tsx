import type { Metadata } from "next";
import Link from "next/link";
import { legalSections } from "../../src/content/legal";

export const metadata: Metadata = { title: "Mentions légales", description: "Éditeur, hébergement et statut de site de fan non officiel.", robots: { index: false, follow: false } };

export default function MentionsLegalesPage() {
  return (
    <main id="main" tabIndex={-1} className="page">
      <Link href="/" className="page__back">← Revenir à la descente</Link>
      <p className="caps">Le refuge · informations légales</p>
      <h1 className="monument monument--small">Mentions légales</h1>
      {legalSections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p) => <p key={p} className="prose">{p}</p>)}
          {s.list && (
            <ul>
              {s.list.map((l) => <li key={l}>{l.startsWith("http") ? <a href={l} target="_blank" rel="noopener noreferrer">{l}<span className="visually-hidden"> (nouvel onglet)</span></a> : l}</li>)}
            </ul>
          )}
        </section>
      ))}
      <p className="mono" style={{ color: "var(--muted)", marginTop: "2.5rem" }}>Dernière mise à jour : 18 octobre 2026.</p>
    </main>
  );
}
