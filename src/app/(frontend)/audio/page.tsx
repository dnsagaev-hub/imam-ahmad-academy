import type { Metadata } from 'next'

import { AudioBrowser } from '@/components/audio/AudioBrowser'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { LESSON_CATEGORIES, MEDIA_CATEGORIES, labelOf } from '@/lib/constants'
import { formatTotal, getMediaItems } from '@/lib/media'
import { plural } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Аудиоуроки' }

export default async function AudioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = LESSON_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const { items, counts } = await getMediaItems('audio')
  const list = valid ? items.filter((i) => i.category === valid) : items
  const total = list.reduce((a, i) => a + i.seconds, 0)
  const rubrics = Object.keys(counts).length

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Аудиоуроки', href: valid ? '/audio' : undefined },
          ...(valid ? [{ label: labelOf(LESSON_CATEGORIES, valid) }] : []),
        ]}
        eyebrow="Аудиоуроки"
        title={valid ? labelOf(LESSON_CATEGORIES, valid) : 'Слушайте в дороге'}
        lead="Плеер продолжает играть, пока вы переходите по сайту, и запоминает, где вы остановились."
      >
        <div className="media-stats">
          <span>
            <b>{list.length}</b> {plural(list.length, ['урок', 'урока', 'уроков'])}
          </span>
          {total ? (
            <span>
              <b>{formatTotal(total)}</b> записи
            </span>
          ) : null}
          {!valid && rubrics ? (
            <span>
              <b>{rubrics}</b> {plural(rubrics, ['рубрика', 'рубрики', 'рубрик'])}
            </span>
          ) : null}
        </div>
      </PageHead>
      <main className="container section">
        <FilterChips base="/audio" param="category" options={MEDIA_CATEGORIES} current={valid} counts={counts} />
        <AudioBrowser items={list} />
      </main>
      <Footer />
    </>
  )
}
