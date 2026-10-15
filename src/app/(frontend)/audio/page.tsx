import type { Metadata } from 'next'

import { AudioRow } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { LESSON_CATEGORIES, labelOf } from '@/lib/constants'
import { getLessons } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Аудиоуроки' }

export default async function AudioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = LESSON_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const lessons = await getLessons({ kind: 'audio', category: valid, limit: 200 })
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Аудиоуроки', href: valid ? '/audio' : undefined }, ...(valid ? [{ label: labelOf(LESSON_CATEGORIES, valid) }] : [])]}
        eyebrow="Аудиоуроки"
        title={valid ? labelOf(LESSON_CATEGORIES, valid) : 'Слушайте в дороге'}
      />
      <main className="container section">
        <FilterChips base="/audio" param="category" options={LESSON_CATEGORIES} current={valid} />
        {lessons.length ? (
          <div className="card audio-list">
            {lessons.map((l) => (
              <AudioRow key={l.id} lesson={l} />
            ))}
          </div>
        ) : (
          <p className="empty">В этом разделе аудиоуроков пока нет.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
