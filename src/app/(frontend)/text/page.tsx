import type { Metadata } from 'next'

import { TextLessonCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { TEXT_CATEGORIES, labelOf } from '@/lib/constants'
import { getLessons } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Текстовые уроки' }

export default async function TextLessonsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = TEXT_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const lessons = await getLessons({ kind: 'text', category: valid, limit: 200 })
  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Текстовые уроки', href: valid ? '/text' : undefined },
          ...(valid ? [{ label: labelOf(TEXT_CATEGORIES, valid) }] : []),
        ]}
        eyebrow="Текстовые уроки"
        title={valid ? labelOf(TEXT_CATEGORIES, valid) : 'Уроки для чтения'}
        lead="Уроки в виде текста — удобно читать, перечитывать и возвращаться к ним."
      />
      <main className="container section">
        <FilterChips base="/text" param="category" options={TEXT_CATEGORIES} current={valid} />
        {lessons.length ? (
          <div className="grid grid-320">
            {lessons.map((l) => (
              <TextLessonCard key={l.id} lesson={l} />
            ))}
          </div>
        ) : (
          <p className="empty">В этой рубрике текстовых уроков пока нет.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
