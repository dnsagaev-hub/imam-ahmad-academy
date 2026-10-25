import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { HadithCards } from '@/components/hadith/HadithCards'
import { getFiqhBook, paragraphsWord } from '@/lib/fiqhData'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ part: string; book: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params
  const data = await getFiqhBook(p.part, p.book)
  return { title: data ? `${data.book.title} — фикх` : 'Фикх' }
}

export default async function FiqhBookPage({ params }: Params) {
  const p = await params
  const data = await getFiqhBook(p.part, p.book)
  if (!data) notFound()
  const { part, book, chapters, prev, next } = data
  const base = `/fiqh/${part.slug}`
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Фикх', href: '/fiqh' }, { label: part.title, href: base }, { label: book.title }]}
        eyebrow={part.title}
        title={book.title}
      >
        {book.titleAr ? (
          <p className="qh-ar hd-head-ar" lang="ar" dir="rtl">
            {book.titleAr}
          </p>
        ) : null}
      </PageHead>
      <main className="container qmain">
        {chapters.length ? (
          <HadithCards
            items={chapters.map((c) => ({
              href: `${base}/${book.slug}/${c.order}`,
              n: c.order,
              title: c.title,
              titleAr: c.titleAr,
              meta: [c.sentences ? paragraphsWord(c.sentences) : '', c.translated ? `переведено ${c.translated}` : ''].filter(Boolean).join(' · '),
              empty: !c.translated,
              soon: c.sentences ? 'перевод готовится' : 'готовится',
            }))}
          />
        ) : (
          <p className="empty">Разделы этой книги готовятся.</p>
        )}
        <nav className="sv-pager" aria-label="Соседние книги">
          {prev ? (
            <Link href={`${base}/${prev.slug}`} className="sv-pg">
              <span>← Предыдущая книга</span>
              <b>{prev.title}</b>
            </Link>
          ) : (
            <span />
          )}
          <Link href={base} className="sv-pg sv-pg-all">
            Все книги части
          </Link>
          {next ? (
            <Link href={`${base}/${next.slug}`} className="sv-pg sv-pg-next">
              <span>Следующая книга →</span>
              <b>{next.title}</b>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <Footer />
    </>
  )
}
