import type { Scheme, SItem } from '@/data/arabic/schemes/types'

import { Bidi } from './Bidi'
import { ArText } from './Lexicon'

/*
 * Схема в конце раздела грамматики (задача 50): тема одним взглядом.
 * Формула читается как арабское предложение — справа налево; сравнение — колонки; правила — короткий список.
 */

function Item({ it, big }: { it: SItem; big?: boolean }) {
  return (
    <div className={`sch-item${it.tone ? ` sch-${it.tone}` : ''}`}>
      {it.label ? (
        <div className="sch-label">
          <Bidi text={it.label} />
        </div>
      ) : null}
      {it.ar ? <ArText className={big ? 'ar sch-ar sch-ar-big' : 'ar sch-ar'} text={it.ar} /> : null}
      {it.ru ? (
        <div className="sch-ru">
          <Bidi text={it.ru} />
        </div>
      ) : null}
    </div>
  )
}

// На телефоне формула идёт сверху вниз — стрелка тогда смотрит вниз
const OP: Record<string, React.ReactNode> = {
  '+': '+',
  '=': '=',
  '→': (
    <>
      <span className="sch-op-h">←</span>
      <span className="sch-op-v">↓</span>
    </>
  ),
}

export function SchemeCard({ s }: { s: Scheme }) {
  return (
    <figure className="sch" aria-label={`Схема: ${s.title}`}>
      <figcaption className="sch-title">
        <span className="sch-tag">Схема</span>
        <Bidi text={s.title} />
      </figcaption>
      {s.blocks.map((b, i) => (
        <div key={i} className="sch-block">
          {b.kind === 'formula' ? (
            <div className="sch-formula" dir="rtl">
              {b.parts.map((p, j) =>
                typeof p === 'string' ? (
                  <span key={j} className="sch-op" aria-hidden="true">
                    {OP[p]}
                  </span>
                ) : (
                  <Item key={j} it={p} big />
                ),
              )}
            </div>
          ) : b.kind === 'compare' ? (
            <div className="sch-cols" style={{ ['--n' as string]: b.cols.length }}>
              {b.cols.map((c, j) => (
                <div key={j} className={`sch-col${c.tone ? ` sch-${c.tone}` : ''}`}>
                  <div className="sch-col-h">
                    <Bidi text={c.title} />
                  </div>
                  {c.items.map((it, k) => (
                    <Item key={k} it={it} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <ol className="sch-rules">
              {b.items.map((t, j) => (
                <li key={j}>
                  <Bidi text={t} />
                </li>
              ))}
            </ol>
          )}
          {b.note ? (
            <p className="sch-note">
              <Bidi text={b.note} />
            </p>
          ) : null}
        </div>
      ))}
    </figure>
  )
}
