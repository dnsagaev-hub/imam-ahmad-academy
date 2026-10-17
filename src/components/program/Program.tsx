import Link from 'next/link'

import { COURSE_LEVELS, COURSE_STATUSES, DISCIPLINES, labelOf } from '@/lib/constants'
import type { CourseDoc } from '@/lib/learning'
import { lessonCount, lessonsWord } from '@/lib/queries'

type Course = CourseDoc & Record<string, any>

export const stageOf = (value?: string | null) => COURSE_LEVELS.find((l) => l.value === value)

export function groupByStage(courses: CourseDoc[]) {
  return COURSE_LEVELS.map((stage) => ({
    stage,
    courses: (courses as Course[])
      .filter((c) => c.level === stage.value)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  }))
}

/** Четыре карточки ступеней: на главной и вверху страницы «Курсы». */
export function StageCards({ courses, current }: { courses: CourseDoc[]; current?: string }) {
  return (
    <ol className="stages">
      {groupByStage(courses).map(({ stage, courses: list }) => {
        const ready = list.filter((c) => lessonCount(c) > 0).length
        return (
          <li key={stage.value}>
            <Link
              href={`/courses?level=${stage.value}`}
              className={`stage-card${current === stage.value ? ' on' : ''}`}
              aria-current={current === stage.value ? 'page' : undefined}
            >
              <span className="stage-top">
                <span className="stage-roman">{stage.roman}</span>
                <span className="stage-ar" lang="ar" dir="rtl">
                  {stage.ar}
                </span>
              </span>
              <b className="stage-name">{stage.label}</b>
              <span className="stage-sub">{stage.name}</span>
              <span className="stage-task">{stage.task}</span>
              <span className="stage-foot">
                <span>{list.length} дисциплин</span>
                <span>{ready ? `с уроками: ${ready}` : 'уроки готовятся'}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Ступень программы: заголовок и список дисциплин с учебниками и объёмом. */
export function StageSection({ stage, courses }: { stage: (typeof COURSE_LEVELS)[number]; courses: Course[] }) {
  return (
    <section className="stage" id={`stage-${stage.value}`} aria-labelledby={`h-${stage.value}`}>
      <header className="stage-head">
        <span className="stage-big">{stage.roman}</span>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>
            Ступень {stage.roman} · {courses.length} дисциплин
          </p>
          <h2 className="h2" id={`h-${stage.value}`} style={{ margin: '4px 0 6px' }}>
            {stage.name} — {stage.label.toLowerCase()} ступень
          </h2>
          <p className="muted" style={{ margin: 0, maxWidth: 760 }}>
            {stage.about}
          </p>
        </div>
        <span className="stage-head-ar" lang="ar" dir="rtl">
          {stage.stageAr}
        </span>
      </header>

      {courses.length ? (
        <ol className="disc-list">
          {courses.map((c) => {
            const n = lessonCount(c)
            const books = (Array.isArray(c.books) ? c.books : []).filter((b: any) => b && typeof b === 'object')
            const status = c.status && c.status !== 'approved' ? labelOf(COURSE_STATUSES, c.status) : null
            return (
              <li key={c.id}>
                <Link href={`/courses/${c.slug}`} className="disc">
                  <span className="disc-no">{pad(c.order ?? 0)}</span>
                  <span className="disc-main">
                    <span className="disc-top">
                      <span className="disc-label">{labelOf(DISCIPLINES, c.discipline) || 'Курс'}</span>
                      {status ? <span className={`disc-status disc-status-${c.status}`}>◆ {status.toLowerCase()}</span> : null}
                    </span>
                    {books.length ? (
                      <span className="disc-books" lang="ar" dir="rtl">
                        {books.map((b: any) => b.titleAr || b.title).join(' · ')}
                      </span>
                    ) : null}
                    <span className="disc-title">{c.title}</span>
                    {books.length ? (
                      <span className="disc-author">
                        {[...new Set(books.map((b: any) => b.author).filter(Boolean))].join('; ')}
                      </span>
                    ) : null}
                    {c.scope ? <span className="disc-scope">Объём: {c.scope}</span> : null}
                  </span>
                  <span className={`disc-state${n ? ' ready' : ''}`}>{n ? lessonsWord(n) : 'Готовится'}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="empty">Дисциплины этой ступени появятся здесь, когда вы добавите курсы в админке.</p>
      )}
    </section>
  )
}
