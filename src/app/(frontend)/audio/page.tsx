import type { Metadata } from 'next'
import Link from 'next/link'

import { AudioBrowser } from '@/components/audio/AudioBrowser'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { BookLessonsHead, BookShelf, OtherLessonsTitle } from '@/components/lessons/BookShelf'
import { FilterChips, PageHead } from '@/components/PageHead'
import { LESSON_CATEGORIES, MEDIA_CATEGORIES, labelOf } from '@/lib/constants'
import { shelfOf } from '@/lib/lessonBooks'
import { byStudyOrder, formatTotal, getMediaItems } from '@/lib/media'
import { plural } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Аудиоуроки' }

export default async function AudioPage({ searchParams }: { searchParams: Promise<{ category?: string; book?: string }> }) {
  const { category, book } = await searchParams
  const valid = LESSON_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const { items, counts, books } = await getMediaItems('audio')
  const inCategory = valid ? items.filter((i) => i.category === valid) : items

  // Уроки одной книги
  const current = book ? [...books.values()].find((b) => b.slug === book) : undefined
  const bookItems = current ? items.filter((i) => i.bookId === current.id).sort(byStudyOrder) : []
  const crumbCat = valid || book ? (valid ?? bookItems[0]?.category) : undefined

  // Полка книг и уроки без книги
  const shelf = shelfOf(inCategory, (i) => (i.bookId ? (books.get(i.bookId) ?? null) : null))
  const others = inCategory.filter((i) => !i.bookId)

  const list = book ? bookItems : inCategory
  const total = list.reduce((a, i) => a + i.seconds, 0)
  const rubrics = Object.keys(counts).length

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Аудиоуроки', href: valid || book ? '/audio' : undefined },
          ...(crumbCat ? [{ label: labelOf(LESSON_CATEGORIES, crumbCat), href: book ? `/audio?category=${crumbCat}` : undefined }] : []),
          ...(book ? [{ label: current?.title ?? 'Книга' }] : []),
        ]}
        eyebrow="Аудиоуроки"
        title={crumbCat ? labelOf(LESSON_CATEGORIES, crumbCat) : 'Слушайте в дороге'}
        lead="Плеер продолжает играть, пока вы переходите по сайту, и запоминает, где вы остановились."
      >
        <div className="media-stats">
          <span>
            <b>{list.length}</b> {plural(list.length, ['урок', 'урока', 'уроков'])}
          </span>
          {total ? (
            <span>
              <b>{formatTotal(total)}</b> записи
            </span>
          ) : null}
          {!valid && !book && rubrics ? (
            <span>
              <b>{rubrics}</b> {plural(rubrics, ['рубрика', 'рубрики', 'рубрик'])}
            </span>
          ) : null}
        </div>
      </PageHead>
      <main className="container section">
        <FilterChips base="/audio" param="category" options={MEDIA_CATEGORIES} current={crumbCat} counts={counts} />
        {book ? (
          current && bookItems.length ? (
            <div className="lbook-page">
              <BookLessonsHead book={current} count={bookItems.length} word={['аудиоурок', 'аудиоурока', 'аудиоуроков']} />
              <AudioBrowser items={bookItems} ordered />
            </div>
          ) : (
            <p className="empty">
              По этой книге аудиоуроков пока нет. <Link href="/audio">Все аудиоуроки →</Link>
            </p>
          )
        ) : shelf.length ? (
          <div className="lbook-page">
            <BookShelf books={shelf} base="/audio" category={valid} />
            {others.length ? (
              <section className="lshelf">
                <OtherLessonsTitle />
                <AudioBrowser items={others} />
              </section>
            ) : null}
          </div>
        ) : (
          <AudioBrowser items={inCategory} />
        )}
      </main>
      <Footer />
    </>
  )
}
