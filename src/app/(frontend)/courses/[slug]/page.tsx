import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { CheckIcon, ChevronIcon, FileIcon, LockIcon, PlayIcon } from '@/components/Icons'
import { Crumbs } from '@/components/PageHead'
import { COURSE_LEVELS, labelOf } from '@/lib/constants'
import { courseState, getProgress } from '@/lib/learning'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import { getCourseBySlug, lessonsWord, mediaUrl } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  return { title: course?.title ?? 'Курс', description: (course as any)?.description }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const c = course as typeof course & Record<string, any>

  const payload = await getPayloadClient()
  const user = await getCurrentUser()
  const progress = await getProgress(payload, user?.id)
  const state = courseState(course, progress)
  const moduleCount = (course.modules ?? []).length
  const current = state.currentLesson
  const firstLesson = state.lessons[0]

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Курсы', href: '/courses' },
              { label: labelOf(COURSE_LEVELS, c.level), href: `/courses?level=${c.level}` },
              { label: c.title },
            ]}
          />
          <div className="page-head course-hero" style={{ paddingTop: 12 }}>
            <div className="book-big">
              <div>
                <span className="t" lang="ar">
                  {c.bookTitleAr || 'العلم'}
                </span>
                <span style={{ width: 40, height: 1, background: 'var(--gold)' }} />
                {c.bookAuthor ? <span className="a">{c.bookAuthor}</span> : null}
              </div>
            </div>
            <div style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="badge" style={{ background: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {labelOf(COURSE_LEVELS, c.level)} уровень
              </span>
              <h1 className="page-title">{c.title}</h1>
              <p className="lead" style={{ maxWidth: 620 }}>
                {c.description}
              </p>
              <div className="facts">
                <span>
                  <strong>{lessonsWord(state.total)}</strong>
                </span>
                {moduleCount ? (
                  <span>
                    модулей: <strong>{moduleCount}</strong>
                  </span>
                ) : null}
                {c.duration ? <span>{c.duration}</span> : null}
                {c.teacher ? (
                  <span>
                    Преподаватель: <strong>{c.teacher}</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container two-col">
        <main className="col-main">
          <h2 className="h2" style={{ margin: '0 0 4px', fontSize: 36 }}>
            Программа курса
          </h2>
          {(course.modules ?? []).map((m, mi) => {
            const lessons = state.lessons.filter((l) => l.moduleIndex === mi)
            const done = lessons.filter((l) => l.state === 'done').length
            const hasCurrent = lessons.some((l) => l.state === 'current')
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
                  {user ? (
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
                    // Гостю открыт только первый урок курса
                    const locked = user ? l.state === 'locked' : l.number > 1
                    const isDone = Boolean(user) && l.state === 'done'
                    const isCurrent = user ? l.state === 'current' : l.number === 1
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
                            {[l.lesson.duration, l.lesson.questions?.length ? 'тест' : null].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        {isDone && typeof l.score === 'number' ? <span className="score-pill">Тест: {l.score}%</span> : null}
                        {isCurrent ? (
                          <Link href={`/lessons/${l.lesson.slug}`} className="btn" style={{ minHeight: 40, padding: '0 16px', fontSize: 14 }}>
                            {user ? 'Продолжить' : 'Начать'}
                          </Link>
                        ) : null}
                        {locked ? (
                          <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>
                            {user ? 'Откроется после теста' : 'Нужен вход'}
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
        </main>

        <aside className="col-side">
          {user ? (
            <div className="dark-card">
              <span className="side-label" style={{ color: 'var(--gold)' }}>
                Ваш прогресс
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span className="big-num">{state.percent}%</span>
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
                  Продолжить: урок {current.number}
                </Link>
              ) : state.completed ? (
                <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>Курс пройден, ма ша Аллах!</span>
              ) : null}
            </div>
          ) : (
            <div className="dark-card">
              <span className="side-label" style={{ color: 'var(--gold)' }}>
                Начните обучение
              </span>
              <p style={{ margin: 0, color: '#b9cee6' }}>
                Зарегистрируйтесь, чтобы проходить уроки по порядку, сдавать тесты и видеть прогресс.
              </p>
              <Link href="/register" className="btn btn-white btn-block">
                Регистрация
              </Link>
              {firstLesson ? (
                <Link href={`/lessons/${firstLesson.lesson.slug}`} style={{ color: '#dce8f6', textAlign: 'center' }}>
                  Посмотреть первый урок
                </Link>
              ) : null}
            </div>
          )}

          {c.teacher ? (
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="side-label">Преподаватель</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {mediaUrl(c.teacherPhoto) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(c.teacherPhoto)!} alt="" width={56} height={56} style={{ borderRadius: 99, objectFit: 'cover', width: 56, height: 56 }} />
                ) : null}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--navy)' }}>{c.teacher}</div>
                  {c.teacherBio ? <div style={{ fontSize: 14, color: 'var(--muted)' }}>{c.teacherBio}</div> : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="side-label">Как проходит обучение</span>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15 }}>
              <li>После каждого урока — короткий тест</li>
              <li>Следующий урок открывается после сдачи теста</li>
              <li>Тест можно пересдавать, засчитывается лучший балл</li>
            </ul>
          </div>

          {(c.materials ?? []).length ? (
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="side-label">Материалы</span>
              {(c.materials as any[]).map((m, i) => (
                <a key={i} className="file-link" href={mediaUrl(m.file) ?? '#'} target="_blank" rel="noopener">
                  <FileIcon />
                  {m.label}
                </a>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
      <Footer />
    </>
  )
}
