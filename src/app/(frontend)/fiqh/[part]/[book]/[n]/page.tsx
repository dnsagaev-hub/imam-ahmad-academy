import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Crumbs } from '@/components/PageHead'
import { FiqhText, type FiqhParagraph } from '@/components/fiqh/FiqhText'
import { SurahInfoButtons, type SurahInfoPart } from '@/components/quran/SurahInfoButtons'
import { FIQH_NOTES } from '@/collections/Fiqh'
import { getFiqhChapter, paragraphsWord } from '@/lib/fiqhData'
import { mediaUrl } from '@/lib/queries'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ part: string; book: string; n: string }> }

// В тексте редактора есть хотя бы одна буква (пустой редактор хранит пустой абзац)
const hasText = (v: unknown) => {
  const c = v as { root?: { children?: unknown[] } } | null | undefined
  return !!c?.root?.children?.some((ch) => JSON.stringify(ch).includes('"text":"'))
}

const num = (n: string) => (/^[1-9]\d{0,2}$/.test(n) ? Number(n) : 0)

async function load(params: Params['params']) {
  const p = await params
  const n = num(p.n)
  return n ? getFiqhChapter(p.part, p.book, n) : null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await load(params)
  return { title: data ? `${data.chapter.title} — ${data.book.title}` : 'Фикх' }
}

export default async function FiqhChapterPage({ params }: Params) {
  const data = await load(params)
  if (!data) notFound()
  const { part, book, chapter, prev, next } = data

  const paragraphs: FiqhParagraph[] = (chapter.sentences ?? []).map((s) => ({
    arabic: s.arabic,
    translation: s.translation ?? '',
    notes: FIQH_NOTES.filter((f) => hasText(s[f.name])).map((f) => ({ name: f.name, label: f.label, body: <RichText data={s[f.name] as never} /> })),
  }))
  // Кнопки в шапке: только заполненные
  const scheme = mediaUrl(chapter.scheme)
  const info: SurahInfoPart[] = []
  if (hasText(chapter.intro)) info.push({ key: 'intro', label: 'Введение в раздел', body: <RichText data={chapter.intro as never} /> })
  if (scheme || hasText(chapter.schemeNote))
    info.push({
      key: 'scheme',
      label: 'Схема раздела',
      body: (
        <>
          {scheme ? (
            <a href={scheme} target="_blank" rel="noreferrer" className="fq-scheme">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={scheme} alt={`Схема раздела «${chapter.title}»`} />
            </a>
          ) : null}
          {hasText(chapter.schemeNote) ? <RichText data={chapter.schemeNote as never} /> : null}
        </>
      ),
    })
  const topics = (chapter.topics ?? []).filter((t) => t.title?.trim()).map((t) => ({ from: Number(t.from), title: t.title.trim() }))
  const base = `/fiqh/${part.slug}/${book.slug}`

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Фикх', href: '/fiqh' },
              { label: part.title, href: `/fiqh/${part.slug}` },
              { label: book.title, href: base },
              { label: chapter.title },
            ]}
          />
          <div className="sh">
            <div className="sh-ru">
              <p className="eyebrow">
                {book.title} · раздел {chapter.order}
              </p>
              <h1 className="page-title">{chapter.title}</h1>
              <div className="media-stats">
                <span>
                  <b>{paragraphs.length}</b> {paragraphsWord(paragraphs.length).replace(/^\d+ /, '')}
                </span>
              </div>
              {info.length ? <SurahInfoButtons surahName={chapter.title} eyebrow={`${book.title} · ${chapter.title}`} label="О разделе" parts={info} /> : null}
            </div>
            {chapter.titleAr ? (
              <p className="sh-ar hd-book-ar" lang="ar" dir="rtl">
                {chapter.titleAr}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <main className="container qmain">
        {paragraphs.length ? <FiqhText chapterTitle={chapter.title} paragraphs={paragraphs} topics={topics} /> : <p className="sv-wait">Текст этого раздела готовится.</p>}
        <nav className="sv-pager" aria-label="Соседние разделы">
          {prev ? (
            <Link href={`${base}/${prev.order}`} className="sv-pg">
              <span>← Предыдущий раздел</span>
              <b>{prev.title}</b>
            </Link>
          ) : (
            <span />
          )}
          <Link href={base} className="sv-pg sv-pg-all">
            Все разделы книги
          </Link>
          {next ? (
            <Link href={`${base}/${next.order}`} className="sv-pg sv-pg-next">
              <span>Следующий раздел →</span>
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
