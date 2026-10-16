'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { markLessonComplete } from '@/app/(frontend)/actions'
import { addAttempt, useLocalProgress } from '@/lib/localProgress'

/** Для уроков без теста: «Отметить пройденным». */
export function MarkComplete({
  lessonId,
  done,
  loggedIn,
  nextHref,
  mode = 'server',
  lessonTitle = '',
  courseTitle,
}: {
  lessonId: string | number
  done: boolean
  loggedIn: boolean
  nextHref?: string
  mode?: 'server' | 'local'
  lessonTitle?: string
  courseTitle?: string
}) {
  const router = useRouter()
  const local = useLocalProgress()
  const [pending, start] = useTransition()
  const [serverDone, setServerDone] = useState(done)
  const [error, setError] = useState<string | null>(null)
  const isLocal = mode === 'local'
  const isDone = isLocal ? local.progress.passed.has(String(lessonId)) : serverDone

  if (!loggedIn && !isLocal) {
    return (
      <div className="card card-pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="muted">Войдите, чтобы отмечать пройденные уроки.</span>
        <Link href="/login" className="btn">
          Войти
        </Link>
      </div>
    )
  }

  const markDone = () => {
    if (isLocal) {
      addAttempt({ lessonId: String(lessonId), lessonTitle, courseTitle, score: 100, passed: true })
      return
    }
    start(async () => {
      const r = await markLessonComplete(lessonId)
      if (!r.ok) return setError(r.error)
      setServerDone(true)
      router.refresh()
    })
  }

  return (
    <div className="card card-pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 600 }}>{isDone ? 'Урок пройден' : 'Прослушали урок? Отметьте его пройденным.'}</span>
      {error ? <span className="notice notice-err">{error}</span> : null}
      {isDone ? (
        nextHref ? (
          <Link href={nextHref} className="btn">
            Следующий урок →
          </Link>
        ) : null
      ) : (
        <button type="button" className="btn" disabled={pending} onClick={markDone}>
          Отметить пройденным
        </button>
      )}
    </div>
  )
}
