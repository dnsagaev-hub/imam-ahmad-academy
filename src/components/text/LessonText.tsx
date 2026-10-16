import { TextReader } from './TextReader'

/* Текстовый урок из блоков: арабский текст рядом с переводом, пояснения, термины, пометки, итоги. */

type AnyBlock = { blockType: string; id?: string | null } & Record<string, any>

const NOTE_LABEL: Record<string, string> = {
  mutamad: 'Основное мнение мазхаба',
  ikhtilaf: 'Другое мнение',
  dalil: 'Довод',
  remark: 'Замечание',
  verify: 'Сверить с источником',
}

const paragraphs = (text?: string | null) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

function Block({ b, index }: { b: AnyBlock; index: number }) {
  switch (b.blockType) {
    case 'matn':
      return (
        <section className="tl-matn" aria-label={`Текст книги, отрывок ${index}`}>
          <div className="tl-ar" lang="ar" dir="rtl">
            {paragraphs(b.arabic).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="tl-ru">
            {paragraphs(b.translation).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {b.source ? <span className="tl-src">{b.source}</span> : null}
          </div>
        </section>
      )
    case 'explanation':
      return (
        <section className="tl-explain">
          {b.title ? <h3>{b.title}</h3> : null}
          {paragraphs(b.text).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )
    case 'terms':
      return (
        <section className="tl-terms" aria-label="Термины">
          <div className="tl-label">Термины</div>
          <dl>
            {(b.items ?? []).map((t: any, i: number) => (
              <div key={i} className="tl-term">
                <dt lang="ar" dir="rtl">
                  {t.arabic}
                </dt>
                <dd>{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    case 'note':
      return (
        <aside className={`tl-note tl-note-${b.kind ?? 'remark'}`}>
          <div className="tl-label">{b.title || NOTE_LABEL[b.kind] || 'Замечание'}</div>
          {paragraphs(b.text).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </aside>
      )
    case 'takeaways':
      return (
        <section className="tl-takeaways">
          <div className="tl-label">Главное из урока</div>
          <ol>
            {(b.items ?? []).map((t: any, i: number) => (
              <li key={i}>{t.text}</li>
            ))}
          </ol>
        </section>
      )
    default:
      return null
  }
}

export function LessonText({
  blocks,
  sourceRef,
  readingMinutes,
}: {
  blocks: AnyBlock[]
  sourceRef?: string | null
  readingMinutes?: number | null
}) {
  const hasArabic = blocks.some((b) => b.blockType === 'matn')
  let matnIndex = 0
  return (
    <TextReader hasArabic={hasArabic} readingMinutes={readingMinutes ?? undefined}>
      {sourceRef ? (
        <div className="tl-sourceref">
          <span className="tl-label">Источник</span>
          <span>{sourceRef}</span>
        </div>
      ) : null}
      {blocks.map((b, i) => {
        if (b.blockType === 'matn') matnIndex += 1
        return <Block key={b.id ?? i} b={b} index={matnIndex} />
      })}
    </TextReader>
  )
}
