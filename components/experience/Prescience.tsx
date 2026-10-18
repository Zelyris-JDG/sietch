"use client";

import { useEffect, useState } from "react";
import { isPrescient, onPrescience, setPrescience } from "../../src/lib/prescience";
import { ambience } from "../../src/lib/audio";
import { RELEASES, type Release } from "../../src/content/sietch";

export function PrescienceToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isPrescient()); return onPrescience(setOn); }, []);
  return (
    <div className="prescience__toggle">
      <button
        type="button"
        className={on ? "btn btn--accent" : "btn btn--solid"}
        aria-pressed={on}
        onClick={() => { setPrescience(!on); ambience.setPrescience(!on); }}
      >
        {on ? "Revenir au présent" : "Prendre l’épice"}
      </button>
    </div>
  );
}

const FR_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function parts(ms: number): { d: number; h: number; m: number; s: number } {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

export function releaseDate(r: Release): Date | null {
  return r.date ? new Date(`${r.date}T00:00:00+01:00`) : null;
}

function ReleaseCard({ r, now, on }: { r: Release; now: number | null; on: boolean }) {
  const date = releaseDate(r);
  const past = date !== null && now !== null && date.getTime() <= now;
  const diff = date && now !== null ? date.getTime() - now : null;
  return (
    <article className="release">
      <span className="release__k">{r.kind}</span>
      <h3 className="release__t">{r.title}</h3>
      <p className="release__d">
        {date ? <time dateTime={r.date!}>{FR_DATE.format(date)}</time> : "Date non annoncée"} · {r.where}
      </p>
      {on && (
        <div className="release__count" data-state={past ? "past" : diff === null ? "unknown" : "future"} aria-label={past ? "Déjà sorti" : undefined}>
          {diff === null ? (
            <span>Le futur reste voilé</span>
          ) : past ? (
            <span>Déjà dans le présent</span>
          ) : (
            (() => {
              const p = parts(diff);
              return (
                <>
                  <span>{p.d}<small>jours</small></span>
                  <span>{String(p.h).padStart(2, "0")}<small>heures</small></span>
                  <span>{String(p.m).padStart(2, "0")}<small>min</small></span>
                  <span>{String(p.s).padStart(2, "0")}<small>sec</small></span>
                </>
              );
            })()
          )}
        </div>
      )}
      {r.note && <p className="release__note">{r.note}</p>}
      {r.links && r.links.length > 0 && (
        <p className="release__links">
          {r.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}<span className="visually-hidden"> (nouvel onglet)</span></a>
          ))}
        </p>
      )}
    </article>
  );
}

/** Calendrier des sorties : dates toujours visibles ; comptes à rebours en mode prescience. */
export function Releases() {
  const [on, setOn] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setOn(isPrescient());
    setNow(Date.now());
    const off = onPrescience(setOn);
    return off;
  }, []);
  useEffect(() => {
    if (!on) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [on]);
  const sorted = [...RELEASES].sort((a, b) => {
    const da = a.date ? a.date : "9999", db = b.date ? b.date : "9999";
    const pa = now !== null && a.date !== null && new Date(a.date).getTime() < now ? 1 : 0;
    const pb = now !== null && b.date !== null && new Date(b.date).getTime() < now ? 1 : 0;
    if (pa !== pb) return pa - pb;
    return da.localeCompare(db);
  });
  return (
    <div className="releases" id="sorties">
      {sorted.map((r) => <ReleaseCard key={r.id} r={r} now={now} on={on} />)}
    </div>
  );
}
