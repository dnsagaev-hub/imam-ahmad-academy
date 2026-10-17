import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FileIcon } from '@/components/Icons'
import { Crumbs } from '@/components/PageHead'
import { CourseProgram, CourseProgressCard } from '@/components/progress/CourseProgram'
import { serverSource, type ProgressSource } from '@/components/progress/useProgress'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { BookTile } from '@/components/library/BookTile'
import { toBookItem } from '@/lib/books'
import { COURSE_LEVELS, COURSE_STATUSES, DISCIPLINES, labelOf } from '@/lib/constants'
import { flattenCourse, getProgress, toLeanCourse } from '@/lib/learning'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import { getCourseBySlug, lessonsWord, mediaUrl } from '@/lib/queries'

export const dynamic = 'force-dynamic'

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

  let source: ProgressSource = { mode: 'local' }
  if (REGISTRATION_ENABLED) {
    const payload = await getPayloadClient()
    const user = await getCurrentUser()
    source = serverSource(Boolean(user), await getProgress(payload, user?.id))
  }
  const lean = toLeanCourse(course)
  const total = flattenCourse(course).length
  const moduleCount = (course.modules ?? []).length
  const stage = COURSE_LEVELS.find((l) => l.value === c.level)
  const books = (Array.isArray(c.books) ? c.books : []).filter((b: any) => b && typeof b === 'object')
  const status = c.status && c.status !== 'approved' ? labelOf(COURSE_STATUSES, c.status) : null

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Курсы', href: '/courses' },
              { label: stage ? `${stage.roman}. ${stage.stage[0].toUpperCase()}${stage.stage.slice(1)} ступень` : 'Ступень', href: `/courses?level=${c.level}` },
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
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="badge" style={{ background: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Ступень {stage?.roman} · {stage?.name}
                </span>
                {c.discipline ? <span className="badge">{labelOf(DISCIPLINES, c.discipline)}</span> : null}
                {status ? <span className={`disc-status disc-status-${c.status}`}>◆ {status.toLowerCase()}</span> : null}
              </span>
              <h1 className="page-title">{c.title}</h1>
              {c.scope ? (
                <p className="lead" style={{ maxWidth: 620 }}>
                  <b style={{ color: 'var(--navy)' }}>Объём изучения:</b> {c.scope}
                </p>
              ) : (
                <p className="lead" style={{ maxWidth: 620 }}>
                  {c.description}
                </p>
              )}
              <div className="facts">
                <span>
                  <strong>{total ? lessonsWord(total) : 'Уроки готовятся'}</strong>
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
          {total ? (
            <CourseProgram course={lean} source={source} />
          ) : (
            <div className="empty" style={{ textAlign: 'left' }}>
              Уроки этого курса ещё готовятся. Пока можно познакомиться с учебником в библиотеке.
            </div>
          )}

          {books.length ? (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
              <h2 className="h2" style={{ margin: 0, fontSize: 30 }}>
                {books.length > 1 ? 'Учебники курса' : 'Учебник курса'}
              </h2>
              <div className="lib-grid">
                {books.map((b: any) => (
                  <BookTile key={b.id} b={toBookItem(b)} />
                ))}
              </div>
            </section>
          ) : null}
        </main>

        <aside className="col-side">
          <CourseProgressCard course={lean} source={source} />

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
