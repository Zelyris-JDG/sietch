"use client";

import { useEffect, useRef, useState } from "react";
import { ArrakisMap } from "./ArrakisMap";
import { BooksPanel, FilmsPanel, GamePanel, NetworksPanel, TimelinePanel } from "./panels";

const TABS = [
  { id: "jeu", label: "Dune: Awakening" },
  { id: "films", label: "Films" },
  { id: "livres", label: "Livres" },
  { id: "reseaux", label: "Réseaux officiels" },
  { id: "carte", label: "Carte d'Arrakis" },
  { id: "chronologie", label: "Chronologie" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Console Mentat : onglets accessibles (flèches, Début, Fin), un panneau à la fois, le jeu mis en avant. */
export function Console() {
  const [tab, setTab] = useState<TabId>("jeu");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (TABS.some((t) => t.id === h)) setTab(h as TabId);
    setStamp(new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date()));
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = TABS.length;
    let j = i;
    if (e.key === "ArrowRight") j = (i + 1) % n;
    else if (e.key === "ArrowLeft") j = (i - 1 + n) % n;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = n - 1;
    else return;
    e.preventDefault();
    setTab(TABS[j].id);
    refs.current[TABS[j].id]?.focus();
  };

  return (
    <div className="console">
      <div className="console__bar">
        <span><b>CONSOLE MENTAT</b> · refuge souterrain · accès libre<span className="console__blink" aria-hidden="true" /></span>
        <span>{stamp ? `MISE À JOUR DES DONNÉES · ${stamp}` : "DONNÉES VÉRIFIÉES · OCTOBRE 2026"}</span>
      </div>
      <div className="console__tabs" role="tablist" aria-label="Rubriques du Sietch">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            className="console__tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} className="console__panel" hidden={tab !== t.id} tabIndex={0}>
          {t.id === "jeu" && <GamePanel />}
          {t.id === "films" && <FilmsPanel />}
          {t.id === "livres" && <BooksPanel />}
          {t.id === "reseaux" && <NetworksPanel />}
          {t.id === "carte" && <ArrakisMap />}
          {t.id === "chronologie" && <TimelinePanel />}
        </div>
      ))}
    </div>
  );
}
