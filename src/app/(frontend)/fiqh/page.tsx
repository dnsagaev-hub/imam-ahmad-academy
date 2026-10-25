import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { HadithCards } from '@/components/hadith/HadithCards'
import { booksWord, getFiqhParts } from '@/lib/fiqhData'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Фикх' }

export default async function FiqhPage() {
  const parts = await getFiqhParts()
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Фикх' }]}
        eyebrow="Ханбалитский мазхаб"
        title="Фикх"
        lead="Шесть частей фикха по «Зад аль-Мустакни‘» Мусы аль-Хаджжави: книги и разделы в порядке этого матна, арабский текст и перевод по абзацам."
      >
        <p className="qh-ar hd-head-ar" lang="ar" dir="rtl">
          زَادُ الْمُسْتَقْنِعِ
        </p>
      </PageHead>
      <main className="container qmain">
        {parts.length ? (
          <HadithCards
            items={parts.map((p, i) => ({
              href: `/fiqh/${p.slug}`,
              n: i + 1,
              title: p.title,
              titleAr: p.titleAr,
              meta: p.books ? booksWord(p.books) : '',
              empty: !p.books,
            }))}
          />
        ) : (
          <p className="empty">Раздел готовится: части появятся, как только будут добавлены.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
