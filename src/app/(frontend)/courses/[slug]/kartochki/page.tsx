import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Flashcards } from '@/components/arabic/Flashcards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { verbForms } from '@/lib/arabic'
import { buildArabicCourse } from '@/lib/arabicCourse'
import { getCourseBySlug } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  return { title: course ? `Карточки — ${course.title}` : 'Карточки' }
}

export default async function FlashcardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const ac = buildArabicCourse(course)
  if (!ac.lessons.length) notFound()

  const lessons = [...new Set(ac.words.map((w) => w.lesson))]
  const first = lessons[0] ?? 1
  const last = lessons[lessons.length - 1] ?? 1
  const pick = (v: string | undefined, d: number) => {
    const n = Number(v)
    return lessons.includes(n) ? n : d
  }
  const words = ac.words.map((w) => ({
    key: w.key,
    word: w.word,
    translation: w.translation,
    root: w.root,
    plural: w.plural,
    verb: verbForms(w),
    image: w.image,
    lesson: w.lesson,
  }))

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Курсы', href: '/courses' },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: 'Карточки' },
        ]}
        eyebrow="Повторение слов"
        title="Карточки"
        lead="Выберите уроки и повторяйте слова. Отвечайте честно: «Помню» — слово вернётся через несколько дней, «Не помню» — ещё раз сегодня. Что пора повторить, запоминается на этом устройстве."
      />
      <main className="container section">
        {words.length ? (
          <Flashcards words={words} lessons={lessons} from={pick(sp.from, first)} to={pick(sp.to, last)} />
        ) : (
          <div className="empty">Карточки появятся, когда в уроках будет заполнен словарь.</div>
        )}
      </main>
      <Footer />
    </>
  )
}
