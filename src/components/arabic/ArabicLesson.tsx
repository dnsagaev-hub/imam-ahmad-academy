import { type LexEntry, type Stage, verbForms } from '@/lib/arabic'
import type { ArabicData } from '@/lib/arabicCourse'
import { mediaUrl } from '@/lib/queries'

import type { LessonSchemes } from '@/data/arabic/schemes/types'

import { Bidi } from './Bidi'
import { ArText, LexiconProvider, VowelToggle } from './Lexicon'
import { SchemeCard } from './Scheme'

/*
 * Урок арабского языка: словарь, грамматическая заметка, предложения, текст и ключи.
 * Задания и контрольный тест показывает страница урока ниже.
 */

const STAGE_LABEL: Record<Stage, string> = {
  full: 'Полная огласовка',
  endings: 'Огласовка только на окончаниях',
  none: 'Без огласовки, как в матне',
}

const TAG: Record<string, string> = { term: 'термин', book: 'книжное', daily: 'быт' }

const paragraphs = (text?: string | null) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

// Ячейка таблицы: арабское слово в начале — арабским шрифтом с подсказкой, пояснение после него — обычным: «طَالِبٌ (студент)»
function Cell({ text }: { text: string }) {
  const m = text.match(/^([\u0600-\u06FF][\u0600-\u06FF\s]*?)(\s+[^\u0600-\u06FF].*)?$/)
  if (!m) return <Bidi text={text} />
  return (
    <>
      <ArText className="ar" text={m[1]} />
      {m[2] ? <Bidi text={m[2]} /> : null}
    </>
  )
}

// **жирный** — как в пояснениях текстовых уроков
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/)
  return (
    <p>
      {parts.map((t, i) =>
        i % 2 ? (
          <strong key={i}>
            <Bidi text={t} />
          </strong>
        ) : (
          <Bidi key={i} text={t} />
        ),
      )}
    </p>
  )
}

// Строка-пример: «هٰذَا كِتَابٌ. — Это книга.» — арабский в начале, перевод после тире перед первой русской буквой или цифрой;
// перевод в ||…|| скрыт под «Перевод»;
// «بَيْتٌ — الْبَيْتُ — дом» — арабская часть с тире внутри; строка только из арабского — пример без перевода
function exampleLine(line: string): { ar: string; tr: string } | null {
  if (!/^[\u0600-\u06FF]/.test(line)) return null
  const ru = line.search(/[А-Яа-яЁёA-Za-z0-9«|]/)
  if (ru < 0) return { ar: line, tr: '' }
  const m = line.slice(0, ru).match(/^(.*\S)\s+—\s+$/)
  return m ? { ar: m[1], tr: line.slice(ru).trim() } : null
}

type GBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ex'; items: { ar: string; tr: string }[] }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'scheme'; title: string }

// Строка таблицы: «| Падеж | Определённое | Неопределённое» или ячейки через табуляцию; первая строка — заголовок
const tableRow = (line: string): string[] | null =>
  line.startsWith('|')
    ? line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
    : line.includes('\t')
      ? line.split('\t').map((c) => c.trim())
      : null

