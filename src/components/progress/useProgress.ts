'use client'

import { useMemo } from 'react'

import { emptyProgress, type Progress } from '@/lib/learning'
import { useLocalProgress } from '@/lib/localProgress'

/**
 * Откуда брать прогресс:
 * — local: из браузера ученика (регистрация выключена);
 * — server: с сервера (регистрация включена), данные передаёт страница.
 */
export type ProgressSource =
  | { mode: 'local' }
  | { mode: 'server'; loggedIn: boolean; passed: string[]; scores: [string, number][]; attempts: [string, number][] }

export function serverSource(loggedIn: boolean, p: Progress): ProgressSource {
  return {
    mode: 'server',
    loggedIn,
    passed: [...p.passed],
    scores: [...p.bestScore.entries()],
    attempts: [...p.attempts.entries()],
  }
}

/**
 * `guestLimited` — гость при включённой регистрации: ему открыт только первый урок курса.
 * `ready` — прогресс уже известен (для local — после загрузки страницы в браузере).
 */
export function useProgress(source: ProgressSource): { progress: Progress; ready: boolean; guestLimited: boolean } {
  const local = useLocalProgress()
  const server = useMemo(() => {
    if (source.mode !== 'server') return null
    const p = emptyProgress()
    source.passed.forEach((id) => p.passed.add(id))
    source.scores.forEach(([id, s]) => p.bestScore.set(id, s))
    source.attempts.forEach(([id, n]) => p.attempts.set(id, n))
    return p
  }, [source])
  if (source.mode === 'local') return { progress: local.progress, ready: local.ready, guestLimited: false }
  return { progress: server!, ready: true, guestLimited: !source.loggedIn }
}
