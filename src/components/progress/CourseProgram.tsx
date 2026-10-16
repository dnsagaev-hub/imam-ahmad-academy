'use client'

import Link from 'next/link'

import { CheckIcon, ChevronIcon, LockIcon, PlayIcon } from '@/components/Icons'
import { courseState, type CourseDoc } from '@/lib/learning'

import { useProgress, type ProgressSource } from './useProgress'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/** Программа курса: модули и уроки с отметками «пройден / текущий / закрыт». */
export function CourseProgram({ course, source }: { course: CourseDoc; source: ProgressSource }) {
  const { progress, ready, guestLimited } = useProgress(source)
  const state = courseState(course, progress)
  const showCounts = ready && !guestLimited

  return (
    <>
      {(course.modules ?? []).map((m, mi) => {
        const lessons = state.lessons.filter((l) => l.moduleIndex === mi)
        const done = lessons.filter((l) => l.state === 'done').length
        const hasCurrent = lessons.some((l) => (guestLimited ? l.number === 1 : l.state === 'current'))
        return (
          <details key={m.id ?? mi} className="card module" open={hasCurrent || undefined}>
            <summary>
              <span className="num">{ROMAN[mi] ?? mi + 1}</span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
                  Модуль {mi + 1}. {m.title}
                </span>
                {lessons.length ? (
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Уроки {lessons[0].number}–{lessons[lessons.length - 1].number}
                  </span>
                ) : null}
              </span>
              {showCounts ? (
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--royal)', whiteSpace: 'nowrap' }}>
                  {done} из {lessons.length}
                </span>
              ) : null}
              <span className="chev">
                <ChevronIcon size={20} color="#1F4E8C" />
              </span>
            </summary>
            <ol className="lesson-list">
              {lessons.map((l) => {
                const locked = guestLimited ? l.number > 1 : l.state === 'locked'
                const isDone = !guestLimited && l.state === 'done'
                const isCurrent = guestLimited ? l.number === 1 : l.state === 'current'
                const hasTest = Boolean((l.lesson as any).hasTest ?? l.lesson.questions?.length)
                return (
                  <li key={String(l.lesson.id)} className={`lesson-row${locked ? ' locked' : ''}`}>
                    {isDone ? (
                      <span className="st st-done">
                        <CheckIcon />
                      </span>
                    ) : isCurrent ? (
                      <span className="st st-current">
                        <PlayIcon size={12} color="#9A7A35" />
                      </span>
                    ) : (
                      <span className="st st-locked">
                        <LockIcon />
                      </span>
                    )}
                    <span className="t">
                      {locked ? (
                        <span className="name">
                          Урок {l.number}. {l.lesson.title}
                        </span>
                      ) : (
                        <Link href={`/lessons/${l.lesson.slug}`}>
                          Урок {l.number}. {l.lesson.title}
                        </Link>
                      )}
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {[l.lesson.duration, hasTest ? 'тест' : null].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {isDone && typeof l.score === 'number' ? <span className="score-pill">Тест: {l.score}%</span> : null}
                    {isCurrent ? (
                      <Link href={`/lessons/${l.lesson.slug}`} className="btn" style={{ minHeight: 40, padding: '0 16px', fontSize: 14 }}>
                        {l.number === 1 && !isDone && done === 0 ? 'Начать' : 'Продолжить'}
                      </Link>
                    ) : null}
                    {locked ? (
                      <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>
                        {guestLimited ? 'Нужен вход' : 'Откроется после теста'}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </details>
        )
      })}
      {!state.total ? <p className="empty">Уроки курса скоро появятся.</p> : null}
    </>
  )
}

/** Карточка «Ваш прогресс» на странице курса. */
export function CourseProgressCard({ course, source, registerHref }: { course: CourseDoc; source: ProgressSource; registerHref?: string }) {
  const { progress, ready, guestLimited } = useProgress(source)
  const state = courseState(course, progress)
  const first = state.lessons[0]

  if (guestLimited) {
    return (
      <div className="dark-card">
        <span className="side-label" style={{ color: 'var(--gold)' }}>
          Начните обучение
        </span>
        <p style={{ margin: 0, color: '#b9cee6' }}>
          Зарегистрируйтесь, чтобы проходить уроки по порядку, сдавать тесты и видеть прогресс.
        </p>
        <Link href={registerHref ?? '/register'} className="btn btn-white btn-block">
          Регистрация
        </Link>
        {first ? (
          <Link href={`/lessons/${first.lesson.slug}`} style={{ color: '#dce8f6', textAlign: 'center' }}>
            Посмотреть первый урок
          </Link>
        ) : null}
      </div>
    )
  }

  const current = state.currentLesson
  return (
    <div className="dark-card">
      <span className="side-label" style={{ color: 'var(--gold)' }}>
        Ваш прогресс
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="big-num">{ready ? `${state.percent}%` : '—'}</span>
        <span style={{ color: '#b9cee6' }}>
          {state.doneCount} из {state.total}
        </span>
      </div>
      <div className="bar">
        <div style={{ width: `${state.percent}%` }} />
      </div>
      <div className="mini-stats">
        <div>
          <small>Средний балл</small>
          <b>{state.averageScore !== null ? `${state.averageScore}%` : '—'}</b>
        </div>
        <div>
          <small>Тестов сдано</small>
          <b>{state.doneCount}</b>
        </div>
      </div>
      {current ? (
        <Link href={`/lessons/${current.lesson.slug}`} className="btn btn-white btn-block">
          {state.doneCount ? `Продолжить: урок ${current.number}` : 'Начать курс'}
        </Link>
      ) : state.completed ? (
        <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>Курс пройден, ма ша Аллах!</span>
      ) : null}
      {source.mode === 'local' ? (
        <span style={{ fontSize: 13, color: '#a9c6e8' }}>
          Прогресс хранится на этом устройстве. <Link href="/progress" style={{ color: '#dce8f6' }}>Подробнее</Link>
        </span>
      ) : null}
    </div>
  )
}
