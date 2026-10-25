'use client'

import { useEffect, useState } from 'react'

export type SurahInfoPart = { key: string; label: string; body: React.ReactNode }

/** Кнопки «Название суры», «Цели суры»… в шапке суры (и «Введение в раздел», «Схема раздела» в фикхе);
 *  текст открывается в окне, как комментарий к аяту. */
export function SurahInfoButtons({
  surahName,
  parts,
  eyebrow = `Сура ${surahName}`,
  label = 'Сведения о суре',
}: {
  surahName: string
  parts: SurahInfoPart[]
  eyebrow?: string
  label?: string
}) {
  const [open, setOpen] = useState<string | null>(null)
  const part = parts.find((p) => p.key === open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className="sh-info" role="group" aria-label={label}>
        {parts.map((p) => (
          <button key={p.key} type="button" className="sh-info-btn" onClick={() => setOpen(p.key)}>
            {p.label}
          </button>
        ))}
      </div>
      {part ? (
        <div className="cm-back" onClick={() => setOpen(null)}>
          <div className="cm" role="dialog" aria-modal="true" aria-labelledby="si-title" onClick={(e) => e.stopPropagation()}>
            <div className="cm-head">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h2 id="si-title">{part.label}</h2>
              </div>
              <button type="button" className="cm-x" aria-label="Закрыть" onClick={() => setOpen(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="cm-body">{part.body}</div>
          </div>
        </div>
      ) : null}
    </>
  )
}
