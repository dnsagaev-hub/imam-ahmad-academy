import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArabicLessonBody } from '@/components/arabic/ArabicLesson'
import { ArabicTasks } from '@/components/arabic/ArabicTasks'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FileIcon, LockIcon } from '@/components/Icons'
import { LessonMedia } from '@/components/LessonMedia'
import { LessonText } from '@/components/text/LessonText'
import { MarkComplete } from '@/components/MarkComplete'
import { Crumbs } from '@/components/PageHead'
import { LessonGate, LessonNav, ModuleSide } from '@/components/progress/LessonParts'
import { serverSource, type ProgressSource } from '@/components/progress/useProgress'
import { Quiz } from '@/components/Quiz'
import { stageFor, toLexEntry } from '@/lib/arabic'
import { arabicOf, buildArabicCourse, clientTasks, isArabicLesson, lexiconUpTo } from '@/lib/arabicCourse'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { LESSON_CATEGORIES, labelOf } from '@/lib/constants'
import { canOpenLesson, emptyProgress, findCourseForLesson, flattenCourse, getProgress, toLeanCourse } from '@/lib/learning'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import { getLessonBySlug, mediaUrl } from '@/lib/queries'

export const dynamic = 'force-dynamic'

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
  const user = REGISTRATION_ENABLED ? await getCurrentUser() : null
  const progress = REGISTRATION_ENABLED ? await getProgress(payload, user?.id) : emptyProgress()
  const source: ProgressSource = REGISTRATION_ENABLED ? serverSource(Boolean(user), progress) : { mode: 'local' }

  const course = await findCourseForLesson(payload, lesson.id)
  const flat = course ? flattenCourse(course) : []
  const idx = flat.findIndex((x) => String(x.lesson.id) === String(lesson.id))
  const here = idx >= 0 ? flat[idx] : undefined
  const next = idx >= 0 ? flat[idx + 1] : undefined
  const lean = course ? toLeanCourse(course) : null

  const crumbs = course
    ? [
        { label: 'Курсы', href: '/courses' },
        { label: course.title, href: `/courses/${course.slug}` },
        ...(here ? [{ label: `Модуль ${here.moduleIndex + 1}` }, { label: `Урок ${here.number}` }] : []),
      ]
    : [{ label: 'Главная', href: '/' }, { label: labelOf(LESSON_CATEGORIES, l.category) }, { label: l.title }]

  // С регистрацией доступ проверяет сервер: гостю открыт только первый урок курса
  const serverOpen = !REGISTRATION_ENABLED || !course || (user ? canOpenLesson(course, lesson.id, progress) : idx <= 0)

  if (!serverOpen) {
    return (
      <>
        <Header />
        <div className="subbar">
          <div className="container">
            <Crumbs items={crumbs} />
          </div>
        </div>
        <main
          className="container section"
          style={{
            maxWidth: 720,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
          }}
        >
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
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {!user ? (
              <>
                <Link className="btn" href="/register">
                  Регистрация
                </Link>
                <Link className="btn btn-outline" href="/login">
                  Войти
                </Link>
              </>
            ) : null}
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

  // В браузер уходят только тексты вопросов и вариантов — без верных ответов
  const questions = (l.questions ?? []).map((q: any) => ({
    question: String(q.question ?? ''),
    options: (q.options ?? []).map((o: any) => String(o.text ?? '')),
  }))
  const mode = REGISTRATION_ENABLED ? 'server' : 'local'

  // Урок арабского языка: подсказки к словам, этапы огласовки, задания
  const isArabic = isArabicLesson(l)
  const ar = arabicOf(l)
  const arNumber = here?.number ?? 1
  const arStage = stageFor(ar.stage, arNumber)
  const arWords = (ar.words ?? []).filter((w) => w.word && w.translation)
  const lexicon = isArabic ? (course ? lexiconUpTo(buildArabicCourse(course), arNumber) : arWords.map((w) => toLexEntry(w, arNumber))) : []
  const tasks = isArabic ? clientTasks(lesson.id, ar) : []
  const cardsHref = course && isArabic ? `/courses/${course.slug}/kartochki?from=${arNumber}&to=${arNumber}` : undefined

  const testBlock = questions.length ? (
    <Quiz
      lessonId={lesson.id}
      lessonNumber={here?.number}
      questions={questions}
      passingScore={l.passingScore ?? 70}
      loggedIn={Boolean(user)}
      nextHref={next ? `/lessons/${next.lesson.slug}` : undefined}
      nextLabel={next ? `Урок ${next.number}` : undefined}
      previousAttempts={progress.attempts.get(String(lesson.id)) ?? 0}
      mode={mode}
      lessonTitle={l.title}
      courseTitle={course?.title}
    />
  ) : course && !tasks.length ? (
    <MarkComplete
      lessonId={lesson.id}
      done={progress.passed.has(String(lesson.id))}
      loggedIn={Boolean(user)}
      nextHref={next ? `/lessons/${next.lesson.slug}` : undefined}
      mode={mode}
      lessonTitle={l.title}
      courseTitle={course.title}
    />
  ) : null

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs items={crumbs} />
        </div>
      </div>

      <LessonGate course={lean} lessonId={lesson.id} source={source}>
        <div className="container two-col" style={{ paddingTop: 36 }}>
          {here && lean ? (
            <aside className="col-side-left">
              <ModuleSide course={lean} lessonId={lesson.id} source={source} />
              {cardsHref ? (
                <Link href={cardsHref} className="btn btn-outline">
                  Карточки слов урока
                </Link>
              ) : null}
              <Link href={`/courses/${course!.slug}`} className="btn btn-outline">
                ← Вся программа курса
              </Link>
            </aside>
          ) : null}

          <main className="col-main" style={{ gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="tag" style={{ letterSpacing: '0.14em' }}>
                {here ? `Урок ${here.number} из ${flat.length}` : labelOf(LESSON_CATEGORIES, l.category)}
              </span>
              <h1 className="page-title">{l.title}</h1>
              {l.duration ? (
                <p className="muted" style={{ margin: 0 }}>
                  Длительность: {l.duration}
                </p>
              ) : null}
            </div>

            <LessonMedia
              videoUrl={l.videoUrl}
              audioUrl={mediaUrl(l.audio)}
              title={l.title}
              lessonId={lesson.id}
              slug={String(l.slug ?? '')}
              courseTitle={course?.title}
              categoryLabel={labelOf(LESSON_CATEGORIES, l.category)}
              teacher={l.teacher}
            />

            {Array.isArray(l.content) && l.content.length ? <LessonText blocks={l.content} sourceRef={l.sourceRef} readingMinutes={l.readingMinutes} /> : null}

            {l.body ? (
              <article className="card prose lesson-text" style={{ padding: 36 }}>
                <RichText data={l.body} />
              </article>
            ) : null}

            {l.definitionAr || l.summary || (l.files ?? []).length ? (
              <section
                className="card"
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                <h2 className="h2" style={{ margin: 0, fontSize: 34 }}>
                  Конспект урока
                </h2>
                {l.definitionAr ? (
                  <div className="matn">
                    <p className="ar" lang="ar" dir="rtl">
                      {l.definitionAr}
                    </p>
                    {l.definitionRu ? (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          color: 'var(--muted)',
                          fontStyle: 'italic',
                        }}
                      >
                        {l.definitionRu}
                      </p>
                    ) : null}
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

            {isArabic ? (
              <ArabicLessonBody a={ar} stage={arStage} lexicon={lexicon} lead={l.excerpt}>
                {tasks.length ? (
                  <ArabicTasks
                    lessonId={lesson.id}
                    tasks={tasks}
                    counts={!questions.length}
                    passingScore={l.passingScore ?? 70}
                    mode={mode}
                    loggedIn={Boolean(user)}
                    lessonTitle={l.title}
                    courseTitle={course?.title}
                    nextHref={next ? `/lessons/${next.lesson.slug}` : undefined}
                    nextLabel={next ? `Урок ${next.number}` : undefined}
                  />
                ) : null}
                {testBlock}
              </ArabicLessonBody>
            ) : (
              <>{testBlock}</>
            )}

            {here && lean ? <LessonNav course={lean} lessonId={lesson.id} source={source} /> : null}
          </main>
        </div>
      </LessonGate>
      <Footer />
    </>
  )
}
