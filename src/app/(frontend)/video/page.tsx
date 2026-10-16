import type { Metadata } from 'next'

import { VideoCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { LESSON_CATEGORIES, MEDIA_CATEGORIES, labelOf } from '@/lib/constants'
import { getLessons } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Видеоуроки' }

export default async function VideoPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = LESSON_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const lessons = await getLessons({ kind: 'video', category: valid, limit: 200 })
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Видеоуроки', href: valid ? '/video' : undefined }, ...(valid ? [{ label: labelOf(LESSON_CATEGORIES, valid) }] : [])]}
        eyebrow="Видеоуроки"
        title={valid ? labelOf(LESSON_CATEGORIES, valid) : 'Занятия с разбором текста'}
      />
      <main className="container section">
        <FilterChips base="/video" param="category" options={MEDIA_CATEGORIES} current={valid} />
        {lessons.length ? (
          <div className="grid grid-320">
            {lessons.map((l) => (
              <VideoCard key={l.id} lesson={l} />
            ))}
          </div>
        ) : (
          <p className="empty">В этом разделе видеоуроков пока нет.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
