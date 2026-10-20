import { TextReader } from './TextReader'

/* Текстовый урок из блоков: арабский текст рядом с переводом, хадисы, пояснения, термины, пометки, рисунки, итоги. */

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
    case 'hadith':
      return (
        <section className="tl-hadith" aria-label="Хадис">
          <div className="tl-label">Хадис{b.narrator ? <span className="tl-hadith-narrator"> · передал {b.narrator}</span> : null}</div>
          <div className="tl-hadith-ar" lang="ar" dir="rtl">
            {paragraphs(b.arabic).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="tl-hadith-ru">
            {paragraphs(b.translation).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {b.source ? <span className="tl-src">{b.source}</span> : null}
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
    case 'figure': {
      // Картинку могли удалить из «Файлов» — тогда блок просто не показывается.
      const img = b.image
      if (!img || typeof img !== 'object' || !img.url) return null
      const alt = img.alt || b.caption || 'Рисунок к уроку'
      return (
        <figure className="tl-figure">
          <a href={img.url} target="_blank" rel="noopener" title="Открыть крупно">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={alt} width={img.width ?? undefined} height={img.height ?? undefined} />
          </a>
          {b.caption || b.source ? (
            <figcaption>
              {b.caption ? <span>{b.caption}</span> : null}
              {b.source ? <span className="tl-src">{b.source}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      )
    }
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
  label,
}: {
  blocks: AnyBlock[]
  sourceRef?: string | null
  readingMinutes?: number | null
  label?: string
}) {
  const hasArabic = blocks.some((b) => b.blockType === 'matn')
  let matnIndex = 0
  return (
    <TextReader hasArabic={hasArabic} readingMinutes={readingMinutes ?? undefined} label={label}>
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
