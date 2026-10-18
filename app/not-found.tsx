import type { Metadata } from "next";
import Link from "next/link";
import { Epigraph } from "../components/ui/Epigraph";
import "./not-found.css";

export const metadata: Metadata = { title: "Hors des cartes", description: "Cette adresse ne mène nulle part sur Arrakis : revenez à la descente ou ouvrez le lexique." };

/** Épigraphe originale, écrite pour cette page (aucune citation des livres, des films, de la série ou du jeu). */
const EPIGRAPH = { text: "Les cartes s’arrêtent où le vent commence ; au-delà, le sable efface chaque pas.", sign: "Carnets du Sietch" };

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="page nf">
      <p className="nf__index"><span aria-hidden="true">∅ · </span>Hors des cartes</p>
      <h1 className="monument monument--small">Ici, le sable a tout recouvert</h1>
      <Epigraph data={EPIGRAPH} className="nf__epigraph" />
      <dl className="nf__readout" aria-label="Relevé de la frégate">
        <div><dt>Altitude</dt><dd>Inconnue</dd></div>
        <div><dt>Coordonnées</dt><dd>Aucune</dd></div>
        <div><dt>Erreur</dt><dd>404</dd></div>
      </dl>
      <p className="prose">Cette adresse ne mène nulle part : pas de sietch, pas d’eau. Revenez à la descente, ou ouvrez le lexique.</p>
      <p className="nf__actions">
        <Link href="/" className="btn btn--solid">Revenir à la descente</Link>
        <Link href="/lexique" className="btn">Lexique</Link>
      </p>
    </main>
  );
}
