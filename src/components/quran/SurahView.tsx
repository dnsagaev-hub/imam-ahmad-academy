'use client'

import Link from 'next/link'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'

import { useAudioPlayer, type Track } from '@/components/audio/AudioPlayer'
import { AYAH_NOTES, audioUrl, splitTranslation, type AyahNoteName, type Reciter, type Surah } from '@/lib/quran'
import type { AyahTime } from '@/lib/quranTiming'

// Что показывать: арабский, перевод или оба, темы аятов, пояснения (выбор ученика помнит браузер)
const SHOW_KEY = 'quran-show'
type Show = { ar: boolean; tr: boolean; topics: boolean; notes: boolean }

// Разметка аятов по «чтец-сура», чтобы не спрашивать сервер повторно
const timingCache = new Map<string, Promise<AyahTime[]>>()
const loadTiming = (reciter: string, surah: number) => {
  const key = `${reciter}-${surah}`
  let p = timingCache.get(key)
  if (!p) {
    p = fetch(`/quran/timing?r=${encodeURIComponent(reciter)}&s=${surah}`)
      .then((r) => (r.ok ? r.json() : { ayahs: [] }))
      .then((d: { ayahs?: AyahTime[] }) => d.ayahs ?? [])
      .catch(() => [])
    timingCache.set(key, p)
  }
  return p
}

// аль-Фатиха на сайте без басмалы в счёте, а разметка mp3quran — по мусхафу Медины: аят 1 разметки — басмала (0),
// аяты 2–6 сдвигаются на один назад, седьмой делится на 6 и 7 по доле текста (примерно)
const fatihaTiming = (t: AyahTime[], share: number): AyahTime[] =>
  t.flatMap(([n, s, e]): AyahTime[] => {
    if (n === 1) return [[0, s, e]]
    if (n < 7) return [[n - 1, s, e]]
    const mid = Math.round(s + (e - s) * share)
    return [
      [6, s, mid],
      [7, mid, e],
    ]
  })

// Элемент виден на экране: ниже шапки и выше плеера внизу
const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect()
  const player = document.querySelector('.player-bar')?.getBoundingClientRect().height ?? 0
  return r.bottom > 70 && r.top < window.innerHeight - player - 40
}

// Запись суры у чтеца (нужна и странице мусхафа)
export const trackOf = (r: Reciter, s: Surah): Track | null => {
  const url = audioUrl(r, s.n)
  return url ? { id: `quran-${s.n}-${r.id}`, title: `Сура ${s.n} · ${s.ru}`, subtitle: r.name, url, href: `/quran/${s.n}` } : null
}

function Translation({ text }: { text: string }) {
  return (
    <>
      {splitTranslation(text).map((p, i) =>
        p.note ? (
          <span key={i} className="tr-note">
            {p.text}
          </span>
        ) : (
          <strong key={i}>{p.text}</strong>
        ),
      )}
    </>
  )
}

/** Пояснение к аяту (толкование, причина ниспослания…), уже собранное на сервере. */
export type AyahNote = { name: AyahNoteName; body: ReactNode }

const noteLabel = (name: AyahNoteName) => AYAH_NOTES.find((f) => f.name === name)!

/** Тема отрывка: подпись над аятом, с которого она начинается. */
export type AyahTopic = { from: number; title: string }

