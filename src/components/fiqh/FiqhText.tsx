'use client'

import { Fragment, useEffect, useState, type ReactNode } from 'react'

import { Saw } from '@/components/hadith/HadithList'
import { splitTranslation } from '@/lib/quran'

// Что показывать: арабский, перевод, темы, пояснения (выбор ученика помнит браузер, отдельно от Корана)
const SHOW_KEY = 'fiqh-show'
type Show = { ar: boolean; tr: boolean; topics: boolean; notes: boolean }

/** Пояснение под абзацем (разъяснение, доводы…), уже собранное на сервере. */
export type FiqhNote = { name: string; label: string; body: ReactNode }
export type FiqhParagraph = { arabic: string; translation: string; notes: FiqhNote[] }
export type FiqhTopic = { from: number; title: string }

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

/** Текст раздела: абзацы в две колонки (арабский справа, перевод слева), темы, кнопки под абзацем и окно. */
export function FiqhText({ chapterTitle, paragraphs, topics }: { chapterTitle: string; paragraphs: FiqhParagraph[]; topics: FiqhTopic[] }) {
  const [show, setShow] = useState<Show>({ ar: true, tr: true, topics: true, notes: true })
  const [open, setOpen] = useState<{ no: number; name: string } | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SHOW_KEY) ?? 'null') as Partial<Show> | null
      if (saved && (saved.ar || saved.tr)) setShow({ ar: !!saved.ar, tr: !!saved.tr, topics: saved.topics !== false, notes: saved.notes !== false })
    } catch {
      /* без памяти браузера — всё видно */
    }
  }, [])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  // Арабский и перевод: снять обе галочки нельзя — если убрать последнюю, включается другая
  const toggle = (k: keyof Show) => {
    const next = { ...show, [k]: !show[k] } as Show
    if (!next.ar && !next.tr) next[k === 'ar' ? 'tr' : 'ar'] = true
    setShow(next)
    try {
      localStorage.setItem(SHOW_KEY, JSON.stringify(next))
    } catch {
      /* ничего */
    }
  }

  // Пока в разделе нет ни одного перевода, показывается только арабский текст
  const hasTr = paragraphs.some((p) => p.translation.trim())
  const hasNotes = paragraphs.some((p) => p.notes.length)
  const showAr = !hasTr || show.ar
  const showTr = hasTr && show.tr
  const showNotes = hasNotes && show.notes
  const topicAt = new Map(show.topics ? topics.map((t) => [t.from, t.title]) : [])
  const cur = open ? paragraphs[open.no - 1] : null
  const note = cur?.notes.find((n) => n.name === open?.name)

  return (
    <>
      {hasTr || topics.length || hasNotes ? (
        <div className="sv-bar">
          <div className="sv-show" role="group" aria-label="Что показывать">
            {hasTr ? (
              <>
                <label className={show.ar ? 'on' : ''}>
                  <input type="checkbox" checked={show.ar} onChange={() => toggle('ar')} />
                  Арабский текст
                </label>
                <label className={show.tr ? 'on' : ''}>
                  <input type="checkbox" checked={show.tr} onChange={() => toggle('tr')} />
                  Перевод
                </label>
              </>
            ) : null}
            {topics.length ? (
              <label className={show.topics ? 'on' : ''}>
                <input type="checkbox" checked={show.topics} onChange={() => toggle('topics')} />
                Темы
              </label>
            ) : null}
            {hasNotes ? (
              <label className={show.notes ? 'on' : ''}>
                <input type="checkbox" checked={show.notes} onChange={() => toggle('notes')} />
                Пояснения
              </label>
            ) : null}
          </div>
        </div>
      ) : null}

      {!hasTr ? <p className="sv-wait">Перевод этого раздела готовится. Пока здесь только арабский текст — перевод появится, как только будет добавлен.</p> : null}

      <div className={`ayahs fq-list${showTr ? (showAr ? '' : ' tr-only') : ' ar-only'}`}>
        {paragraphs.map((p, i) => {
          const no = i + 1
          const topic = topicAt.get(no)
          const notes = showNotes ? p.notes : []
          const buttons = notes.length ? (
            <>
              <div className="ayah-notes fq-btns">
                {notes.map((n) => (
                  <button key={n.name} type="button" className="ayah-note hd-btn" onClick={() => setOpen({ no, name: n.name })} aria-label={`${n.label}: абзац ${no}`}>
                    {n.label}
                  </button>
                ))}
              </div>
              {/* Телефон: одна кнопка на все пояснения, дальше — вкладки в окне */}
              <button type="button" className="ayah-note ayah-notes-m" onClick={() => setOpen({ no, name: notes[0].name })}>
                {notes.length > 1 ? `Пояснения · ${notes.length}` : notes[0].label}
              </button>
            </>
          ) : null
          return (
            <Fragment key={no}>
              {topic ? (
                <p className="ayah-topic">
                  <span>{topic}</span>
                </p>
              ) : null}
              <div className="ayah fq" id={`p${no}`}>
                {showAr ? (
                  <div className="ayah-ar fq-ar" lang="ar" dir="rtl">
                    {/* Без перевода номер абзаца стоит у арабского текста */}
                    {!showTr ? <span className="fq-no">{no}</span> : null}
                    {p.arabic}
                    {/* Без перевода кнопки — под арабским текстом */}
                    {!showTr && buttons ? <div className="fq-ar-btns">{buttons}</div> : null}
                  </div>
                ) : null}
                {showTr ? (
                  <div className="ayah-tr">
                    <span className="ayah-no">{no}</span>
                    <p>{p.translation.trim() ? <Translation text={p.translation} /> : <span className="tr-note">Перевод абзаца готовится.</span>}</p>
                    {buttons}
                  </div>
                ) : null}
              </div>
            </Fragment>
          )
        })}
      </div>

      {open && cur && note && showNotes ? (
        <div className="cm-back" onClick={() => setOpen(null)}>
          <div className="cm" role="dialog" aria-modal="true" aria-labelledby="fq-title" onClick={(e) => e.stopPropagation()}>
            <div className="cm-head">
              <div>
                <p className="eyebrow">
                  {chapterTitle}, абзац {open.no}
                </p>
                <h2 id="fq-title">{note.label}</h2>
              </div>
              <button type="button" className="cm-x" aria-label="Закрыть" onClick={() => setOpen(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {cur.notes.length > 1 ? (
              <div className="cm-tabs" role="tablist" aria-label="Пояснения к абзацу">
                {cur.notes.map((n) => (
                  <button key={n.name} type="button" role="tab" aria-selected={n.name === note.name} className={n.name === note.name ? 'on' : ''} onClick={() => setOpen({ no: open.no, name: n.name })}>
                    {n.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="cm-ayah">
              <p className="cm-ar fq-ar" lang="ar" dir="rtl">
                {cur.arabic}
              </p>
              {cur.translation.trim() ? (
                <p className="cm-tr">
                  <Translation text={cur.translation} />
                </p>
              ) : null}
            </div>
            <div className="cm-body" role="tabpanel">
              {note.body}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
