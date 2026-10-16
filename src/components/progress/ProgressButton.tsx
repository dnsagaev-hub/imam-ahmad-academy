'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { STUDENT_LEVELS } from '@/lib/constants'
import { courseState, studentLevel, type CourseDoc } from '@/lib/learning'
import { downloadProgressFile, useLocalProgress } from '@/lib/localProgress'

/** Кольцо прогресса до следующего уровня. */
function Ring({ percent, label }: { percent: number; label: string }) {
  const r = 15
  const c = 2 * Math.PI * r
  return (
    <span className="pb-ring" aria-hidden="true">
      <svg width="38" height="38" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={r} fill="#fff" stroke="#D5E8DF" strokeWidth="4" />
        <circle
          cx="19"
          cy="19"
          r={r}
          fill="none"
          stroke="#00A07A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(c * Math.min(100, Math.max(0, percent))) / 100} ${c}`}
          transform="rotate(-90 19 19)"
        />
      </svg>
      <span className="pb-ring-label">{label}</span>
    </span>
  )
}

/**
 * Кнопка «Мой прогресс» в шапке (режим без регистрации).
 * Показывает уровень и путь до следующего; по наведению или нажатию — панель
 * с цифрами, кнопкой «Продолжить» и сохранением прогресса в файл.
 */
export function ProgressButton({ courses }: { courses: CourseDoc[] }) {
  const { progress, ready } = useLocalProgress()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Закрывать панель при переходе на другую страницу, по Esc и по клику мимо
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const level = studentLevel(courses, progress)
  const lv = STUDENT_LEVELS[level.index]
  const nextLv = STUDENT_LEVELS[level.index + 1]
  const passed = progress.passed.size
  const started = passed > 0 || progress.history.length > 0

  // «Продолжить»: курс последнего сданного теста, иначе первый начатый и незавершённый
  const states = courses.map((c) => ({ c, s: courseState(c, progress) })).filter((x) => x.s.total > 0)
  const lastLessonId = progress.history[0]?.lessonId
  const byLast = states.find((x) => !x.s.completed && x.s.lessons.some((l) => String(l.lesson.id) === lastLessonId))
  const cont = byLast ?? states.find((x) => x.s.doneCount > 0 && !x.s.completed)
  const lessonsWord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'урок' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'урока' : 'уроков')

  return (
    <div className={`pb${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="pb-btn"
        aria-expanded={open}
        aria-controls="progress-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <Ring percent={ready ? (nextLv ? level.toNextPercent : 100) : 0} label={String(level.index + 1)} />
        <span className="pb-text">
          <span className="pb-title">Мой прогресс</span>
          <span className="pb-sub">{ready ? (started ? `${lv.name} · ${passed} ${lessonsWord(passed)}` : 'Начните первый урок') : ' '}</span>
        </span>
      </button>

      <div className="pb-panel" id="progress-panel" role="dialog" aria-label="Мой прогресс">
        <div className="pb-head">
          <div>
            <div className="pb-level">{lv.name}</div>
            <div className="pb-level-sub">
              Уровень {level.index + 1} из {STUDENT_LEVELS.length} · {lv.desc}
            </div>
          </div>
          <span className="ar pb-level-ar" lang="ar">
            {lv.ar}
          </span>
        </div>

        <div className="pb-bar-wrap">
          <div className="pb-bar-label">
            <span>{nextLv ? `До уровня «${nextLv.name}»` : 'Высший уровень академии'}</span>
            <b>{nextLv ? `${level.toNextPercent}%` : '100%'}</b>
          </div>
          <div className="bar">
            <div style={{ width: `${nextLv ? level.toNextPercent : 100}%` }} />
          </div>
        </div>

        <div className="pb-stats">
          <div>
            <b>{passed}</b>
            <small>уроков пройдено</small>
          </div>
          <div>
            <b>{level.averageScore !== null ? `${level.averageScore}%` : '—'}</b>
            <small>средний балл</small>
          </div>
          <div>
            <b>{progress.history.length}</b>
            <small>попыток тестов</small>
          </div>
        </div>

        {cont?.s.currentLesson ? (
          <Link href={`/lessons/${cont.s.currentLesson.lesson.slug}`} className="pb-continue">
            <span className="pb-continue-label">Продолжить</span>
            <span className="pb-continue-course">{cont.c.title}</span>
            <span className="pb-continue-lesson">
              Урок {cont.s.currentLesson.number}. {cont.s.currentLesson.lesson.title} →
            </span>
          </Link>
        ) : !started ? (
          <div className="pb-empty">
            <p>Вы ещё не прошли ни одного урока. Выберите курс — первый урок уже открыт.</p>
            <Link href="/courses" className="btn btn-block">
              Выбрать курс
            </Link>
          </div>
        ) : null}

        <div className="pb-actions">
          <Link href="/progress" className="btn btn-outline">
            Открыть «Мой прогресс»
          </Link>
          {started ? (
            <button type="button" className="btn btn-outline" onClick={() => downloadProgressFile()}>
              Сохранить в файл
            </button>
          ) : null}
        </div>

        <p className="pb-note">Прогресс хранится в этом браузере — регистрация не нужна.</p>
      </div>
    </div>
  )
}
