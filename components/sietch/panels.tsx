import { EXPANDED, FILMS, GAME, NETWORKS, NOVELS, READING_GUIDE, BOOK_LINKS, TIMELINE } from "../../src/content/sietch";
import { Out } from "../ui/Out";

export function FilmsPanel() {
  return (
    <>
      <p className="console__intro">Deux adaptations au cinéma, une série : les dates de sortie en France et aux États-Unis, et les comptes officiels. Les résumés sont les nôtres.</p>
      <div className="console__grid">
        {FILMS.map((f) => (
          <article key={f.id} className={`card${f.id === "villeneuve-2026" ? " card--featured" : ""}`}>
            <span className="card__k">{f.kind} · {f.year}</span>
            <h3 className="card__t">{f.title}</h3>
            <p className="card__m">{f.by} · {f.studio}</p>
            <dl className="dl">
              {f.dates.map((d) => (
                <div key={d.label} style={{ display: "contents" }}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
            <p className="card__p">{f.text}</p>
            {f.links.length > 0 && (
              <div className="card__links">
                {f.links.map((l) => <Out key={l.href} href={l.href}>{l.label}</Out>)}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export function BooksPanel() {
  return (
    <>
      <p className="console__intro">Six romans de Frank Herbert, un univers étendu de Brian Herbert et Kevin J. Anderson, et un conseil simple : commencer par le début.</p>
      <h3 className="card__k" style={{ marginBottom: 10 }}>Par où commencer</h3>
      <ol className="steps">
        {READING_GUIDE.map((s) => (
          <li key={s.title}><div><b>{s.title}</b><span>{s.text}</span></div></li>
        ))}
      </ol>
      <h3 className="card__k" style={{ margin: "26px 0 10px" }}>Les six romans de Frank Herbert</h3>
      <div className="console__grid console__grid--3">
        {NOVELS.map((n) => (
          <article key={n.n} className="card">
            <span className="card__k">{String(n.n).padStart(2, "0")} · {n.year}</span>
            <h4 className="card__t">{n.fr}</h4>
            <p className="card__m">{n.en}</p>
            <p className="card__p">{n.text}</p>
          </article>
        ))}
      </div>
      <h3 className="card__k" style={{ margin: "26px 0 10px" }}>L’univers étendu (titres originaux)</h3>
      <div className="console__grid console__grid--3">
        {EXPANDED.map((c) => (
          <article key={c.name} className="card">
            <span className="card__k">{c.years}</span>
            <h4 className="card__t">{c.name}</h4>
            <p className="card__m">{c.books.join(" · ")}</p>
            <p className="card__p">{c.text}</p>
          </article>
        ))}
      </div>
      <div className="card__links" style={{ marginTop: 18 }}>
        {BOOK_LINKS.map((l) => <Out key={l.href} href={l.href}>{l.label}</Out>)}
      </div>
    </>
  );
}

export function GamePanel() {
  return (
    <>
      <p className="console__intro">{GAME.pitch}</p>
      <div className="console__grid">
        <article className="card card--featured">
          <span className="card__k">{GAME.studio} · {GAME.genre}</span>
          <h3 className="card__t">{GAME.title}</h3>
          <dl className="dl">
            {GAME.platforms.map((p) => (
              <div key={p.name} style={{ display: "contents" }}>
                <dt>{p.name}</dt>
                <dd>{p.date}</dd>
              </div>
            ))}
          </dl>
          <div className="card__links">
            {GAME.links.map((l) => <Out key={l.href} href={l.href}>{l.label}</Out>)}
          </div>
        </article>
        <article className="card">
          <span className="card__k">À savoir</span>
          <ul style={{ display: "grid", gap: 10 }}>
            {GAME.facts.map((f) => <li key={f} className="card__p">{f}</li>)}
          </ul>
        </article>
        <article className="card">
          <span className="card__k">Outils et wikis de la communauté</span>
          <ul style={{ display: "grid", gap: 12 }}>
            {GAME.community.map((c) => (
              <li key={c.href}>
                <Out href={c.href}>{c.label}</Out>
                <p className="card__p" style={{ marginTop: 4, color: "var(--muted)" }}>{c.text}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <h3 className="card__k" style={{ margin: "26px 0 10px" }}>Actualités récentes</h3>
      <ol className="news">
        {GAME.news.map((n) => (
          <li key={n.date}><time dateTime={n.date}>{n.label}</time><p>{n.text}</p></li>
        ))}
      </ol>
    </>
  );
}

export function NetworksPanel() {
  return (
    <>
      <p className="console__intro">Les comptes et sites officiels, groupés par films, série, jeu et livres. Rien d’autre : pas de comptes de fans, pas d’intermédiaires.</p>
      <div className="console__grid console__grid--3">
        {NETWORKS.map((g) => (
          <article key={g.id} className="card">
            <span className="card__k">{g.title}</span>
            <ul style={{ display: "grid", gap: 6 }}>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Out href={l.href}>{l.label}</Out>
                  {l.note && <span className="card__m" style={{ display: "block" }}>{l.note}</span>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

export function TimelinePanel() {
  return (
    <>
      <p className="console__intro">Dix mille ans en onze repères, du Jihad butlérien à la Maison des Mères. Années du calendrier de la Guilde ; le signe ≈ marque une estimation d’après les appendices des romans.</p>
      <p className="timeline__scale">av. G. = avant la Guilde · ap. G. = après la fondation de la Guilde</p>
      <ol className="timeline">
        {TIMELINE.map((e) => (
          <li key={e.title} data-key={e.key ? "true" : undefined}>
            <time>{e.when}</time>
            <b>{e.title}</b>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </>
  );
}
