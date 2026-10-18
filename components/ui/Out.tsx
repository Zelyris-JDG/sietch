/** Lien externe : toujours un nouvel onglet, toujours annoncé aux lecteurs d'écran. */
export function Out({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="visually-hidden"> (nouvel onglet)</span>
    </a>
  );
}
