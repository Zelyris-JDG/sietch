import type { Scene } from "../../src/content/descent";
import { Epigraph } from "../ui/Epigraph";
import { RichText } from "../ui/RichText";

/** Une scène de la descente : index, sur-titre, épigraphe, titre, texte. Le héro est rendu à part (page.tsx). */
export function SceneBlock({ scene, tall = "tall", backdrop, children }: { scene: Scene; tall?: "tall" | "mid" | "flat"; backdrop?: React.ReactNode; children?: React.ReactNode }) {
  const cls = tall === "flat" ? "scene scene--flat" : tall === "mid" ? "scene scene--mid" : "scene scene--tall";
  return (
    <section id={scene.id} className={cls} data-scene aria-labelledby={`${scene.id}-title`}>
      {backdrop}
      <div className="scene__veil" aria-hidden="true" />
      <div className={tall === "flat" ? "" : "scene__sticky"}>
        <header className="scene__head" data-reveal>
          <span className="scene__index">{scene.index} · {scene.kicker}</span>
          <Epigraph data={scene.epigraph} />
        </header>
        <div className="scene__body" data-reveal>
          <h2 id={`${scene.id}-title`} className="monument monument--small">{scene.title}</h2>
          <div className="prose">
            {scene.paragraphs.map((p, i) => <p key={i}><RichText text={p} /></p>)}
            {scene.aside && <p className="mono" style={{ color: "var(--sand)", marginTop: "1.2em" }}>{scene.aside}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
