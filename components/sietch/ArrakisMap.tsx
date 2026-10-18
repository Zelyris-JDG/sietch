"use client";

import { useState } from "react";
import { PLACES } from "../../src/content/sietch";
import { Term } from "../ui/Term";

/** Carte originale et cliquable d'Arrakis : notre propre projection stylisée, une fiche courte par lieu. */
export function ArrakisMap() {
  const [sel, setSel] = useState(PLACES[1].id);
  const place = PLACES.find((p) => p.id === sel) ?? PLACES[0];
  return (
    <div className="map">
      <div>
        <svg className="map__svg" viewBox="0 0 600 400" role="img" aria-labelledby="map-title map-desc">
          <title id="map-title">Carte stylisée d’Arrakis</title>
          <desc id="map-desc">Projection originale de l’hémisphère connu : calottes polaires, Mur du Bouclier, villes du nord, désert profond au sud.</desc>
          <defs>
            <radialGradient id="mg" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#3b2514" /><stop offset="1" stopColor="#120c08" /></radialGradient>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="rgba(242,181,68,.08)" /></pattern>
          </defs>
          <rect width="600" height="400" fill="url(#mg)" />
          <rect width="600" height="400" fill="url(#grid)" />
          {/* calottes */}
          <ellipse cx="300" cy="22" rx="150" ry="34" fill="rgba(234,216,182,.22)" />
          <ellipse cx="300" cy="382" rx="120" ry="30" fill="rgba(234,216,182,.16)" />
          {/* dunes du sud : hachures */}
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${40 + i * 10} ${250 + i * 14} q 60 -18 120 0 t 120 0 t 120 0 t 120 0`} fill="none" stroke="rgba(242,181,68,.14)" />
          ))}
          {/* Mur du Bouclier */}
          <path d="M120 170 q 60 -30 120 -8 t 120 10 t 120 -6 q 20 4 40 18" fill="none" stroke="rgba(234,216,182,.65)" strokeWidth="3" strokeLinecap="round" />
          <path d="M120 170 q 60 -30 120 -8 t 120 10 t 120 -6 q 20 4 40 18" fill="none" stroke="rgba(11,9,8,.9)" strokeWidth="1" strokeDasharray="3 5" />
          {/* bassin du nord */}
          <path d="M200 120 q 100 -40 220 -10" fill="none" stroke="rgba(242,181,68,.25)" strokeDasharray="2 6" />
          {PLACES.map((p) => (
            <g key={p.id} className="map__spot" role="button" tabIndex={0} aria-pressed={sel === p.id} aria-label={`${p.name} — ${p.kind}`}
              transform={`translate(${p.x} ${p.y})`}
              onClick={() => setSel(p.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(p.id); } }}>
              <circle className="map__ring" r="9" />
              <circle r={p.kind === "Région" || p.kind === "Calotte" ? 7 : 5} />
              <text x="12" y="4">{p.name}</text>
            </g>
          ))}
        </svg>
        <p className="map__legend" style={{ marginTop: 10 }}>Projection stylisée : aucune carte officielle n’est reprise. Cliquez un point ou choisissez un lieu.</p>
        <div className="map__list" style={{ marginTop: 10 }}>
          {PLACES.map((p) => (
            <button key={p.id} type="button" aria-pressed={sel === p.id} onClick={() => setSel(p.id)}>{p.name}</button>
          ))}
        </div>
      </div>
      <aside className="map__sheet" aria-live="polite">
        <span className="card__k">{place.kind}</span>
        <h3 className="card__t">{place.termId ? <Term id={place.termId}>{place.name}</Term> : place.name}</h3>
        <p className="card__p">{place.text}</p>
      </aside>
    </div>
  );
}
