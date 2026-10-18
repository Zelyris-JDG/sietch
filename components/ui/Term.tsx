"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { TERM_BY_ID } from "../../src/content/lexique";

/** Terme du lexique vivant : définition au survol, au focus clavier et au toucher (bouton bascule). */
export function Term({ id, children }: { id: string; children?: React.ReactNode }) {
  const term = TERM_BY_ID[id];
  const tipId = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false);

  const place = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setBelow(r.top < 180);
    // Bornage horizontal : l'infobulle reste dans l'écran (12 px de marge), le triangle suit le terme.
    const w = Math.min(22 * 16, window.innerWidth * 0.86);
    const cx = r.left + r.width / 2;
    const minC = 12 + w / 2, maxC = window.innerWidth - 12 - w / 2;
    const shift = Math.min(Math.max(cx, minC), maxC) - cx;
    el.style.setProperty("--tip-shift", `${Math.round(shift)}px`);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDoc);
    };
  }, [open]);

  if (!term) return <>{children}</>;
  return (
    <button
      ref={ref}
      type="button"
      className={`term${below ? " term--below" : ""}`}
      aria-describedby={tipId}
      aria-expanded={open}
      onMouseEnter={place}
      onFocus={place}
      onClick={() => {
        place();
        setOpen((v) => !v);
      }}
    >
      {children ?? term.word}
      <span role="tooltip" id={tipId} className="term__tip">
        <b>{term.word}</b>
        {term.def}
      </span>
    </button>
  );
}
