import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { HadithCards } from '@/components/hadith/HadithCards'
import { chaptersWord, getFiqhPart } from '@/lib/fiqhData'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ part: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await getFiqhPart((await params).part)
  return { title: data ? `${data.part.title} — фикх` : 'Фикх' }
}

export default async function FiqhPartPage({ params }: Params) {
  const data = await getFiqhPart((await params).part)
  if (!data) notFound()
  const { part, books } = data
  return (
    <>
      <Header />
      <PageHead crumbs={[{ label: 'Главная', href: '/' }, { label: 'Фикх', href: '/fiqh' }, { label: part.title }]} eyebrow="Часть фикха" title={part.title}>
        {part.titleAr ? (
          <p className="qh-ar hd-head-ar" lang="ar" dir="rtl">
            {part.titleAr}
          </p>
        ) : null}
      </PageHead>
      <main className="container qmain">
        {books.length ? (
          <HadithCards
            items={books.map((b, i) => ({
              href: `/fiqh/${part.slug}/${b.slug}`,
              n: i + 1,
              title: b.title,
              titleAr: b.titleAr,
              meta: b.chapters ? chaptersWord(b.chapters) : '',
              empty: !b.translated,
              soon: b.chapters ? 'перевод готовится' : 'готовится',
            }))}
          />
        ) : (
          <p className="empty">Книги этой части готовятся.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
