"use client";

import { useEffect, useState } from "react";
import { PART_THREE } from "../../src/content/sietch";
import { dayLabel, daysUntil } from "../../src/lib/prescience";

/* Les dates de sortie sont des jours civils (sans heure) : affichées telles quelles, quel que soit le fuseau (comme Prescience.tsx). */
const FR_LONG = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const FR_SHORT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
function civil(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

type Days = { fr: number; us: number };

/**
 * Jours restants (France, États-Unis), calculés chez le visiteur après le montage : le rendu serveur ne connaît ni
 * son fuseau ni son heure, il n'affiche que les dates. Rafraîchi chaque minute (le passage à minuit change le compte).
 */
function useDays(): Days | null {
  const [days, setDays] = useState<Days | null>(null);
  useEffect(() => {
    const tick = () => setDays({ fr: daysUntil(PART_THREE.fr), us: daysUntil(PART_THREE.us) });
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return days;
}

/** Bandeau sous la barre de la console : « J−N avant Dune : Troisième Partie — … ». Cliquable, il ouvre l'onglet Films. */
export function PartThreeTicker({ onOpen }: { onOpen?: () => void }) {
  const days = useDays();
  const fr = days?.fr;
  const frDate = <time dateTime={PART_THREE.fr}>{FR_LONG.format(civil(PART_THREE.fr))}</time>;
  const usDate = <time dateTime={PART_THREE.us}>{FR_SHORT.format(civil(PART_THREE.us))}</time>;

  let lead: React.ReactNode = null;
  let text: React.ReactNode;
  if (fr === undefined) {
    text = <>{PART_THREE.title} — {frDate} en France, {usDate} aux États-Unis</>;
  } else if (fr > 0) {
    lead = (
      <>
        <b className="ticker__j" aria-hidden="true">{dayLabel(fr)}</b>
        <span className="visually-hidden">{fr} {fr > 1 ? "jours" : "jour"}</span>
      </>
    );
    text = <>avant {PART_THREE.title} — {frDate} en France, {usDate} aux États-Unis</>;
  } else if (fr === 0) {
    lead = <b className="ticker__j">Jour J</b>;
    text = <>{PART_THREE.title} sort aujourd’hui en France — {usDate} aux États-Unis</>;
  } else {
    text = <>{PART_THREE.title} — en salles en France depuis le {frDate}, aux États-Unis le {usDate}</>;
  }

  const inner = (
    <>
      <span className="ticker__k">Prochaine sortie</span>
      {lead}
      <span className="ticker__t">{text}</span>
      {onOpen && <span className="ticker__go" aria-hidden="true">Films ↓</span>}
    </>
  );
  return onOpen ? (
    <button type="button" className="ticker" onClick={onOpen}>{inner}</button>
  ) : (
    <div className="ticker">{inner}</div>
  );
}

function Cell({ n, label, iso }: { n: number | undefined; label: string; iso: string }) {
  const date = FR_SHORT.format(civil(iso));
  const big = n === undefined ? "—" : n > 0 ? String(n) : n === 0 ? "Jour J" : "Sorti";
  const small = n === undefined || n > 0 ? `${n === 1 ? "jour" : "jours"} · ${label} · ${date}` : `${label} · ${date}`;
  return (
    <span className="ptc__cell">
      <span className="ptc__n">{big}</span>
      <small>{small}</small>
    </span>
  );
}

/** Compte à rebours de la fiche du film (onglet Films) : jours restants en France et aux États-Unis. */
export function PartThreeCount() {
  const days = useDays();
  return (
    <div className="ptc">
      <span className="card__k">Compte à rebours</span>
      <div className="ptc__row">
        <Cell n={days?.fr} label="France" iso={PART_THREE.fr} />
        <Cell n={days?.us} label="États-Unis" iso={PART_THREE.us} />
      </div>
      <span className="card__m">Jours civils restants, comptés à votre heure locale.</span>
    </div>
  );
}
