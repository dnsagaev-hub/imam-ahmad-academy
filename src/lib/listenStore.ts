'use client'

/* Где ученик остановился в каждом аудиоуроке — хранится только в браузере. */
import { useSyncExternalStore } from 'react'

export type ListenEntry = { t: number; d: number; done: boolean; at: string }
type Store = Record<string, ListenEntry>

const KEY = 'imam-ahmad-academy:listen:v1'
const EVENT = 'academy-listen-change'
let cache: Store | null = null
const EMPTY: Store = {}

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw)
      if (d && typeof d === 'object') return d
    }
  } catch {
    /* нет доступа к хранилищу */
  }
  return {}
}

export function getListen(id: string): ListenEntry | undefined {
  return (cache ??= read())[id]
}

/** Сохранить позицию. Урок считается прослушанным, если дослушан до последних 30 секунд (или 95%). */
export function saveListen(id: string, t: number, d: number) {
  if (!Number.isFinite(t) || !Number.isFinite(d) || d <= 0) return
  const store = { ...(cache ??= read()) }
  const prev = store[id]
  const done = Boolean(prev?.done) || t >= d - 30 || t / d >= 0.95
  store[id] = { t: Math.floor(t), d: Math.floor(d), done, at: new Date().toISOString() }
  cache = store
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* не удалось сохранить */
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}

export function useListenMap(): Store {
  return useSyncExternalStore(
    subscribe,
    () => (cache ??= read()),
    () => EMPTY,
  )
}

export function fmtClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}
