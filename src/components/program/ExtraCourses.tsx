import Link from 'next/link'

import { ScrollToCurrent } from './ScrollToCurrent'
import { COURSE_LEVELS, labelOf } from '@/lib/constants'
import type { CourseDoc } from '@/lib/learning'
import { lessonCount, lessonsWord } from '@/lib/queries'

/*
 * Дополнительные курсы (задача 55): курсы-дополнения к основному курсу (сейчас — 12 курсов к основному курсу арабского).
 * У каждого своя страница; на страницах основного и дополнительных курсов — полоса вкладок.
 */

type Course = CourseDoc & Record<string, any>

const pad = (n: number) => String(n).padStart(2, '0')

/** «Начальный уровень»; у курса с подписью — «Средний → продвинутый уровень». */
export function extraLevelText(c: Course) {
  const base = (c.levelNote as string | undefined)?.trim() || labelOf(COURSE_LEVELS, c.level)
  return base ? `${base} уровень` : ''
}

/** Состояние курса: сколько уроков есть или сколько планируется. */
export function extraLessonsText(c: Course) {
  const n = lessonCount(c)
  if (n) return lessonsWord(n)
  return c.plannedLessons ? `Готовится · ${c.plannedLessons} уроков` : 'Готовится'
}

/** Карточки дополнительных курсов. */
export function ExtraCourseList({ courses }: { courses: Course[] }) {
  return (
    <ol className="disc-list">
      {courses.map((c, i) => {
        const n = lessonCount(c)
        return (
          <li key={c.id}>
            <Link href={`/courses/${c.slug}`} className="disc">
              <span className="disc-no">{pad(c.order ?? i + 1)}</span>
              <span className="disc-main">
                <span className="disc-top">
                  <span className="disc-label">{extraLevelText(c)}</span>
                </span>
                {c.bookTitleAr ? (
                  <span className="disc-books" lang="ar" dir="rtl">
                    {c.bookTitleAr}
                  </span>
                ) : null}
                <span className="disc-title">{c.title}</span>
                {c.description ? <span className="disc-author">{c.description}</span> : null}
              </span>
              <span className={`disc-state${n ? ' ready' : ''}`}>
                {n ? lessonsWord(n) : c.plannedLessons ? `${c.plannedLessons} ур.` : 'Готовится'}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

/** Полоса вкладок: основной курс и его дополнительные курсы, у каждого своя страница. */
export function CourseTabs({ main, extras, current }: { main: Course; extras: Course[]; current: string | null | undefined }) {
  const tabs = [{ ...main, tabLabel: 'Основной курс' }, ...extras.map((c) => ({ ...c, tabLabel: c.title as string }))]
  return (
    <nav className="course-tabs" aria-label="Курсы" id="course-tabs">
      <ScrollToCurrent />
      <ul>
        {tabs.map((t) => {
          const on = t.slug === current
          return (
            <li key={t.id}>
              <Link href={`/courses/${t.slug}`} className={`course-tab${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
                {t.tabLabel}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