/** Текст грамматики: строка «## …» — подзаголовок, «арабский — перевод» — пример, остальное — абзац; в конце раздела — его схема */
function GrammarText({ text, schemes }: { text?: string | null; schemes?: LessonSchemes }) {
  const blocks: GBlock[] = []
  let section = ''
  const closeSection = () => {
    if (section && schemes?.[section]) blocks.push({ kind: 'scheme', title: section })
  }
  for (const raw of String(text ?? '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('## ')) {
      closeSection()
      section = line.slice(3).trim()
    }
    const ex = exampleLine(line)
    const row = tableRow(line)
    const last = blocks[blocks.length - 1]
    if (row && last?.kind === 'table') last.rows.push(row)
    else if (row) blocks.push({ kind: 'table', rows: [row] })
    else if (line.startsWith('## ')) blocks.push({ kind: 'h', text: line.slice(3).trim() })
    else if (ex && last?.kind === 'ex') last.items.push(ex)
    else if (ex) blocks.push({ kind: 'ex', items: [ex] })
    else blocks.push({ kind: 'p', text: line })
  }
  closeSection()
  return (
    <div className="prose ar-grammar">
      {blocks.map((b, i) =>
        b.kind === 'scheme' ? (
          <SchemeCard key={i} s={schemes![b.title]} />
        ) : b.kind === 'h' ? (
          <h3 key={i} className="ar-sub">
            <Bidi text={b.text} />
          </h3>
        ) : b.kind === 'table' ? (
          <div key={i} className="ar-grammar-table">
            <table>
              <thead>
                <tr>
                  {b.rows[0].map((c, j) => (
                    <th key={j}>
                      <Bidi text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.slice(1).map((r, k) => (
                  <tr key={k}>
                    {r.map((c, j) => (
                      <td key={j}>
                        <Cell text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : b.kind === 'ex' ? (
          <ul key={i} className="ar-examples ar-grammar-ex">
            {b.items.map((e, j) => (
              <li key={j}>
                <ArText className="ar ar-line" text={e.ar} />
                {/^\|\|.+\|\|$/.test(e.tr) ? (
                  <details className="ar-tr">
                    <summary>Перевод</summary>
                    <span>{e.tr.slice(2, -2)}</span>
                  </details>
                ) : e.tr ? (
                  <span className="ar-ex-tr">{e.tr}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Rich key={i} text={b.text} />
        ),
      )}
    </div>
  )
}

export function ArabicLessonBody({
  a,
  stage,
  lexicon,
  lead,
  schemes,
  children,
}: {
  a: ArabicData
  /** схемы к разделам грамматики этого урока */
  schemes?: LessonSchemes
  /** цель урока — поле «Краткое описание» */
  lead?: string | null
  stage: Stage
  lexicon: LexEntry[]
  /** задания и тест — внутри, чтобы переключатель огласовки и подсказки работали и там */
  children?: React.ReactNode
}) {
  const allWords = (a.words ?? []).filter((w) => w.word && w.translation)
  // Служебные слова (هٰذَا، مَا، هُنَا…) — без корня: отдельной таблицей под именами, как в учебнике владельца
  const words = allWords.filter((w) => w.root?.trim())
  const particles = allWords.filter((w) => !w.root?.trim())
  const sentences = (a.sentences ?? []).filter((s) => s.arabic?.trim())
  const examples = (a.grammarExamples ?? []).filter((s) => s.arabic?.trim())
  const textParas = paragraphs(a.text)
  const hasKeys = sentences.some((s) => s.translation) || Boolean(a.textTranslation?.trim())

  return (
    <LexiconProvider entries={lexicon} stage={stage}>
      {lead?.trim() ? <p className="lead ar-lead">{lead}</p> : null}
      <div className="ar-meta">
        {a.isReview ? <span className="word-tag word-tag-review">Обобщающий урок</span> : null}
        <span className="muted">{STAGE_LABEL[stage]}</span>
        <VowelToggle />
      </div>

      {allWords.length ? (
        <section className="card ar-sec" id="slovar" aria-labelledby="slovar-h">
          <h2 className="ar-h" id="slovar-h">
            <span className="ar-h-n">1</span> Словарь урока
          </h2>
          {words.length > 0 && particles.length > 0 ? <h3 className="ar-sub">Имена</h3> : null}
          {words.length ? (
            <div className="word-grid">
              {words.map((w, i) => {
                const img = mediaUrl(w.image)
                const verb = verbForms(w)
                return (
                  <article key={w.id ?? i} className="word-card">
                    {img ? <img className="word-img" src={img} alt={w.translation} loading="lazy" /> : null}
                    <div className="word-ar ar" lang="ar" dir="rtl">
                      {w.word}
                    </div>
                    <div className="word-tr">{w.translation}</div>
                    <dl className="word-dl">
                      {w.root ? (
                        <>
                          <dt>Корень</dt>
                          <dd className="ar" lang="ar" dir="rtl">
                            {w.root}
                          </dd>
                        </>
                      ) : null}
                      {w.plural ? (
                        <>
                          <dt>Мн. ч.</dt>
                          <dd className="ar" lang="ar" dir="rtl">
                            {w.plural}
                          </dd>
                        </>
                      ) : null}
                      {verb ? (
                        <>
                          <dt>Формы</dt>
                          <dd className="ar" lang="ar" dir="rtl">
                            {verb}
                          </dd>
                        </>
                      ) : null}
                    </dl>
                    {w.note ? <div className="word-note">{w.note}</div> : null}
                    <div className="word-tags">
                      {w.tag && TAG[w.tag] ? <span className={`word-tag word-tag-${w.tag}`}>{TAG[w.tag]}</span> : null}
                      {w.theme ? <span className="word-theme">{w.theme}</span> : null}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}
          {particles.length ? (
            <>
              <h3 className="ar-sub">Служебные слова</h3>
              <table className="ar-particles">
                <tbody>
                  {particles.map((w, i) => (
                    <tr key={w.id ?? i}>
                      <td className="ar" lang="ar" dir="rtl">
                        {w.word}
                      </td>
                      <td>
                        {w.translation}
                        {w.note && w.note.trim() !== 'Служебное слово' ? <div className="word-note">{w.note}</div> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </section>
      ) : null}

      {a.grammar?.trim() || examples.length ? (
        <section className="card ar-sec" aria-labelledby="grammar-h">
          <h2 className="ar-h" id="grammar-h">
            <span className="ar-h-n">2</span>
            <span>
              Грамматика{a.grammarTitle ? ': ' : ''}
              {a.grammarTitle ? <Bidi text={a.grammarTitle} /> : null}
            </span>
          </h2>
          <GrammarText text={a.grammar} schemes={schemes} />
          {examples.length ? (
            <ul className="ar-examples">
              {examples.map((e, i) => (
                <li key={i}>
                  <ArText className="ar ar-line" text={e.arabic} />
                  {e.translation ? <span className="ar-ex-tr">{e.translation}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {sentences.length ? (
        <section className="card ar-sec" aria-labelledby="sent-h">
          <h2 className="ar-h" id="sent-h">
            <span className="ar-h-n">3</span> Предложения
          </h2>
          <p className="muted ar-hint">Наведите на слово или нажмите на него — появится перевод. Попробуйте перевести сами, затем откройте перевод.</p>
          <ol className="ar-sentences">
            {sentences.map((s, i) => (
              <li key={i}>
                <span className="ar-sn">{i + 1}</span>
                <div className="ar-s-body">
                  <ArText className="ar ar-line" text={s.arabic} />
                  {s.translation ? (
                    <details className="ar-tr">
                      <summary>Перевод</summary>
                      <span>{s.translation}</span>
                    </details>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {textParas.length ? (
        <section className="card ar-sec" aria-labelledby="text-h">
          <h2 className="ar-h" id="text-h">
            <span className="ar-h-n">4</span> Текст
          </h2>
          {a.textTitle ? <ArText className="ar ar-text-title" text={a.textTitle} /> : null}
          <div className="ar-text ar" lang="ar" dir="rtl">
            {textParas.map((p, i) => (
              <p key={i}>
                <ArText text={p} />
              </p>
            ))}
          </div>
          {a.textSource ? <div className="tl-src">{a.textSource}</div> : null}
        </section>
      ) : null}

      {children}

      {hasKeys ? (
        <details className="card ar-sec ar-keys" id="keys">
          <summary className="ar-h">
            <span className="ar-h-n">6</span> Ключи: переводы
          </summary>
          {sentences.some((s) => s.translation) ? (
            <ol className="ar-keys-list">
              {sentences.map((s, i) =>
                s.translation ? (
                  <li key={i} value={i + 1}>
                    {s.translation}
                  </li>
                ) : null,
              )}
            </ol>
          ) : null}
          {a.textTranslation?.trim() ? (
            <div className="prose">
              <h3 style={{ margin: '8px 0' }}>Перевод текста</h3>
              {paragraphs(a.textTranslation).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Ответы к заданиям показываются сразу после ответа на каждое задание.
          </p>
        </details>
      ) : null}
    </LexiconProvider>
  )
}
