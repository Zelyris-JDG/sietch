"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { TERMS, TERM_BY_ID, TERM_GROUPS, type Term } from "../../src/content/lexique";

type GroupFilter = "tous" | Term["group"];

/** Repli d'un texte pour la recherche : minuscules, sans accent, apostrophes unifiées (« Épice » ⇔ « epice », « Muad'Dib » ⇔ « muad’dib »). */
function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/’/g, "'").toLowerCase();
}

/** Mots de la requête, repliés, sans vide ni doublon. Tous doivent apparaître dans le mot ou la définition. */
function tokens(query: string): string[] {
  return Array.from(new Set(fold(query).split(/\s+/).filter(Boolean)));
}

/** Index de recherche : chaque terme avec son texte replié (mot + définition), calculé une fois. */
const INDEX = TERMS.map((t) => ({ term: t, hay: fold(`${t.word} ${t.def}`) }));

/**
 * Surligne les mots cherchés dans un texte, sans tenir compte des accents ni de la casse : le texte est replié caractère
 * par caractère pour garder la correspondance avec l'original (« é » → « e », une apostrophe courbe → droite).
 */
function highlight(text: string, words: string[]): ReactNode {
  if (!words.length) return text;
  const folded: string[] = [];
  const from: number[] = [];
  const to: number[] = [];
  let pos = 0;
  for (const ch of text) {
    for (const f of fold(ch)) {
      folded.push(f);
      from.push(pos);
      to.push(pos + ch.length);
    }
    pos += ch.length;
  }
  const hay = folded.join("");
  const ranges: [number, number][] = [];
  for (const w of words) {
    let i = hay.indexOf(w);
    while (i !== -1) {
      ranges.push([from[i], to[i + w.length - 1]]);
      i = hay.indexOf(w, i + w.length);
    }
  }
  if (!ranges.length) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  const out: ReactNode[] = [];
  let cursor = 0;
  for (const [a, b] of merged) {
    if (a > cursor) out.push(text.slice(cursor, a));
    out.push(<mark key={a}>{text.slice(a, b)}</mark>);
    cursor = b;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function countLabel(n: number, filtered: boolean): string {
  return `${n} ${n <= 1 ? "terme affiché" : "termes affichés"}${filtered ? ` sur ${TERMS.length}` : ""}`;
}

/**
 * Lexique explorable : recherche instantanée (mot et définition, sans accent ni casse), filtre par groupe (boutons à
 * état pressé), compteur annoncé aux lecteurs d'écran. Au premier rendu tout est affiché : les ancres #id des termes
 * et #g-groupe des sections continuent de fonctionner.
 */
export function LexiqueExplorer() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupFilter>("tous");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const words = useMemo(() => tokens(query), [query]);
  const byQuery = useMemo(() => INDEX.filter(({ hay }) => words.every((w) => hay.includes(w))).map(({ term }) => term), [words]);
  const shown = group === "tous" ? byQuery : byQuery.filter((t) => t.group === group);
  const filtered = words.length > 0 || group !== "tous";
  const count = countLabel(shown.length, filtered);

  // La liste se filtre à chaque frappe ; le compteur (zone vivante) ne change qu'après 300 ms de calme, pour ne pas
  // interrompre le lecteur d'écran à chaque lettre.
  const [announced, setAnnounced] = useState(count);
  useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(count), 300);
    return () => window.clearTimeout(id);
  }, [count]);

  const reset = () => {
    setQuery("");
    setGroup("tous");
    inputRef.current?.focus();
  };

  // Ancre posée pendant la consultation (#arrakis, #g-lieux) : si la cible est masquée par un filtre, on lève les filtres
  // puis on défile jusqu'à elle. Au chargement, tout est affiché : le navigateur fait le travail seul.
  useEffect(() => {
    const onHash = () => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; } // fragment mal encodé (#100%) : rien à faire
      if (!id || (!Object.hasOwn(TERM_BY_ID, id) && !TERM_GROUPS.some((g) => `g-${g.id}` === id))) return;
      setQuery("");
      setGroup("tous");
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <>
      <section className="lexique" aria-label="Recherche et filtres du lexique">
        <div className="lexique__bar">
          <span>
            <b>Console Mentat</b> · lexique ·{" "}
            <span className="lexique__nowrap">
              {TERMS.length} entrées
              <span className="lexique__blink" aria-hidden="true" />
            </span>
          </span>
          <span className="lexique__hint">Accents et majuscules indifférents</span>
        </div>
        <form className="lexique__search" role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor={inputId} className="lexique__label">Chercher un mot</label>
          <div className="lexique__field">
            <span className="lexique__prompt" aria-hidden="true">›</span>
            <input
              ref={inputRef}
              id={inputId}
              className="lexique__input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.preventDefault();
                  setQuery("");
                }
              }}
              placeholder="arrakis, épice, ver…"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
          </div>
        </form>
        <div className="lexique__filters" role="group" aria-label="Filtrer par groupe">
          <button type="button" className="lexique__filter" aria-pressed={group === "tous"} onClick={() => setGroup("tous")}>
            Tous<small>{byQuery.length}</small>
          </button>
          {TERM_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className="lexique__filter"
              aria-pressed={group === g.id}
              onClick={() => setGroup(group === g.id ? "tous" : g.id)}
            >
              {g.label}<small>{byQuery.filter((t) => t.group === g.id).length}</small>
            </button>
          ))}
        </div>
        <div className="lexique__status">
          <p className="lexique__count" role="status" aria-live="polite" aria-atomic="true">{announced}</p>
          {filtered && (
            <button type="button" className="lexique__reset" onClick={reset}>Tout afficher</button>
          )}
        </div>
      </section>

      {TERM_GROUPS.map((g) => {
        if (group !== "tous" && g.id !== group) return null;
        const items = shown.filter((t) => t.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} aria-labelledby={`g-${g.id}`}>
            <h2 id={`g-${g.id}`}>
              {g.label}
              <span className="lexique__h2-count"> · {items.length}</span>
            </h2>
            <dl className="lexicon">
              {items.map((t) => (
                <div key={t.id} id={t.id}>
                  <dt>{highlight(t.word, words)}</dt>
                  <dd>{highlight(t.def, words)}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}

      {shown.length === 0 && (
        <div className="lexique__empty">
          <p className="lexique__empty-title">Aucun terme ne correspond</p>
          <p className="prose">Essayez un autre mot, une autre orthographe ou un autre groupe. Les accents et les majuscules ne comptent pas.</p>
        </div>
      )}
    </>
  );
}
