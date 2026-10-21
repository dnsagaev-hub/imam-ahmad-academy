'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { useAudioPlayer, type Track } from '@/components/audio/AudioPlayer'
import { SURAHS, audioUrl, splitTranslation, type Reciter, type Surah } from '@/lib/quran'
import type { AyahTime } from '@/lib/quranTiming'

const RECITER_KEY = 'quran-reciter'

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

// Элемент виден на экране: ниже шапки и выше плеера внизу
const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect()
  const player = document.querySelector('.player-bar')?.getBoundingClientRect().height ?? 0
  return r.bottom > 70 && r.top < window.innerHeight - player - 40
}

const trackOf = (r: Reciter, s: Surah): Track | null => {
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

/** Сура: вкладки «Текст и перевод» и «Слушать», аяты в две колонки, окно комментария к аяту. */
export function SurahView({
  surah,
  arabic,
  basmala,
  basmalaRu,
  translation,
  comments,
  reciters: all,
}: {
  surah: Surah
  arabic: string[]
  basmala: string | null
  basmalaRu: string | null
  translation: string[] | null
  comments: Record<number, ReactNode>
  reciters: Reciter[]
}) {
  // Чтец со своими файлами показывается только у сур, для которых загружена запись
  const reciters = all.filter((r) => audioUrl(r, surah.n))
  const { current, playing, play, audio } = useAudioPlayer()
  const [tab, setTab] = useState<'read' | 'listen'>('read')
  const [reciterId, setReciterId] = useState(reciters[0]?.id ?? '')
  const [open, setOpen] = useState<number | null>(null)
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
    loadTiming(playingReciter, surah.n).then((t) => alive && setTiming(t))
    return () => {
      alive = false
    }
  }, [playingReciter, surah.n])

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
      const saved = localStorage.getItem(RECITER_KEY)
      if (saved && reciters.some((r) => r.id === saved)) setReciterId(saved)
    } catch {
      /* без памяти браузера — чтец по умолчанию */
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

  const start = (r: Reciter) => {
    setReciterId(r.id)
    try {
      localStorage.setItem(RECITER_KEY, r.id)
    } catch {
      /* ничего */
    }
    // Очередь — все суры этого чтеца: кнопки «вперёд/назад» плеера переходят к соседней суре
    const track = trackOf(r, surah)
    if (track) play(track, SURAHS.map((s) => trackOf(r, s)).filter((t): t is Track => t !== null))
  }

  const openListen = () => {
    setTab('listen')
    const r = reciters.find((x) => x.id === reciterId) ?? reciters[0]
    if (r && !current?.id.startsWith(`quran-${surah.n}-`)) start(r)
  }

  return (
    <>
      <div className="sv-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'read'} className={tab === 'read' ? 'on' : ''} onClick={() => setTab('read')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z" />
          </svg>
          Читать
        </button>
        <button type="button" role="tab" aria-selected={tab === 'listen'} className={tab === 'listen' ? 'on' : ''} onClick={openListen}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
            <rect x="3" y="14" width="4" height="6" rx="1.5" />
            <rect x="17" y="14" width="4" height="6" rx="1.5" />
          </svg>
          Слушать
        </button>
      </div>

      {tab === 'listen' ? (
        <section className="sv-listen" aria-label="Чтецы">
          <p className="sv-listen-lead">
            {reciters.length
              ? 'Выберите чтеца — сура зазвучит в плеере внизу экрана. Плеер не прерывается, пока вы читаете перевод.'
              : 'Записей этой суры пока нет.'}
          </p>
          <ul className="reciters">
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
            <p className="sv-sync">
              {timing.length
                ? 'Аят, который сейчас читает чтец, подсвечен в тексте ниже.'
                : 'У этой записи нет разметки аятов, поэтому подсветки нет.'}
            </p>
          ) : null}
        </section>
      ) : null}

      {!translation ? (
        <p className="sv-wait">
          Перевод этой суры готовится. Пока здесь только арабский текст — перевод появится, как только будет добавлен.
        </p>
      ) : null}

      <div className={`ayahs${translation ? '' : ' ar-only'}`}>
        {basmala ? (
          <div className={`basmala${now === 0 ? ' now' : ''}`} id="a0">
            <p lang="ar" dir="rtl">
              {basmala}
            </p>
            {basmalaRu ? <p className="basmala-ru">{basmalaRu}</p> : null}
          </div>
        ) : null}
        {arabic.map((ar, i) => {
          const no = i + 1
          const note = comments[no] != null
          return (
            <div className={`ayah${now === no ? ' now' : ''}`} id={`a${no}`} key={no} aria-current={now === no ? 'true' : undefined}>
              <div className="ayah-ar" lang="ar" dir="rtl">
                {ar}
              </div>
              {translation ? (
                <div className="ayah-tr">
                  <span className="ayah-no">{no}</span>
                  <p>
                    <Translation text={translation[i] ?? ''} />
                  </p>
                  {note ? (
                    <button type="button" className="ayah-note" onClick={() => setOpen(no)} aria-label={`Комментарий к аяту ${no}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Комментарий
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {open !== null && comments[open] != null ? (
        <div className="cm-back" onClick={() => setOpen(null)}>
          <div className="cm" role="dialog" aria-modal="true" aria-labelledby="cm-title" onClick={(e) => e.stopPropagation()}>
            <div className="cm-head">
              <div>
                <p className="eyebrow">Комментарий</p>
                <h2 id="cm-title">
                  Сура {surah.ru}, аят {open}
                </h2>
              </div>
              <button type="button" className="cm-x" aria-label="Закрыть" onClick={() => setOpen(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="cm-ayah">
              <p className="cm-ar" lang="ar" dir="rtl">
                {arabic[open - 1]}
              </p>
              {translation ? (
                <p className="cm-tr">
                  <Translation text={translation[open - 1] ?? ''} />
                </p>
              ) : null}
            </div>
            <div className="cm-body">{comments[open]}</div>
          </div>
        </div>
      ) : null}
    </>
  )
}
