'use client'

import { useEffect, useState } from 'react'

import { useAudioPlayer, type Track } from '@/components/audio/AudioPlayer'
import { trackOf } from '@/components/quran/SurahView'
import { SURAHS, audioUrl, type Reciter, type Surah } from '@/lib/quran'

// Вид мусхафа: одна страница или разворот из двух (выбор ученика помнит браузер)
const MODE_KEY = 'mushaf-mode'
type Mode = 'one' | 'two'

const TOTAL = 604

/** Страницы суры в мусхафе Медины: по одной или разворотами, и плеер чтеца. */
export function MushafView({ surah, from, to, reciters: all }: { surah: Surah; from: number; to: number; reciters: Reciter[] }) {
  const reciters = all.filter((r) => audioUrl(r, surah.n))
  const { current, playing, play } = useAudioPlayer()
  const [mode, setMode] = useState<Mode>('one')
  const [picked, setPick] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(MODE_KEY) === 'two') setMode('two')
    } catch {}
  }, [])

  const choose = (m: Mode) => {
    setMode(m)
    try {
      localStorage.setItem(MODE_KEY, m)
    } catch {}
  }

  // Если сура уже звучит (например, включена на странице перевода) — в списке выбран её чтец
  const prefix = `quran-${surah.n}-`
  const playingId = current?.id.startsWith(prefix) ? current.id.slice(prefix.length) : null
  const pick = picked ?? playingId ?? reciters[0]?.id ?? ''
  const isOn = playingId !== null && playingId === pick && playing

  // Очередь — все суры этого чтеца, как на странице перевода
  const start = (id: string) => {
    const r = reciters.find((x) => x.id === id)
    const track = r && trackOf(r, surah)
    if (r && track)
      play(
        track,
        SURAHS.map((s) => trackOf(r, s)).filter((t): t is Track => t !== null),
      )
  }
  // Другой чтец, пока сура звучит, — сразу его запись
  const change = (id: string) => {
    setPick(id)
    if (playingId && playing && id !== playingId) start(id)
  }

  const pages = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  // Разворот как в печатном мусхафе: нечётная страница справа, чётная слева; края дополняются соседними страницами
  const spreads: number[][] = []
  for (let a = from % 2 ? from : from - 1; a <= to; a += 2) spreads.push([a, a + 1].filter((p) => p >= 1 && p <= TOTAL))

  const page = (pg: number, eager: boolean) => (
    <figure className={`mp-page${pg < from || pg > to ? ' mp-near' : ''}`} key={pg}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/quran/mushaf/${pg}`} width={1300} height={2103} alt={`Мусхаф Медины, страница ${pg}`} loading={eager ? 'eager' : 'lazy'} />
      <figcaption>{pg}</figcaption>
    </figure>
  )

  return (
    <>
      <div className="mp-bar">
        <div className="sv-show" role="radiogroup" aria-label="Вид мусхафа">
          {(
            [
              ['one', 'Одна страница'],
              ['two', 'Две страницы'],
            ] as const
          ).map(([m, label]) => (
            <label key={m} className={mode === m ? 'on' : ''}>
              <input type="radio" name="mushaf-mode" checked={mode === m} onChange={() => choose(m)} />
              {label}
            </label>
          ))}
        </div>
        {reciters.length ? (
          <div className="mp-listen">
            <select aria-label="Чтец" value={pick} onChange={(e) => change(e.target.value)}>
              {reciters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button type="button" className="sv-chip" onClick={() => start(pick)} aria-pressed={isOn}>
              {isOn ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {isOn ? 'Пауза' : 'Слушать'}
            </button>
          </div>
        ) : null}
      </div>

      {mode === 'two' ? (
        <div className="mp-spreads">
          {spreads.map((sp, i) => (
            <div className="mp-spread" dir="rtl" key={sp[0]}>
              {sp.map((pg) => page(pg, i < 1))}
            </div>
          ))}
        </div>
      ) : (
        <div className="mp-pages">{pages.map((pg, i) => page(pg, i < 2))}</div>
      )}
    </>
  )
}
