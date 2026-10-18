"use client";

import { useId, useState } from "react";
import { READING_QUESTIONS, recommendReading, type ReadingAnswers, type ReadingQuestionId } from "../../src/content/sietch";

/**
 * Guide de lecture interactif : trois questions à boutons (aria-pressed), une recommandation (titre par lequel
 * commencer, ordre, pourquoi) annoncée dans une zone aria-live. La zone de résultat réserve sa hauteur : rien ne saute.
 */
export function ReadingGuide() {
  const [answers, setAnswers] = useState<ReadingAnswers>({});
  const uid = useId();
  const rec = recommendReading(answers);
  const total = READING_QUESTIONS.length;
  const count = READING_QUESTIONS.filter((q) => answers[q.id]).length;
  const left = total - count;
  const pick = (q: ReadingQuestionId, o: string) => setAnswers((a) => ({ ...a, [q]: o }));

  return (
    <div className="guide">
      <div className="guide__questions">
        {READING_QUESTIONS.map((q, i) => {
          const lid = `${uid}-${q.id}`;
          return (
            <div key={q.id} className="guide__q" role="group" aria-labelledby={lid}>
              <p className="guide__label" id={lid}>
                <span className="guide__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                {q.label}
              </p>
              <div className="guide__opts">
                {q.options.map((o) => (
                  <button key={o.id} type="button" className="guide__opt" aria-pressed={answers[q.id] === o.id} onClick={() => pick(q.id, o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div className="guide__foot">
          <span className="guide__progress">{count} / {total} réponses</span>
          <button type="button" className="guide__reset" onClick={() => setAnswers({})} disabled={count === 0}>Recommencer</button>
        </div>
      </div>
      <aside className="guide__result" aria-live="polite" aria-atomic="true">
        {rec ? (
          <div className="guide__rec" key={rec.id}>
            <span className="card__k">Commencez par</span>
            <h3 className="guide__title">{rec.start}</h3>
            <p className="card__m">{rec.meta}</p>
            <span className="card__k guide__k">Ordre suggéré</span>
            <ol className="guide__order">
              {rec.order.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <span className="card__k guide__k">Pourquoi</span>
            <p className="card__p">{rec.why}</p>
          </div>
        ) : (
          <div className="guide__empty">
            <span className="card__k">Recommandation</span>
            <p className="card__p">Trois réponses, un point de départ : le titre par lequel commencer, l’ordre de lecture, et pourquoi.</p>
            <p className="card__m">{count === 0 ? "Répondez aux trois questions." : `Encore ${left} ${left > 1 ? "réponses" : "réponse"}.`}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
