import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { VideoBrowser, VideoCover } from '@/components/video/VideoBrowser'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { LESSON_CATEGORIES, MEDIA_CATEGORIES, labelOf } from '@/lib/constants'
import { formatTotal, getMediaItems } from '@/lib/media'
import { plural } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Видеоуроки' }

export default async function VideoPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = LESSON_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const { items, counts } = await getMediaItems('video')
  const list = valid ? items.filter((i) => i.category === valid) : items
  const total = list.reduce((a, i) => a + i.seconds, 0)
  // Главное видео — самое новое (только на общей странице раздела)
  const featured = !valid ? list[0] : undefined

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Видеоуроки', href: valid ? '/video' : undefined },
          ...(valid ? [{ label: labelOf(LESSON_CATEGORIES, valid) }] : []),
        ]}
        eyebrow="Видеоуроки"
        title={valid ? labelOf(LESSON_CATEGORIES, valid) : 'Занятия с разбором текста'}
      >
        <div className="media-stats">
          <span>
            <b>{list.length}</b> видео
          </span>
          {total ? (
            <span>
              <b>{formatTotal(total)}</b> занятий
            </span>
          ) : null}
          <span>
            <b>{list.filter((i) => i.hasTest).length}</b> {plural(list.filter((i) => i.hasTest).length, ['урок', 'урока', 'уроков'])} с тестом
          </span>
        </div>
      </PageHead>

      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FilterChips base="/video" param="category" options={MEDIA_CATEGORIES} current={valid} counts={counts} />

        {featured ? (
          <Link href={`/lessons/${featured.slug}`} className="card vfeatured">
            <VideoCover item={featured} big />
            <div className="vfeatured-body">
              <span className="eyebrow" style={{ margin: 0 }}>
                Новое видео
              </span>
              <h2 className="display">{featured.title}</h2>
              {featured.excerpt ? <p className="muted">{featured.excerpt}</p> : null}
              <div className="vtile-tags">
                <span className="tag">{featured.categoryLabel}</span>
                {featured.hasTest ? <span className="tag-test">тест после урока</span> : null}
              </div>
              <span className="muted" style={{ fontSize: 14 }}>
                {[featured.courseTitle, featured.teacher, featured.duration].filter(Boolean).join(' · ')}
              </span>
              <span className="btn" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                Смотреть урок
              </span>
            </div>
          </Link>
        ) : null}

        <div style={{ marginTop: featured ? 24 : 0 }}>
          <VideoBrowser items={list} localMode={!REGISTRATION_ENABLED} hideInAll={featured?.id} />
        </div>
      </main>
      <Footer />
    </>
  )
}
