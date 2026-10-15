import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FileIcon, LockIcon } from '@/components/Icons'
import { LessonMedia } from '@/components/LessonMedia'
import { MarkComplete } from '@/components/MarkComplete'
import { Crumbs } from '@/components/PageHead'
import { Quiz } from '@/components/Quiz'
import { LESSON_CATEGORIES, labelOf } from '@/lib/constants'
import { canOpenLesson, courseState, findCourseForLesson, getProgress } from '@/lib/learning'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import { getLessonBySlug, mediaUrl } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = await getLessonBySlug(slug)
  return { title: lesson?.title ?? 'Урок' }
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lesson = await getLessonBySlug(slug)
  if (!lesson) notFound()
  const l = lesson as typeof lesson & Record<string, any>

  const payload = await getPayloadClient()
  const user = await getCurrentUser()
  const progress = await getProgress(payload, user?.id)
  const course = await findCourseForLesson(payload, lesson.id)
  const state = course ? courseState(course, progress) : null
  const here = state?.lessons.find((x) => String(x.lesson.id) === String(lesson.id))
  const idx = here ? state!.lessons.indexOf(here) : -1
  const prev = idx > 0 ? state!.lessons[idx - 1] : undefined
  const next = state && idx >= 0 ? state.lessons[idx + 1] : undefined

  // Доступ: в курсе уроки открываются по порядку; гостю — только первый урок курса
  const open = !course || (user ? canOpenLesson(course, lesson.id, progress) : idx <= 0)

  const crumbs = course
    ? [
        { label: 'Курсы', href: '/courses' },
        { label: course.title, href: `/courses/${course.slug}` },
        ...(here ? [{ label: `Модуль ${here.moduleIndex + 1}` }, { label: `Урок ${here.number}` }] : []),
      ]
    : [
        { label: 'Главная', href: '/' },
        { label: labelOf(LESSON_CATEGORIES, l.category) },
        { label: l.title },
      ]

  if (!open) {
    return (
      <>
        <Header />
        <div className="subbar">
          <div className="container">
            <Crumbs items={crumbs} />
          </div>
        </div>
        <main className="container section" style={{ maxWidth: 720, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <span className="st st-locked" style={{ width: 64, height: 64 }}>
            <LockIcon size={26} />
          </span>
          <h1 className="page-title" style={{ fontSize: 40 }}>
            {here ? `Урок ${here.number}. ` : ''}
            {l.title}
          </h1>
          <p className="lead">
            {user
              ? 'Этот урок откроется после того, как вы сдадите тест предыдущего урока.'
              : 'Чтобы продолжить курс, войдите или зарегистрируйтесь — уроки открываются по порядку.'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {user ? (
              state?.currentLesson ? (
                <Link className="btn" href={`/lessons/${state.currentLesson.lesson.slug}`}>
                  Перейти к уроку {state.currentLesson.number}
                </Link>
              ) : null
            ) : (
              <>
                <Link className="btn" href="/register">
                  Регистрация
                </Link>
                <Link className="btn btn-outline" href="/login">
                  Войти
                </Link>
              </>
            )}
            {course ? (
              <Link className="btn btn-outline" href={`/courses/${course.slug}`}>
                Программа курса
              </Link>
            ) : null}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const questions = (l.questions ?? []).map((q: any) => ({
    question: String(q.question ?? ''),
    options: (q.options ?? []).map((o: any) => String(o.text ?? '')),
  }))
  const moduleLessons = here ? state!.lessons.filter((x) => x.moduleIndex === here.moduleIndex) : []
  const passed = progress.passed.has(String(lesson.id))
  const nextOpen = next && (passed || next.state !== 'locked')

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs items={crumbs} />
        </div>
      </div>

      <div className="container two-col" style={{ paddingTop: 36 }}>
        {here ? (
          <aside className="col-side-left">
            <div className="card side-lessons" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line-soft)' }}>
                <div className="side-label">Модуль {ROMAN[here.moduleIndex] ?? here.moduleIndex + 1}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', marginTop: 4 }}>{here.moduleTitle}</div>
              </div>
              {moduleLessons.map((m) => {
                const isHere = String(m.lesson.id) === String(lesson.id)
                const locked = user ? m.state === 'locked' : m.number > 1
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
            {course ? (
              <Link href={`/courses/${course.slug}`} className="btn btn-outline">
                ← Вся программа курса
              </Link>
            ) : null}
          </aside>
        ) : null}

        <main className="col-main" style={{ gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="tag" style={{ letterSpacing: '0.14em' }}>
              {here ? `Урок ${here.number} из ${state!.total}` : labelOf(LESSON_CATEGORIES, l.category)}
            </span>
            <h1 className="page-title">{l.title}</h1>
            {l.duration ? <p className="muted" style={{ margin: 0 }}>Длительность: {l.duration}</p> : null}
          </div>

          <LessonMedia videoUrl={l.videoUrl} audioUrl={mediaUrl(l.audio)} title={l.title} />

          {l.definitionAr || l.summary || (l.files ?? []).length ? (
            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 className="h2" style={{ margin: 0, fontSize: 34 }}>
                Конспект урока
              </h2>
              {l.definitionAr ? (
                <div className="matn">
                  <p className="ar" lang="ar" dir="rtl">
                    {l.definitionAr}
                  </p>
                  {l.definitionRu ? <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)', fontStyle: 'italic' }}>{l.definitionRu}</p> : null}
                </div>
              ) : null}
              {l.summary ? (
                <div className="prose">
                  <RichText data={l.summary} />
                </div>
              ) : null}
              {(l.files ?? []).length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {(l.files as any[]).map((f, i) => (
                    <a key={i} className="file-link" href={mediaUrl(f.file) ?? '#'} target="_blank" rel="noopener">
                      <FileIcon size={18} />
                      {f.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {questions.length ? (
            <Quiz
              lessonId={lesson.id}
              lessonNumber={here?.number}
              questions={questions}
              passingScore={l.passingScore ?? 70}
              loggedIn={Boolean(user)}
              nextHref={next ? `/lessons/${next.lesson.slug}` : undefined}
              nextLabel={next ? `Урок ${next.number}` : undefined}
              previousAttempts={progress.attempts.get(String(lesson.id)) ?? 0}
            />
          ) : course ? (
            <MarkComplete lessonId={lesson.id} done={passed} loggedIn={Boolean(user)} nextHref={next ? `/lessons/${next.lesson.slug}` : undefined} />
          ) : null}

          {here ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
              {prev ? (
                <Link href={`/lessons/${prev.lesson.slug}`} className="btn btn-outline">
                  ← Урок {prev.number}. {prev.lesson.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                nextOpen && user ? (
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
          ) : null}
        </main>
      </div>
      <Footer />
    </>
  )
}
