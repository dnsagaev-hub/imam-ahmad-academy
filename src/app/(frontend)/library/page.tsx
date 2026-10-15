import type { Metadata } from 'next'

import { BookCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { BOOK_CATEGORIES, labelOf } from '@/lib/constants'
import { getBooks } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Библиотека' }

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = BOOK_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const books = await getBooks({ category: valid, limit: 300 })
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Библиотека', href: valid ? '/library' : undefined }, ...(valid ? [{ label: labelOf(BOOK_CATEGORIES, valid) }] : [])]}
        eyebrow="Библиотека"
        title="Матны, шархи и пособия"
        lead="Книги открываются в PDF — их можно читать онлайн или скачать."
      />
      <main className="container section">
        <FilterChips base="/library" param="category" options={BOOK_CATEGORIES} current={valid} />
        {books.length ? (
          <div className="grid grid-200">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        ) : (
          <p className="empty">В этом разделе книг пока нет.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
