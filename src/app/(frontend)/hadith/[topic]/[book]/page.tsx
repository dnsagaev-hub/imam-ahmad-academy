import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Crumbs } from '@/components/PageHead'
import { HadithList, type HadithItem, type HadithGroup } from '@/components/hadith/HadithList'
import { HADITH_PARTS } from '@/collections/Hadiths'
import { chapters, getHadithBook, hadiths as hadithWord } from '@/lib/hadithData'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ topic: string; book: string }> }

// В тексте редактора есть хотя бы одна буква (пустой редактор хранит пустой абзац)
const hasText = (v: unknown) => {
  const c = v as { root?: { children?: unknown[] } } | null | undefined
  return !!c?.root?.children?.some((ch) => JSON.stringify(ch).includes('"text":"'))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params
  const data = await getHadithBook(p.topic, p.book)
  return { title: data ? `${data.book.title} — хадисы` : 'Хадисы' }
}

export default async function HadithBookPage({ params }: Params) {
  const p = await params
  const data = await getHadithBook(p.topic, p.book)
  if (!data) notFound()
  const { topic, book, sections, hadiths, prev, next } = data

  const toItem = (h: (typeof hadiths)[number]): HadithItem => ({
    id: String(h.id),
    number: h.number,
    arabic: h.arabic,
    translation: h.translation,
    parts: HADITH_PARTS.filter((f) => hasText(h[f.name])).map((f) => ({ name: f.name, label: f.label, body: <RichText data={h[f.name] as never} /> })),
  })
  // Хадисы по главам в порядке глав; хадисы без главы (или с главой другой книги) — в начале
  const known = new Set(sections.map((s) => String(s.id)))
  const groups: HadithGroup[] = []
  const loose = hadiths.filter((h) => !h.section || !known.has(String(h.section)))
  if (loose.length) groups.push({ id: 'g0', items: loose.map(toItem) })
  sections.forEach((s, i) => {
    const items = hadiths.filter((h) => String(h.section) === String(s.id)).map(toItem)
    if (items.length) groups.push({ id: `g${i + 1}`, title: s.title, titleAr: s.titleAr, items })
  })
  const named = groups.filter((g) => g.title)
  const base = `/hadith/${topic.slug}`

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs items={[{ label: 'Главная', href: '/' }, { label: 'Хадисы', href: '/hadith' }, { label: topic.title, href: base }, { label: book.title }]} />
          <div className="sh">
            <div className="sh-ru">
              <p className="eyebrow">{topic.title}</p>
              <h1 className="page-title">{book.title}</h1>
              <div className="media-stats">
                {named.length ? <span>{chapters(named.length)}</span> : null}
                <span>
                  <b>{hadiths.length}</b> {hadithWord(hadiths.length).replace(/^\d+ /, '')}
                </span>
              </div>
              {named.length > 1 ? (
                <nav className="sh-info" aria-label="Главы книги">
                  {named.map((g) => (
                    <a key={g.id} href={`#${g.id}`} className="sh-info-btn">
                      {g.title}
                    </a>
                  ))}
                </nav>
              ) : null}
            </div>
            {book.titleAr ? (
              <p className="sh-ar hd-book-ar" lang="ar" dir="rtl">
                {book.titleAr}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <main className="container qmain">
        {hadiths.length ? <HadithList bookTitle={book.title} groups={groups} /> : <p className="sv-wait">Хадисы этой книги готовятся и появятся, как только будут добавлены.</p>}
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
            Все книги темы
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
