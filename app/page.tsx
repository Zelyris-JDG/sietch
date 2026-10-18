import { SCENES_CONTENT } from "../src/content/descent";
import { HOUSES } from "../src/content/houses";
import { Epigraph } from "../components/ui/Epigraph";
import { RichText } from "../components/ui/RichText";
import { Emblem } from "../components/ui/Emblem";
import { Term } from "../components/ui/Term";
import { SceneBlock } from "../components/experience/SceneBlock";
import { Intro } from "../components/experience/Intro";
import { ScrollRigLoader } from "../components/experience/ScrollRigLoader";
import { Hud } from "../components/experience/Hud";
import { WormToast } from "../components/experience/WormToast";
import { PrescienceToggle, Releases } from "../components/experience/Prescience";
import { Footer } from "../components/experience/Footer";
import { World } from "../components/world/World";
import { Console } from "../components/sietch/Console";

const byId = Object.fromEntries(SCENES_CONTENT.map((s) => [s.id, s]));

export default function Home() {
  const hero = byId.orbite;
  return (
    <>
      <Intro />
      <World />
      <ScrollRigLoader />
      <Hud />
      <main id="main" tabIndex={-1}>
        <div className="descent-veil" aria-hidden="true" />
        <section id="orbite" className="scene scene--tall" data-scene aria-labelledby="orbite-title">
          <div className="scene__veil" aria-hidden="true" />
          <div className="scene__sticky hero">
            <p className="hero__mark">{hero.index} · {hero.kicker.toUpperCase()}</p>
            <div className="hero__title">
              <span className="caps caps--light">Sietch</span>
              <h1 id="orbite-title" className="monument">{hero.title}</h1>
            </div>
            <div className="hero__sub">
              <Epigraph data={hero.epigraph} className="epigraph--hero" />
              <div className="prose" style={{ marginTop: "1.6rem" }}>
                {hero.paragraphs.map((p, i) => <p key={i}><RichText text={p} /></p>)}
              </div>
            </div>
            <p className="hero__hint" aria-hidden="true"><i /> Défilez pour quitter la soute</p>
          </div>
        </section>

        <SceneBlock scene={byId.entree} />
        <SceneBlock scene={byId.desert} />
        <SceneBlock scene={byId.epice} tall="mid" />

        <SceneBlock scene={byId.maisons} tall="flat">
          <ul className="houses" data-reveal>
            {HOUSES.map((h) => (
              <li key={h.id} className="house">
                <Emblem id={h.id} className="house__emblem" />
                <span className="house__kind">{h.kind}</span>
                <h3 className="house__name"><Term id={h.termId}>{h.name}</Term></h3>
                <p className="house__line">{h.line}</p>
                <p className="house__text">{h.text}</p>
              </li>
            ))}
          </ul>
        </SceneBlock>

        <SceneBlock scene={byId.sietch} tall="flat">
          <div style={{ marginTop: "clamp(2rem, 5vh, 4rem)" }} data-reveal>
            <Console />
          </div>
        </SceneBlock>

        <SceneBlock scene={byId.prescience} tall="flat">
          <PrescienceToggle />
          <Releases />
        </SceneBlock>
      </main>
      <Footer />
      <WormToast />
      <div className="veil" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
