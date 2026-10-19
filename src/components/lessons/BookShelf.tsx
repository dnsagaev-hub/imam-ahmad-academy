import Link from 'next/link'

import { BookCover } from '@/components/library/BookCover'
import { deathLabel, type BookItem } from '@/lib/books'
import type { ShelfBook } from '@/lib/lessonBooks'
import { plural } from '@/lib/queries'

/* Полка книг в разделах уроков: обложка и название; нажатие открывает уроки этой книги. */

export const bookHref = (base: string, slug: string, category?: string) =>
  `${base}?${new URLSearchParams({ ...(category ? { category } : {}), book: slug })}`

export function BookShelf({ books, base, category }: { books: ShelfBook[]; base: string; category?: string }) {
  return (
    <section className="lshelf" aria-label="Книги">
      <h2 className="h2 lshelf-title">Книги</h2>
      <div className="lshelf-grid">
        {books.map((b) => (
          <Link key={b.id} href={bookHref(base, b.slug, category)} className="lshelf-book">
            <BookCover titleAr={b.titleAr} title={b.title} authorAr={b.authorAr} kind={b.kind} coverUrl={b.coverUrl} />
            <span className="lshelf-name">{b.title}</span>
            <span className="lshelf-count">
              {b.count} {plural(b.count, ['урок', 'урока', 'уроков'])}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** Шапка страницы уроков одной книги. */
export function BookLessonsHead({ book, count, word }: { book: BookItem; count: number; word: [string, string, string] }) {
  return (
    <section className="card lbook">
      <BookCover titleAr={book.titleAr} title={book.title} authorAr={book.authorAr} kind={book.kind} coverUrl={book.coverUrl} />
      <div className="lbook-info">
        <span className="tl-label">Уроки по книге</span>
        <h2 className="display lbook-title">{book.title}</h2>
        {book.titleAr ? (
          <p className="lbook-ar" lang="ar" dir="rtl">
            {book.titleAr}
          </p>
        ) : null}
        <p className="muted lbook-author">{[book.author, deathLabel(book.authorDeath)].filter(Boolean).join(', ')}</p>
        <p className="lbook-meta">
          <span>
            <b>{count}</b> {plural(count, word)}
          </span>
          <Link href={`/library/${book.slug}`}>О книге в библиотеке →</Link>
        </p>
      </div>
    </section>
  )
}

/** Подзаголовок над уроками, у которых книга не указана. */
export function OtherLessonsTitle() {
  return <h2 className="h2 lshelf-title">Другие уроки</h2>
}