/** Сура: вкладки «Текст и перевод» и «Слушать», аяты в две колонки, окно пояснений к аяту. */
export function SurahView({
  surah,
  arabic,
  basmala,
  basmalaRu,
  translation,
  notes,
  topics,
  mushaf,
  reciters: all,
  surahs,
  fatihaShare,
}: {
  surah: Surah
  arabic: string[]
  basmala: string | null
  basmalaRu: string | null
  translation: string[] | null
  notes: Record<number, AyahNote[]>
  topics: AyahTopic[]
  mushaf: { from: number; to: number }
  reciters: Reciter[]
  /** Все суры с названиями из админки — для очереди плеера */
  surahs: Surah[]
  /** аль-Фатиха: доля аята 6 в седьмом аяте мусхафа — разметка чтецов идёт по счёту мусхафа Медины */
  fatihaShare?: number
}) {
  // Чтец со своими файлами показывается только у сур, для которых загружена запись
  const reciters = all.filter((r) => audioUrl(r, surah.n))
  const { current, playing, play, audio } = useAudioPlayer()
  const [tab, setTab] = useState<'read' | 'listen'>('read')
  const [show, setShow] = useState<Show>({ ar: true, tr: true, topics: true, notes: true })
  const [open, setOpen] = useState<{ no: number; name: AyahNoteName } | null>(null)
  const [timing, setTiming] = useState<AyahTime[] | null>(null)
  const [now, setNow] = useState<number | null>(null)
  const nowRef = useRef<number | null>(null)

  // Звучит эта сура — какой чтец (по номеру дорожки «quran-<сура>-<чтец>»)
  const prefix = `quran-${surah.n}-`
  const playingReciter = current?.id.startsWith(prefix) ? current.id.slice(prefix.length) : null

  useEffect(() => {
    setTiming(null)
    if (!playingReciter) return
    let alive = true
    loadTiming(playingReciter, surah.n).then((t) => alive && setTiming(fatihaShare === undefined ? t : fatihaTiming(t, fatihaShare)))
    return () => {
      alive = false
    }
  }, [playingReciter, surah.n, fatihaShare])

  // Подсветка: по времени записи находим аят; 0 — вступление (басмала)
  useEffect(() => {
    const a = audio()
    const mark = (n: number | null) => {
      if (n === nowRef.current) return
      const prev = nowRef.current === null ? null : document.getElementById(nowRef.current === 0 ? 'a0' : `a${nowRef.current}`)
      nowRef.current = n
      setNow(n)
      // Страница едет за чтецом, только если ученик смотрел на прошлый аят (не листает сам)
      const next = n === null ? null : document.getElementById(`a${n}`)
      if (next && !onScreen(next) && (!prev || onScreen(prev))) next.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (!a || !timing?.length) {
      mark(null)
      return
    }
    const maxEnd = timing[timing.length - 1][2]
    const update = () => {
      // mp3quran отдаёт время в миллисекундах; на всякий случай различаем по длине записи
      const scale = a.duration ? (maxEnd > a.duration * 50 ? 1000 : 1) : maxEnd > 20000 ? 1000 : 1
      const t = a.currentTime * scale
      const hit = timing.find(([, s, e]) => t >= s && t < e)
      // До первого аята чтец читает истиаза и басмалу — подсвечиваем басмалу, даже если вступление не размечено
      const n = hit ? hit[0] : t < timing[0][1] ? 0 : null
      mark(n !== null && n >= 0 && n <= arabic.length ? n : null)
    }
    update()
    a.addEventListener('timeupdate', update)
    a.addEventListener('seeked', update)
    return () => {
      a.removeEventListener('timeupdate', update)
      a.removeEventListener('seeked', update)
    }
  }, [timing, audio, arabic.length])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SHOW_KEY) ?? 'null') as Partial<Show> | null
      // Темы и пояснения по умолчанию видны: скрыты, только если ученик сам снял галочку
      if (saved && (saved.ar || saved.tr)) setShow({ ar: !!saved.ar, tr: !!saved.tr, topics: saved.topics !== false, notes: saved.notes !== false })
    } catch {
      /* без памяти браузера — арабский и перевод вместе */
    }
  }, [])

  // Арабский и перевод: снять обе галочки нельзя — если убрать последнюю, включается другая
  const toggle = (k: keyof Show) => {
    const other = k === 'ar' ? 'tr' : 'ar'
    const next = { ...show, [k]: !show[k] } as Show
    if (!next.ar && !next.tr) next[other] = true
    setShow(next)
    try {
      localStorage.setItem(SHOW_KEY, JSON.stringify(next))
    } catch {
      /* ничего */
    }
  }
  // Без перевода суры показывается только арабский текст, переключатель не нужен
  const showAr = !translation || show.ar
  const showTr = !!translation && show.tr
  const topicAt = new Map(show.topics ? topics.map((t) => [t.from, t.title]) : [])
  // Галочки тем и пояснений — только если в этой суре они есть (пояснения видны под переводом)
  const hasNotes = !!translation && Object.keys(notes).length > 0
  const showNotes = hasNotes && show.notes

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

  const start = (r: Reciter) => {
    // Очередь — все суры этого чтеца: кнопки «вперёд/назад» плеера переходят к соседней суре
    const track = trackOf(r, surah)
    if (track)
      play(
        track,
        surahs.map((s) => trackOf(r, s)).filter((t): t is Track => t !== null),
      )
  }

  return (
    <>
      <div className="sv-bar">
        <div className="sv-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'read'} className={tab === 'read' ? 'on' : ''} onClick={() => setTab('read')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z" />
            </svg>
            Читать
          </button>
          <button type="button" role="tab" aria-selected={tab === 'listen'} className={tab === 'listen' ? 'on' : ''} onClick={() => setTab('listen')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
              <rect x="3" y="14" width="4" height="6" rx="1.5" />
              <rect x="17" y="14" width="4" height="6" rx="1.5" />
            </svg>
            Слушать
          </button>
        </div>
        <div className="sv-tools">
          {translation || topics.length || hasNotes ? (
            <div className="sv-show" role="group" aria-label="Что показывать">
              {translation ? (
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
          ) : null}
          {/* Сура в мусхафе Медины: страницы на сайте и PDF */}
          <div className="sv-mushaf">
            {/* Link, а не обычная ссылка: страница не перезагружается и чтение в плеере не прерывается */}
            <Link className="sv-chip" href={`/quran/${surah.n}/mushaf`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z" />
              </svg>
              Мусхаф · {mushaf.from === mushaf.to ? `стр. ${mushaf.from}` : `стр. ${mushaf.from}–${mushaf.to}`}
            </Link>
            <a className="sv-chip" href={`/quran/${surah.n}/mushaf.pdf`} download aria-label={`Скачать PDF: сура ${surah.ru} в мусхафе Медины`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
              </svg>
              PDF
            </a>
          </div>
        </div>
      </div>

      {tab === 'listen' ? (
        <section className="sv-listen" aria-label="Чтецы">
          <p className="sv-listen-lead">{reciters.length ? 'Нажмите на чтеца — сура зазвучит в плеере внизу экрана. Плеер не прерывается, пока вы читаете перевод.' : 'Записей этой суры пока нет.'}</p>
          <ul className="reciters">
            {/* Порядок чтецов — как в админке, выбранный чтец остаётся на своём месте */}
            {reciters.map((r) => {
              const isCur = current?.id === `quran-${surah.n}-${r.id}`
              return (
                <li key={r.id}>
                  <button type="button" className={`reciter${isCur ? ' on' : ''}`} onClick={() => start(r)}>
                    <span className="reciter-ico" aria-hidden="true">
                      {isCur && playing ? (
                        <span className="eq">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </span>
                    <span className="reciter-name">
                      <b>{r.name}</b>
                      {r.nameAr ? (
                        <span lang="ar" dir="rtl">
                          {r.nameAr}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {playingReciter && timing ? (
            <p className="sv-sync">{timing.length ? 'Аят, который сейчас читает чтец, подсвечен в тексте ниже.' : 'У этой записи нет разметки аятов, поэтому подсветки нет.'}</p>
          ) : null}
        </section>
      ) : null}

      {!translation ? <p className="sv-wait">Перевод этой суры готовится. Пока здесь только арабский текст — перевод появится, как только будет добавлен.</p> : null}

      <div className={`ayahs${showTr ? (showAr ? '' : ' tr-only') : ' ar-only'}`}>
        {basmala ? (
          <div className={`basmala${now === 0 ? ' now' : ''}`} id="a0">
            {showAr ? (
              <p lang="ar" dir="rtl">
                {basmala}
              </p>
            ) : null}
            {basmalaRu && showTr ? <p className="basmala-ru">{basmalaRu}</p> : null}
          </div>
        ) : null}
        {arabic.map((ar, i) => {
          const no = i + 1
          const list = notes[no]
          const topic = topicAt.get(no)
          return (
            <Fragment key={no}>
              {topic ? (
                <p className="ayah-topic">
                  <span>{topic}</span>
                </p>
              ) : null}
              <div className={`ayah${now === no ? ' now' : ''}`} id={`a${no}`} aria-current={now === no ? 'true' : undefined}>
                {showAr ? (
                  <div className="ayah-ar" lang="ar" dir="rtl">
                    {ar}
                  </div>
                ) : null}
                {showTr && translation ? (
                  <div className="ayah-tr">
                    <span className="ayah-no">{no}</span>
                    <p>
                      <Translation text={translation[i] ?? ''} />
                    </p>
                    {list && showNotes ? (
                      <>
                        <div className="ayah-notes">
                          {list.map((n) => {
                            const f = noteLabel(n.name)
                            return (
                              <button key={n.name} type="button" className="ayah-note" onClick={() => setOpen({ no, name: n.name })} aria-label={`${f.label}: аят ${no}`}>
                                {f.short}
                              </button>
                            )
                          })}
                        </div>
                        {/* Телефон: одна кнопка на все пояснения, дальше — вкладки в окне */}
                        <button type="button" className="ayah-note ayah-notes-m" onClick={() => setOpen({ no, name: list[0].name })}>
                          {list.length > 1 ? `Пояснения · ${list.length}` : noteLabel(list[0].name).short}
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Fragment>
          )
        })}
      </div>

      {open && showNotes && notes[open.no]?.some((n) => n.name === open.name) ? (
        <div className="cm-back" onClick={() => setOpen(null)}>
          <div className="cm" role="dialog" aria-modal="true" aria-labelledby="cm-title" onClick={(e) => e.stopPropagation()}>
            <div className="cm-head">
              <div>
                <p className="eyebrow">
                  Сура {surah.ru}, аят {open.no}
                </p>
                <h2 id="cm-title">{noteLabel(open.name).label}</h2>
              </div>
              <button type="button" className="cm-x" aria-label="Закрыть" onClick={() => setOpen(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {notes[open.no].length > 1 ? (
              <div className="cm-tabs" role="tablist" aria-label="Пояснения к аяту">
                {notes[open.no].map((n) => (
                  <button
                    key={n.name}
                    type="button"
                    role="tab"
                    aria-selected={n.name === open.name}
                    className={n.name === open.name ? 'on' : ''}
                    onClick={() => setOpen({ no: open.no, name: n.name })}
                  >
                    {noteLabel(n.name).short}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="cm-ayah">
              <p className="cm-ar" lang="ar" dir="rtl">
                {arabic[open.no - 1]}
              </p>
              {translation ? (
                <p className="cm-tr">
                  <Translation text={translation[open.no - 1] ?? ''} />
                </p>
              ) : null}
            </div>
            <div className="cm-body" role="tabpanel">
              {notes[open.no].find((n) => n.name === open.name)!.body}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
