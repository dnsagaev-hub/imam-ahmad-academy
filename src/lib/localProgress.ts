'use client'

/*
 * Прогресс ученика в браузере (когда регистрация выключена).
 * Хранится в localStorage этого устройства; можно сохранить в файл и загрузить на другом устройстве.
 */
import { useSyncExternalStore } from 'react'

import { emptyProgress, type Progress } from './learning'

const KEY = 'imam-ahmad-academy:progress:v1'
const EVENT = 'academy-progress-change'

export type LocalAttempt = {
  lessonId: string
  lessonTitle: string
  courseTitle?: string
  score: number
  passed: boolean
  attempt: number
  date: string
}

type Stored = { v: 1; attempts: LocalAttempt[] }

function read(): Stored {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { v: 1, attempts: [] }
    const data = JSON.parse(raw)
    if (data && Array.isArray(data.attempts)) return { v: 1, attempts: data.attempts }
  } catch {
    /* хранилище недоступно (приватный режим) — работаем без сохранения */
  }
  return { v: 1, attempts: [] }
}

function write(data: Stored) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* не удалось сохранить */
  }
  cache = null
  window.dispatchEvent(new Event(EVENT))
}

export function attemptsFor(lessonId: string | number): number {
  return read().attempts.filter((a) => a.lessonId === String(lessonId)).length
}

export function addAttempt(a: Omit<LocalAttempt, 'attempt' | 'date'>) {
  const data = read()
  const attempt = data.attempts.filter((x) => x.lessonId === a.lessonId).length + 1
  data.attempts.unshift({ ...a, attempt, date: new Date().toISOString() })
  write(data)
}

export function exportProgress(): string {
  return JSON.stringify({ app: 'imam-ahmad-academy', ...read() }, null, 2)
}

/** Скачать прогресс файлом (для переноса на другое устройство). */
export function downloadProgressFile() {
  const blob = new Blob([exportProgress()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progress-imam-ahmad-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function importProgress(json: string): boolean {
  try {
    const data = JSON.parse(json)
    if (!data || !Array.isArray(data.attempts)) return false
    const clean: LocalAttempt[] = data.attempts
      .filter((a: any) => a && typeof a.lessonId === 'string' && typeof a.score === 'number')
      .map((a: any) => ({
        lessonId: a.lessonId,
        lessonTitle: String(a.lessonTitle ?? ''),
        courseTitle: a.courseTitle ? String(a.courseTitle) : undefined,
        score: Math.max(0, Math.min(100, a.score)),
        passed: Boolean(a.passed),
        attempt: Number(a.attempt) || 1,
        date: String(a.date ?? new Date().toISOString()),
      }))
    write({ v: 1, attempts: clean })
    return true
  } catch {
    return false
  }
}

export function clearProgress() {
  write({ v: 1, attempts: [] })
}

function toProgress(data: Stored): Progress {
  const p = emptyProgress()
  for (const a of data.attempts) {
    if (a.passed) p.passed.add(a.lessonId)
    p.bestScore.set(a.lessonId, Math.max(p.bestScore.get(a.lessonId) ?? 0, a.score))
    p.attempts.set(a.lessonId, (p.attempts.get(a.lessonId) ?? 0) + 1)
    p.history.push({
      id: `${a.lessonId}-${a.attempt}-${a.date}`,
      lessonId: a.lessonId,
      lessonTitle: a.lessonTitle,
      courseTitle: a.courseTitle ?? '',
      score: a.score,
      passed: a.passed,
      attempt: a.attempt,
      createdAt: a.date,
    })
  }
  return p
}

let cache: { progress: Progress; ready: true } | null = null
const serverSnapshot = { progress: emptyProgress(), ready: false as const }

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      cb()
    }
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  if (!cache) cache = { progress: toProgress(read()), ready: true }
  return cache
}

/** Прогресс из браузера. `ready` = false, пока страница не загрузилась в браузере. */
export function useLocalProgress(): { progress: Progress; ready: boolean } {
  return useSyncExternalStore<{ progress: Progress; ready: boolean }>(subscribe, getSnapshot, () => serverSnapshot)
}
