"use client";

import { useEffect, useRef, useState } from "react";
import { subscribe, type DescentState } from "../../src/lib/store";
import { armSound, setSound, soundEnabled, subscribeSound } from "../../src/lib/sound";
import { onPrescience, setPrescience } from "../../src/lib/prescience";

const NAV: { id: string; label: string }[] = [
  { id: "orbite", label: "Orbite" },
  { id: "entree", label: "Entrée" },
  { id: "desert", label: "Désert" },
  { id: "epice", label: "Épice" },
  { id: "maisons", label: "Maisons" },
  { id: "sietch", label: "Sietch" },
  { id: "prescience", label: "Prescience" },
];

export function formatAltitude(m: number): string {
  if (m < 0) return `${Math.round(-m)} M SOUS LE ROC`;
  if (m >= 100_000) return `${Math.round(m / 1000).toLocaleString("fr-FR")} KM`;
  if (m >= 10_000) return `${(m / 1000).toFixed(1).replace(".", ",")} KM`;
  if (m >= 1000) return `${(m / 1000).toFixed(2).replace(".", ",")} KM`;
  return `${Math.round(m)} M`;
}

/** Console : compteur d'altitude, son, sortie de prescience, navigation par scènes. */
export function Hud() {
  const valueRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const [sound, setSoundState] = useState(false);
  const [prescient, setPrescient] = useState(false);
  const [current, setCurrent] = useState("orbite");

  useEffect(() => {
    armSound();
    setSoundState(soundEnabled());
    const offSound = subscribeSound(setSoundState);
    const offP = onPrescience(setPrescient);
    let lastText = "";
    let lastPhase = "";
    const off = subscribe((s: DescentState) => {
      const t = formatAltitude(s.altitude);
      if (t !== lastText && valueRef.current) { valueRef.current.textContent = t; lastText = t; }
      if (s.phase !== lastPhase && phaseRef.current) { phaseRef.current.textContent = s.phase; lastPhase = s.phase; }
    });
    const obs = new MutationObserver(() => setCurrent(document.documentElement.dataset.section ?? "orbite"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-section"] });
    return () => { off(); offSound(); offP(); obs.disconnect(); };
  }, []);

  return (
    <>
      <div className="hud hud--alt" aria-hidden="true">
        <span className="hud__label">ALTITUDE</span>
        <span className="hud__value" ref={valueRef}>1 200 KM</span>
        <span className="hud__phase" ref={phaseRef}>SOUTE · LONG-COURRIER</span>
      </div>
      <div className="hud hud--tools">
        {prescient && (
          <button type="button" className="hud-btn" onClick={() => setPrescience(false)}>
            <span className="hud-btn__dot" style={{ background: "var(--blue-light)" }} aria-hidden="true" />
            Revenir au présent
          </button>
        )}
        <button
          type="button"
          className="hud-btn"
          aria-pressed={sound}
          aria-label={sound ? "Couper le son" : "Activer le son"}
          onClick={() => void setSound(!sound)}
        >
          <span className="hud-btn__bars" aria-hidden="true"><i /><i /><i /></span>
          {sound ? "Son" : "Son coupé"}
        </button>
      </div>
      <nav className="hud-nav" aria-label="Scènes de la descente">
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} aria-current={current === n.id ? "true" : undefined}>
            <span>{n.label}</span>
            <i aria-hidden="true" />
          </a>
        ))}
      </nav>
    </>
  );
}
