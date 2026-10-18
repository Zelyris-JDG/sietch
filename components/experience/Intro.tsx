"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setSound } from "../../src/lib/sound";
import { storageKeys } from "../../src/config/site";

type State = "show" | "skip" | "gone";

/** Intro : noir, un souffle, l'invitation à activer le son. Une fois par session d'onglet. */
export function Intro() {
  const [st, setSt] = useState<State>("show");
  const first = useRef<HTMLButtonElement>(null);

  const leave = useCallback((withSound: boolean) => {
    if (withSound) void setSound(true);
    try { sessionStorage.setItem(storageKeys.introSeen, "1"); } catch { /* privé */ }
    document.documentElement.classList.remove("intro-open");
    document.dispatchEvent(new CustomEvent("sietch:enter"));
    setSt("gone");
    window.setTimeout(() => document.getElementById("main")?.focus({ preventScroll: true }), 50);
  }, []);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(storageKeys.introSeen) === "1"; } catch { /* privé */ }
    if (seen) { setSt("skip"); document.dispatchEvent(new CustomEvent("sietch:enter")); return; }
    document.documentElement.classList.add("intro-open");
    first.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leave]);

  if (st === "skip") return null;
  return (
    <div className="intro" data-state={st === "gone" ? "gone" : "show"} role="dialog" aria-modal="true" aria-labelledby="intro-title" aria-hidden={st === "gone"}>
      <div className="intro__inner">
        <span className="intro__breath" aria-hidden="true" />
        <p className="caps" id="intro-title">Sietch · le refuge des fans</p>
        <p className="epigraph" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>« Avant le sable, le silence. Avant le silence, un souffle. »</p>
        <p className="prose" style={{ color: "var(--muted)", fontSize: "0.98rem" }}>
          Ce refuge se visite en descendant. Une nappe grave, le vent et un grondement l’accompagnent, si vous le souhaitez : le son est coupé par défaut et se change à tout moment.
        </p>
        <div className="intro__actions">
          <button ref={first} type="button" className="btn btn--solid" onClick={() => leave(true)}>Entrer avec le son</button>
          <button type="button" className="btn" onClick={() => leave(false)}>Entrer en silence</button>
        </div>
      </div>
    </div>
  );
}
