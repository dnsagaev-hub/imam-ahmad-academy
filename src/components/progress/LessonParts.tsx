'use client'

import Link from 'next/link'

import { LockIcon } from '@/components/Icons'
import { canOpenLesson, courseState, type CourseDoc } from '@/lib/learning'

import { useProgress, type ProgressSource } from './useProgress'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/**
 * Закрывает урок, если предыдущий урок курса ещё не сдан (проверка в браузере — режим без регистрации).
 * В режиме с регистрацией проверку делает сервер, здесь урок просто показывается.
 */
export function LessonGate({
  course,
  lessonId,
  source,
  children,
}: {
  course: CourseDoc | null
  lessonId: string | number
  source: ProgressSource
  children: React.ReactNode
}) {
  const { progress, ready } = useProgress(source)
  if (source.mode !== 'local' || !course || !ready || canOpenLesson(course, lessonId, progress)) return <>{children}</>

  const state = courseState(course, progress)
  const here = state.lessons.find((l) => String(l.lesson.id) === String(lessonId))
  return (
    <main className="container section" style={{ maxWidth: 720, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <span className="st st-locked" style={{ width: 64, height: 64 }}>
        <LockIcon size={26} />
      </span>
      <h1 className="page-title" style={{ fontSize: 40 }}>
        {here ? `Урок ${here.number}. ${here.lesson.title}` : 'Урок пока закрыт'}
      </h1>
      <p className="lead">Этот урок откроется после того, как вы сдадите тест предыдущего урока.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {state.currentLesson ? (
          <Link className="btn" href={`/lessons/${state.currentLesson.lesson.slug}`}>
            Перейти к уроку {state.currentLesson.number}
          </Link>
        ) : null}
        <Link className="btn btn-outline" href={`/courses/${course.slug}`}>
          Программа курса
        </Link>
      </div>
    </main>
  )
}

/** Список уроков текущего модуля слева от урока. */
export function ModuleSide({ course, lessonId, source }: { course: CourseDoc; lessonId: string | number; source: ProgressSource }) {
  const { progress, guestLimited } = useProgress(source)
  const state = courseState(course, progress)
  const here = state.lessons.find((l) => String(l.lesson.id) === String(lessonId))
  if (!here) return null
  const list = state.lessons.filter((l) => l.moduleIndex === here.moduleIndex)
  return (
    <div className="card side-lessons" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="side-label">Модуль {ROMAN[here.moduleIndex] ?? here.moduleIndex + 1}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', marginTop: 4 }}>{here.moduleTitle}</div>
      </div>
      {list.map((m) => {
        const isHere = String(m.lesson.id) === String(lessonId)
        const locked = !isHere && (guestLimited ? m.number > 1 : m.state === 'locked')
        if (locked)
          return (
            <div key={String(m.lesson.id)} className="off">
              <span className="n">{m.number}</span>
              {m.lesson.title}
              <span style={{ marginLeft: 'auto' }}>
                <LockIcon />
              </span>
            </div>
          )
        return (
          <Link key={String(m.lesson.id)} href={`/lessons/${m.lesson.slug}`} className={isHere ? 'on' : ''} aria-current={isHere ? 'page' : undefined}>
            <span className="n">{m.number}</span>
            {m.lesson.title}
          </Link>
        )
      })}
    </div>
  )
}

/** Кнопки «предыдущий / следующий урок». */
export function LessonNav({ course, lessonId, source }: { course: CourseDoc; lessonId: string | number; source: ProgressSource }) {
  const { progress, guestLimited } = useProgress(source)
  const state = courseState(course, progress)
  const idx = state.lessons.findIndex((l) => String(l.lesson.id) === String(lessonId))
  if (idx < 0) return null
  const prev = idx > 0 ? state.lessons[idx - 1] : undefined
  const next = state.lessons[idx + 1]
  const nextOpen = next && !guestLimited && (progress.passed.has(String(lessonId)) || next.state !== 'locked')
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
      {prev ? (
        <Link href={`/lessons/${prev.lesson.slug}`} className="btn btn-outline">
          ← Урок {prev.number}. {prev.lesson.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        nextOpen ? (
          <Link href={`/lessons/${next.lesson.slug}`} className="btn btn-outline">
            Урок {next.number}. {next.lesson.title} →
          </Link>
        ) : (
          <span className="btn" style={{ background: '#eef2f7', color: 'var(--muted-2)', cursor: 'default' }}>
            Урок {next.number} откроется после теста →
          </span>
        )
      ) : null}
    </div>
  )
}
