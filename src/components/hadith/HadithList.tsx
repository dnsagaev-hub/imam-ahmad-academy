'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { splitTranslation } from '@/lib/quran'

/** Пояснение под хадисом (источник, степень достоверности, разъяснение), уже собранное на сервере. */
export type HadithPart = { name: string; label: string; body: ReactNode }
export type HadithItem = { id: string; number: number; arabic: string; translation: string; parts: HadithPart[] }
export type HadithGroup = { id: string; title?: string; titleAr?: string | null; items: HadithItem[] }

// «ﷺ» в шрифте перевода выглядит пятном — показываем его арабским шрифтом
export const Saw = ({ text }: { text: string }) => (
  <>
    {text.split('ﷺ').map((t, i) => (
      <span key={i}>
        {i ? <span className="saw">ﷺ</span> : null}
        {t}
      </span>
    ))}
  </>
)

function Translation({ text }: { text: string }) {
  return (
    <>
      {splitTranslation(text).map((p, i) =>
        p.note ? (
          <span key={i} className="tr-note">
            <Saw text={p.text} />
          </span>
        ) : (
          <strong key={i}>
            <Saw text={p.text} />
          </strong>
        ),
      )}
    </>
  )
}

/** Хадисы книги по главам: арабский справа, перевод слева, под переводом кнопки; текст кнопки — в окне. */
export function HadithList({ bookTitle, groups }: { bookTitle: string; groups: HadithGroup[] }) {
  const [open, setOpen] = useState<{ id: string; name: string } | null>(null)
  const all = groups.flatMap((g) => g.items)
  const cur = open ? all.find((h) => h.id === open.id) : null
  const part = cur?.parts.find((p) => p.name === open?.name)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="hd-group" aria-label={g.title}>
          {g.title ? (
            <header className="hd-sec">
              <h2>{g.title}</h2>
              {g.titleAr ? (
                <p lang="ar" dir="rtl">
                  {g.titleAr}
                </p>
              ) : null}
            </header>
          ) : null}
          <div className="ayahs hd-list">
            {g.items.map((h) => (
              <article className="ayah hd" id={`h${h.number}`} key={h.id}>
                <div className="ayah-ar hd-ar" lang="ar" dir="rtl">
                  {h.arabic}
                </div>
                <div className="ayah-tr">
                  <span className="ayah-no">{h.number}</span>
                  <p>
                    <Translation text={h.translation} />
                  </p>
                  {h.parts.length ? (
                    <div className="hd-btns">
                      {h.parts.map((p) => (
                        <button key={p.name} type="button" className="ayah-note hd-btn" onClick={() => setOpen({ id: h.id, name: p.name })} aria-label={`${p.label}: хадис ${h.number}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {cur && part ? (
        <div className="cm-back" onClick={() => setOpen(null)}>
          <div className="cm" role="dialog" aria-modal="true" aria-labelledby="hd-title" onClick={(e) => e.stopPropagation()}>
            <div className="cm-head">
              <div>
                <p className="eyebrow">
                  {bookTitle}, хадис {cur.number}
                </p>
                <h2 id="hd-title">{part.label}</h2>
              </div>
              <button type="button" className="cm-x" aria-label="Закрыть" onClick={() => setOpen(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {cur.parts.length > 1 ? (
              <div className="cm-tabs" role="tablist" aria-label="О хадисе">
                {cur.parts.map((p) => (
                  <button key={p.name} type="button" role="tab" aria-selected={p.name === part.name} className={p.name === part.name ? 'on' : ''} onClick={() => setOpen({ id: cur.id, name: p.name })}>
                    {p.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="cm-body" role="tabpanel">
              {part.body}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
