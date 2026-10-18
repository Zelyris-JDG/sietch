/**
 * Monde « calme » : des couches fixes (dégradés, dunes en SVG) qui se fondent selon la scène courante
 * (attribut data-section posé par le rail). Sert de repli sans WebGL, en mouvement réduit et sur appareil faible ;
 * c'est une version complète de l'expérience, pas un message d'erreur.
 */
export function StillWorld() {
  return (
    <div className="still-world" aria-hidden="true">
      <div className="sw sw--space" />
      <div className="sw sw--planet" />
      <div className="sw sw--storm" />
      <div className="sw sw--dunes">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="swsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1a10" /><stop offset="1" stopColor="#8a5a2a" /></linearGradient>
            <linearGradient id="swd1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c99a5b" /><stop offset="1" stopColor="#7a4a1f" /></linearGradient>
            <linearGradient id="swd2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b07f44" /><stop offset="1" stopColor="#4a2a12" /></linearGradient>
            <linearGradient id="swd3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2412" /><stop offset="1" stopColor="#1a100a" /></linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#swsky)" />
          <path d="M0 560 C 260 470, 420 640, 700 540 S 1120 430, 1440 520 V900 H0 Z" fill="url(#swd1)" />
          <path d="M0 680 C 200 620, 460 760, 760 660 S 1180 600, 1440 690 V900 H0 Z" fill="url(#swd2)" />
          <path d="M0 800 C 300 740, 600 860, 900 790 S 1300 760, 1440 820 V900 H0 Z" fill="url(#swd3)" />
        </svg>
      </div>
      <div className="sw sw--spice" />
      <div className="sw sw--rock" />
      <div className="sw sw--night" />
    </div>
  );
}
