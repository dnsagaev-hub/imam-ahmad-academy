import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { HadithCards } from '@/components/hadith/HadithCards'
import { chapters, getHadithTopic, hadiths } from '@/lib/hadithData'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ topic: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await getHadithTopic((await params).topic)
  return { title: data ? `${data.topic.title} — хадисы` : 'Хадисы' }
}

export default async function HadithTopicPage({ params }: Params) {
  const { topic: slug } = await params
  const data = await getHadithTopic(slug)
  if (!data) notFound()
  const { topic, books } = data
  return (
    <>
      <Header />
      <PageHead crumbs={[{ label: 'Главная', href: '/' }, { label: 'Хадисы', href: '/hadith' }, { label: topic.title }]} eyebrow="Тема" title={topic.title}>
        {topic.titleAr ? (
          <p className="qh-ar hd-head-ar" lang="ar" dir="rtl">
            {topic.titleAr}
          </p>
        ) : null}
      </PageHead>
      <main className="container qmain">
        {books.length ? (
          <HadithCards
            items={books.map((b, i) => ({
              href: `/hadith/${topic.slug}/${b.slug}`,
              n: i + 1,
              title: b.title,
              titleAr: b.titleAr,
              meta: [b.sections ? chapters(b.sections) : '', b.hadiths ? hadiths(b.hadiths) : ''].filter(Boolean).join(' · '),
              empty: !b.hadiths,
            }))}
          />
        ) : (
          <p className="empty">Книги этой темы готовятся.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
