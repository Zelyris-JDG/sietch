import Link from "next/link";
import { site } from "../../src/config/site";

/** Pied de page : nuit aux deux lunes, mention non officielle, Zelyris, mentions légales. */
export function Footer() {
  return (
    <footer className="footer" id="fin" data-scene>
      <div className="footer__sky" aria-hidden="true">
        <span className="footer__moon footer__moon--big" />
        <span className="footer__moon footer__moon--small" />
        <svg className="footer__dunes" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path d="M0 220 C 180 140, 320 260, 520 190 S 860 90, 1040 170 S 1320 260, 1440 180 V300 H0 Z" fill="currentColor" />
          <path d="M0 260 C 200 220, 400 290, 640 240 S 1000 190, 1200 250 S 1380 290, 1440 240 V300 H0 Z" fill="#090d1c" />
        </svg>
      </div>
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__col">
            <p className="caps caps--light">Sietch · le refuge des fans</p>
            <p className="footer__disclaimer">{site.disclaimer}</p>
            <p className="footer__disclaimer">Aucune image, aucun son, aucun extrait officiel : les paysages, le vaisseau et les emblèmes de ce site sont des créations originales, et les épigraphes « Carnets du Sietch » sont écrites pour lui.</p>
          </div>
          <div className="footer__col">
            <p className="caps">Descendre</p>
            <a href="#orbite">Orbite</a>
            <a href="#desert">Le désert</a>
            <a href="#maisons">Les Maisons</a>
            <a href="#sietch">Le Sietch</a>
            <a href="#prescience">Prescience</a>
          </div>
          <div className="footer__col">
            <p className="caps">Refuge</p>
            <Link href="/lexique">Lexique</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <a href={site.maker.url} target="_blank" rel="noopener noreferrer">zelyris.fr<span className="visually-hidden"> (nouvel onglet)</span></a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>Conçu par <a href={site.maker.url} target="_blank" rel="noopener noreferrer">Zelyris<span className="visually-hidden"> (nouvel onglet)</span></a></span>
          <span>Nuit sur Arrakis · deux lunes</span>
        </div>
      </div>
    </footer>
  );
}
