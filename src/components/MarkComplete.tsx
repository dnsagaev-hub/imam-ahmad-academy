'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { markLessonComplete } from '@/app/(frontend)/actions'

/** Для уроков без теста. */
export function MarkComplete({
  lessonId,
  done,
  loggedIn,
  nextHref,
}: {
  lessonId: string | number
  done: boolean
  loggedIn: boolean
  nextHref?: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [isDone, setDone] = useState(done)
  const [error, setError] = useState<string | null>(null)

  if (!loggedIn) {
    return (
      <div className="card card-pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="muted">Войдите, чтобы отмечать пройденные уроки.</span>
        <Link href="/login" className="btn">
          Войти
        </Link>
      </div>
    )
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
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await markLessonComplete(lessonId)
              if (!r.ok) return setError(r.error)
              setDone(true)
              router.refresh()
            })
          }
        >
          Отметить пройденным
        </button>
      )}
    </div>
  )
}
