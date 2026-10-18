import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="page">
      <p className="caps">Hors des cartes</p>
      <h1 className="monument monument--small">Ici, le sable a tout recouvert</h1>
      <p className="prose">Cette adresse ne mène nulle part : pas de sietch, pas d’eau. Revenez à la descente, ou ouvrez le lexique.</p>
      <p style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Link href="/" className="btn btn--solid">Revenir à la descente</Link>
        <Link href="/lexique" className="btn">Lexique</Link>
      </p>
    </main>
  );
}
