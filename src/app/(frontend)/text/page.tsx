import type { Metadata } from 'next'
import Link from 'next/link'

import { TextLessonCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { BookLessonsHead, BookShelf, OtherLessonsTitle } from '@/components/lessons/BookShelf'
import { FilterChips, PageHead } from '@/components/PageHead'
import { TEXT_CATEGORIES, labelOf } from '@/lib/constants'
import { getBooksByIds, lessonContext, shelfOf } from '@/lib/lessonBooks'
import { byStudyOrder } from '@/lib/media'
import { getCourses, getLessons } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Текстовые уроки' }

export default async function TextLessonsPage({ searchParams }: { searchParams: Promise<{ category?: string; book?: string }> }) {
  const { category, book } = await searchParams
  const valid = TEXT_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const [lessons, courses] = await Promise.all([getLessons({ kind: 'text', limit: 1000 }), getCourses()])
  const { courseOf, bookIdOf } = lessonContext(lessons, courses)
  const books = await getBooksByIds([...bookIdOf.values()])
  const bookOf = (l: (typeof lessons)[number]) => books.get(bookIdOf.get(String(l.id)) ?? '') ?? null
  const inCategory = valid ? lessons.filter((l) => l.category === valid) : lessons

  // Уроки одной книги — по порядку изучения
  const current = book ? [...books.values()].find((b) => b.slug === book) : undefined
  const bookLessons = current
    ? lessons
        .filter((l) => bookOf(l)?.id === current.id)
        .map((l) => ({ l, lessonNumber: courseOf.get(String(l.id))?.number, createdAt: l.createdAt }))
        .sort(byStudyOrder)
        .map((x) => x.l)
    : []
  const crumbCat = valid || book ? (valid ?? bookLessons[0]?.category ?? undefined) : undefined

  // Полка книг и уроки без книги
  const shelf = shelfOf(inCategory, bookOf)
  const others = inCategory.filter((l) => !bookOf(l))

  const grid = (list: typeof lessons) => (
    <div className="grid grid-320">
      {list.map((l) => (
        <TextLessonCard key={l.id} lesson={l} />
      ))}
    </div>
  )

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Текстовые уроки', href: valid || book ? '/text' : undefined },
          ...(crumbCat ? [{ label: labelOf(TEXT_CATEGORIES, crumbCat), href: book ? `/text?category=${crumbCat}` : undefined }] : []),
          ...(book ? [{ label: current?.title ?? 'Книга' }] : []),
        ]}
        eyebrow="Текстовые уроки"
        title={crumbCat ? labelOf(TEXT_CATEGORIES, crumbCat) : 'Уроки для чтения'}
        lead="Уроки в виде текста — удобно читать, перечитывать и возвращаться к ним."
      />
      <main className="container section">
        <FilterChips base="/text" param="category" options={TEXT_CATEGORIES} current={crumbCat} />
        {book ? (
          current && bookLessons.length ? (
            <div className="lbook-page">
              <BookLessonsHead book={current} count={bookLessons.length} word={['текстовый урок', 'текстовых урока', 'текстовых уроков']} />
              {grid(bookLessons)}
            </div>
          ) : (
            <p className="empty">
              По этой книге текстовых уроков пока нет. <Link href="/text">Все текстовые уроки →</Link>
            </p>
          )
        ) : !inCategory.length ? (
          <p className="empty">В этой рубрике текстовых уроков пока нет.</p>
        ) : shelf.length ? (
          <div className="lbook-page">
            <BookShelf books={shelf} base="/text" category={valid} />
            {others.length ? (
              <section className="lshelf">
                <OtherLessonsTitle />
                {grid(others)}
              </section>
            ) : null}
          </div>
        ) : (
          grid(inCategory)
        )}
      </main>
      <Footer />
    </>
  )
}
