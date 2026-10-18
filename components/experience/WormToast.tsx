"use client";

import { useEffect, useState } from "react";

/** Message discret, une seule fois : la mécanique « marcher sans rythme », découverte. */
export function WormToast() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => {
      setOpen(true);
      window.setTimeout(() => setOpen(false), 14000);
    };
    document.addEventListener("sietch:worm", on);
    return () => document.removeEventListener("sietch:worm", on);
  }, []);
  return (
    <div className="toast" data-open={open} role="status" aria-live="polite">
      {open && (
        <>
          Vous marchez au rythme d’un homme. Quelque chose, sous le sable, vous a entendu.
          <small>Marchez sans rythme : un défilement irrégulier l’éloigne, une cadence régulière l’appelle.</small>
          <button type="button" aria-label="Fermer le message" onClick={() => setOpen(false)}>×</button>
        </>
      )}
    </div>
  );
}
