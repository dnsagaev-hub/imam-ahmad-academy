'use client'

import { useEffect, useState } from 'react'

/*
 * Плавающий словарь урока: на компьютере — колонка слева, которая едет вместе со страницей;
 * на телефоне — кнопка «Словарь» внизу экрана, по нажатию словарь выезжает снизу.
 */

export type DockWord = {
  key: string
  word: string
  translation: string
  root?: string
  plural?: string
  verb?: string
  tag?: string
  image?: string | null
}

const TAG: Record<string, string> = { term: 'термин', book: 'книжн.', daily: 'быт' }

function WordList({ words }: { words: DockWord[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ol className="dock-list">
      {words.map((w) => {
        const isOpen = open === w.key
        return (
          <li key={w.key}>
            <button type="button" className="dock-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : w.key)}>
              <span className="dock-ar ar" lang="ar" dir="rtl">
                {w.word}
              </span>
              <span className="dock-tr">{w.translation}</span>
            </button>
            {isOpen ? (
              <div className="dock-more">
                {w.image ? <img src={w.image} alt={w.translation} loading="lazy" /> : null}
                {w.root ? (
                  <div>
                    Корень: <span className="ar" lang="ar" dir="rtl">{w.root}</span>
                  </div>
                ) : null}
                {w.plural ? (
                  <div>
                    Мн. ч.: <span className="ar" lang="ar" dir="rtl">{w.plural}</span>
                  </div>
                ) : null}
                {w.verb ? (
                  <div>
                    Формы: <span className="ar" lang="ar" dir="rtl">{w.verb}</span>
                  </div>
                ) : null}
                {w.tag && TAG[w.tag] ? <span className={`word-tag word-tag-${w.tag}`}>{TAG[w.tag]}</span> : null}
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function VocabDock({ words, cardsHref, children }: { words: DockWord[]; cardsHref?: string; children?: React.ReactNode }) {
  const [sheet, setSheet] = useState(false)
  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])
  if (!words.length) return null
  const head = (
    <div className="dock-head">
      <span>Словарь урока</span>
      <span className="dock-count">{words.length}</span>
    </div>
  )
  return (
    <>
      <aside className="col-side-left ar-side" aria-label="Словарь урока">
        <div className="vocab-dock card">
          {head}
          <WordList words={words} />
          {cardsHref ? (
            <a className="dock-cards" href={cardsHref}>
              Повторить на карточках →
            </a>
          ) : null}
        </div>
        {children}
      </aside>

      <button type="button" className="dock-fab" onClick={() => setSheet(true)} aria-haspopup="dialog">
        Словарь <span className="dock-count">{words.length}</span>
      </button>
      {sheet ? (
        <div className="dock-sheet-back" onClick={() => setSheet(false)}>
          <div className="dock-sheet" role="dialog" aria-label="Словарь урока" onClick={(e) => e.stopPropagation()}>
            <div className="dock-sheet-top">
              {head}
              <button type="button" className="dock-close" onClick={() => setSheet(false)} aria-label="Закрыть">
                ×
              </button>
            </div>
            <WordList words={words} />
            {cardsHref ? (
              <a className="dock-cards" href={cardsHref}>
                Повторить на карточках →
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
