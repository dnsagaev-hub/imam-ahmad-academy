'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { fmtClock, getListen, saveListen } from '@/lib/listenStore'

/*
 * Общий аудиоплеер внизу экрана. Живёт в корневом макете, поэтому не прерывается
 * при переходе между страницами. Запоминает, где ученик остановился в каждом уроке.
 */

export type Track = { id: string; title: string; subtitle?: string; url: string; href?: string }

type Ctx = {
  current: Track | null
  playing: boolean
  play: (track: Track, queue?: Track[]) => void
  toggle: () => void
  /** Сам элемент <audio>: страница суры следит по нему, какой аят звучит */
  audio: () => HTMLAudioElement | null
}

const AudioCtx = createContext<Ctx>({ current: null, playing: false, play: () => {}, toggle: () => {}, audio: () => null })
export const useAudioPlayer = () => useContext(AudioCtx)

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75]

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const lastSave = useRef(0)
  const pendingSeek = useRef(0)

  const current = index >= 0 ? (queue[index] ?? null) : null

  const load = useCallback(
    (track: Track) => {
      const a = audioRef.current
      if (!a) return
      // Продолжить с места, где остановились (если урок ещё не дослушан)
      const saved = getListen(track.id)
      pendingSeek.current = saved && !saved.done && saved.t > 5 ? saved.t - 3 : 0
      setTime(pendingSeek.current)
      a.src = track.url
      a.playbackRate = rate
      a.play().catch(() => setPlaying(false))
    },
    [rate],
  )

  const play = useCallback(
    (track: Track, q?: Track[]) => {
      const a = audioRef.current
      if (current?.id === track.id && a) {
        if (a.paused) a.play().catch(() => {})
        else a.pause()
        return
      }
      const list = q && q.some((t) => t.id === track.id) ? q : [track]
      setQueue(list)
      setIndex(list.findIndex((t) => t.id === track.id))
      load(track)
    },
    [current?.id, load],
  )

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a || !current) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }, [current])

  const go = useCallback(
    (delta: number) => {
      const i = index + delta
      if (i < 0 || i >= queue.length) return
      setIndex(i)
      load(queue[i])
    },
    [index, queue, load],
  )

  const seekBy = (s: number) => {
    const a = audioRef.current
    if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0) - 1, a.currentTime + s))
  }

  const remember = useCallback(() => {
    const a = audioRef.current
    if (a && current) saveListen(current.id, a.currentTime, a.duration)
  }, [current])

  // Отступ снизу у страницы, пока виден плеер
  useEffect(() => {
    document.body.classList.toggle('has-player', Boolean(current))
  }, [current])

  // Кнопки на экране блокировки телефона и в системных уведомлениях
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.subtitle ?? 'Академия имама Ахмада',
        album: 'Академия имама Ахмада',
        artwork: [{ src: '/brand/emblem.png', sizes: '191x391', type: 'image/png' }],
      })
      navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play())
      navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause())
      navigator.mediaSession.setActionHandler('seekbackward', () => seekBy(-15))
      navigator.mediaSession.setActionHandler('seekforward', () => seekBy(15))
      navigator.mediaSession.setActionHandler('previoustrack', index > 0 ? () => go(-1) : null)
      navigator.mediaSession.setActionHandler('nexttrack', index < queue.length - 1 ? () => go(1) : null)
    } catch {
      /* не все браузеры поддерживают */
    }
  }, [current, index, queue.length, go])

  const audio = useCallback(() => audioRef.current, [])
  const value = useMemo(() => ({ current, playing, play, toggle, audio }), [current, playing, play, toggle, audio])
  const pct = duration ? (time / duration) * 100 : 0

  return (
    <AudioCtx.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false)
          remember()
        }}
        onLoadedMetadata={(e) => {
          const a = e.currentTarget
          setDuration(a.duration)
          a.playbackRate = rate
          if (pendingSeek.current > 0) {
            a.currentTime = pendingSeek.current
            pendingSeek.current = 0
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime
          setTime(t)
          if (Math.abs(t - lastSave.current) > 5) {
            lastSave.current = t
            remember()
          }
        }}
        onEnded={() => {
          remember()
          if (index < queue.length - 1) go(1)
        }}
      />
      {current ? (
        <div className="player-bar" role="region" aria-label="Аудиоплеер">
          <div className="container player-inner">
            <div className="player-track">
              {current.href ? (
                <Link href={current.href} className="player-title">
                  {current.title}
                </Link>
              ) : (
                <span className="player-title">{current.title}</span>
              )}
              {current.subtitle ? <span className="player-sub">{current.subtitle}</span> : null}
            </div>

            <div className="player-center">
              <div className="player-controls">
                <button type="button" onClick={() => go(-1)} disabled={index <= 0} aria-label="Предыдущий урок">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
                </button>
                <button type="button" onClick={() => seekBy(-15)} aria-label="Назад на 15 секунд" className="player-skip">
                  −15
                </button>
                <button type="button" onClick={toggle} className="player-main" aria-label={playing ? 'Пауза' : 'Слушать'}>
                  {playing ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <button type="button" onClick={() => seekBy(15)} aria-label="Вперёд на 15 секунд" className="player-skip">
                  +15
                </button>
                <button type="button" onClick={() => go(1)} disabled={index >= queue.length - 1} aria-label="Следующий урок">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" /></svg>
                </button>
              </div>
              <div className="player-progress">
                <span>{fmtClock(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={1}
                  value={Math.min(time, duration || 0)}
                  onChange={(e) => {
                    const a = audioRef.current
                    if (a) a.currentTime = Number(e.target.value)
                  }}
                  aria-label="Перемотка"
                  style={{ ['--pct' as string]: `${pct}%` }}
                />
                <span>{fmtClock(duration)}</span>
              </div>
            </div>

            <div className="player-right">
              <button
                type="button"
                className="player-rate"
                aria-label={`Скорость ${rate}×, нажмите, чтобы изменить`}
                onClick={() => {
                  const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
                  setRate(next)
                  if (audioRef.current) audioRef.current.playbackRate = next
                }}
              >
                {String(rate).replace('.', ',')}×
              </button>
              <a href={current.url} download className="player-icon" aria-label="Скачать MP3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14" /></svg>
              </a>
              <button
                type="button"
                className="player-icon"
                aria-label="Закрыть плеер"
                onClick={() => {
                  remember()
                  audioRef.current?.pause()
                  setIndex(-1)
                  setQueue([])
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AudioCtx.Provider>
  )
}
