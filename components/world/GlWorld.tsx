"use client";

import { useEffect, useRef, useState } from "react";
import { StillWorld } from "./StillWorld";

/** Monde WebGL : le module three.js n'est chargé qu'ici. En attendant (ou en cas d'échec), la version calme reste visible. */
export function GlWorld({ tier }: { tier: "low" | "high" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dispose: (() => void) | null = null;
    let cancelled = false;
    import("../../src/world/createWorld")
      .then(({ createWorld }) => {
        if (cancelled) return;
        const world = createWorld(canvas, { tier });
        dispose = world.dispose;
        setReady(true);
        document.documentElement.dataset.world = "gl";
      })
      .catch(() => {
        setFailed(true);
        document.documentElement.dataset.world = "still";
      });
    return () => {
      cancelled = true;
      dispose?.();
      delete document.documentElement.dataset.world;
    };
  }, [tier]);

  return (
    <>
      {(!ready || failed) && <StillWorld />}
      {!failed && <div id="world" aria-hidden="true" style={{ opacity: ready ? 1 : 0, transition: "opacity 1200ms ease" }}><canvas ref={ref} /></div>}
    </>
  );
}
