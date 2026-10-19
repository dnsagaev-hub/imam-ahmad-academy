import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { BookLessonsHead, BookShelf, OtherLessonsTitle } from '@/components/lessons/BookShelf'
import { FilterChips, PageHead } from '@/components/PageHead'
import { VideoBrowser, VideoCover } from '@/components/video/VideoBrowser'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { LESSON_CATEGORIES, MEDIA_CATEGORIES, labelOf } from '@/lib/constants'
import { shelfOf } from '@/lib/lessonBooks'
import { byStudyOrder, formatTotal, getMediaItems } from '@/lib/media'
import { plural } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Видеоуроки' }

export default async function VideoPage({ searchParams }: { searchParams: Promise<{ category?: string; book?: string }> }) {
  const { category, book } = await searchParams
  const valid = LESSON_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const { items, counts, books } = await getMediaItems('video')
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
  // Главное видео — самое новое (только на общей странице раздела)
  const featured = !valid && !book ? list[0] : undefined

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Видеоуроки', href: valid || book ? '/video' : undefined },
          ...(crumbCat ? [{ label: labelOf(LESSON_CATEGORIES, crumbCat), href: book ? `/video?category=${crumbCat}` : undefined }] : []),
          ...(book ? [{ label: current?.title ?? 'Книга' }] : []),
        ]}
        eyebrow="Видеоуроки"
        title={crumbCat ? labelOf(LESSON_CATEGORIES, crumbCat) : 'Занятия с разбором текста'}
      >
        <div className="media-stats">
          <span>
            <b>{list.length}</b> видео
          </span>
          {total ? (
            <span>
              <b>{formatTotal(total)}</b> занятий
            </span>
          ) : null}
          <span>
            <b>{list.filter((i) => i.hasTest).length}</b> {plural(list.filter((i) => i.hasTest).length, ['урок', 'урока', 'уроков'])} с тестом
          </span>
        </div>
      </PageHead>

      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FilterChips base="/video" param="category" options={MEDIA_CATEGORIES} current={crumbCat} counts={counts} />

        {featured ? (
          <Link href={`/lessons/${featured.slug}`} className="card vfeatured">
            <VideoCover item={featured} big />
            <div className="vfeatured-body">
              <span className="eyebrow" style={{ margin: 0 }}>
                Новое видео
              </span>
              <h2 className="display">{featured.title}</h2>
              {featured.excerpt ? <p className="muted">{featured.excerpt}</p> : null}
              <div className="vtile-tags">
                <span className="tag">{featured.categoryLabel}</span>
                {featured.hasTest ? <span className="tag-test">тест после урока</span> : null}
              </div>
              <span className="muted" style={{ fontSize: 14 }}>
                {[featured.courseTitle, featured.teacher, featured.duration].filter(Boolean).join(' · ')}
              </span>
              <span className="btn" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                Смотреть урок
              </span>
            </div>
          </Link>
        ) : null}

        <div style={{ marginTop: featured ? 24 : 0 }}>
          {book ? (
            current && bookItems.length ? (
              <div className="lbook-page">
                <BookLessonsHead book={current} count={bookItems.length} word={['видеоурок', 'видеоурока', 'видеоуроков']} />
                <VideoBrowser items={bookItems} localMode={!REGISTRATION_ENABLED} />
              </div>
            ) : (
              <p className="empty">
                По этой книге видеоуроков пока нет. <Link href="/video">Все видеоуроки →</Link>
              </p>
            )
          ) : shelf.length ? (
            <div className="lbook-page">
              <BookShelf books={shelf} base="/video" category={valid} />
              {others.length ? (
                <section className="lshelf">
                  <OtherLessonsTitle />
                  <VideoBrowser items={others} localMode={!REGISTRATION_ENABLED} hideInAll={featured?.id} />
                </section>
              ) : null}
            </div>
          ) : (
            <VideoBrowser items={inCategory} localMode={!REGISTRATION_ENABLED} hideInAll={featured?.id} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
