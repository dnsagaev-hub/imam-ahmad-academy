import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Crumbs } from '@/components/PageHead'
import { BookCover } from '@/components/library/BookCover'
import { BookTile } from '@/components/library/BookTile'
import { deathLabel, toBookItem } from '@/lib/books'
import { BOOK_KINDS, BOOK_LEVELS, COURSE_LEVELS, labelOf } from '@/lib/constants'
import { getBookBySlug, getCommentaries, getCoursesByBook, mediaUrl } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const b = await getBookBySlug(slug)
  return { title: b?.title ?? 'Книга', description: b?.description }
}

const paragraphs = (t?: string | null) =>
  String(t ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getBookBySlug(slug)
  if (!doc) notFound()
  const b = toBookItem(doc)
  const [commentaries, courses] = await Promise.all([getCommentaries(doc.id), getCoursesByBook(doc.id)])
  const base = doc.baseBook && typeof doc.baseBook === 'object' ? toBookItem(doc.baseBook) : null
  const pdf = mediaUrl(doc.file)
  const links: { label: string; url: string }[] = Array.isArray(doc.links) ? doc.links : []
  const levelFull = BOOK_LEVELS.find((l) => l.value === b.level)?.label
  const kindHint = BOOK_KINDS.find((k) => k.value === b.kind)?.hint

  const facts = [
    ['Автор', [b.author, b.authorAr ? `(${b.authorAr})` : '', deathLabel(b.authorDeath) ? `— ${deathLabel(b.authorDeath)}` : ''].filter(Boolean).join(' ')],
    ['Вид', `${b.kindLabel}${kindHint ? ` — ${kindHint.toLowerCase()}` : ''}`],
    ['Раздел', b.categoryLabel],
    ['Ступень', levelFull ?? ''],
    ['Язык', b.languageLabel],
    ['Издание', doc.edition ?? ''],
    ['Страниц', doc.pages ? String(doc.pages) : ''],
  ].filter(([, v]) => v)

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container" style={{ paddingBottom: 14 }}>
          <Crumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Библиотека', href: '/library' },
              { label: b.categoryLabel, href: `/library?category=${b.category}` },
              { label: b.title },
            ]}
          />
        </div>
      </div>

      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 32 }}>
        <section className="bhero">
          <BookCover titleAr={b.titleAr} title={b.title} authorAr={b.authorAr} kind={b.kind} coverUrl={b.coverUrl} size="lg" />
          <div className="bhero-info">
            <div className="btile-tags">
              <span className={`btag btag-${b.kind}`}>{b.kindLabel}</span>
              <span className="btag btag-level">{b.categoryLabel}</span>
              {b.levelLabel ? <span className="btag btag-level">{b.levelLabel}</span> : null}
              {b.isMutamad ? <span className="btag btag-mutamad">★ Опорная книга мазхаба</span> : null}
            </div>
            <h1 className="display bhero-title">{b.title}</h1>
            {b.titleAr ? (
              <p className="bhero-ar" lang="ar" dir="rtl">
                {b.titleAr}
              </p>
            ) : null}
            <p className="bhero-author">{[b.author, deathLabel(b.authorDeath)].filter(Boolean).join(', ')}</p>
            {base ? (
              <p className="bhero-base">
                {b.kindLabel} на книгу <Link href={`/library/${base.slug}`}>«{base.title}»</Link>
                {base.author ? `, ${base.author}` : ''}
              </p>
            ) : null}
            <p className="bhero-desc">{b.description}</p>
            <div className="bhero-actions">
              {pdf ? (
                <>
                  <a href={pdf} target="_blank" rel="noopener" className="btn btn-lg">
                    Читать PDF
                  </a>
                  <a href={pdf} download className="btn btn-lg btn-outline">
                    Скачать
                  </a>
                </>
              ) : null}
              {links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener" className={`btn btn-lg ${pdf ? 'btn-ghost' : 'btn-outline'}`}>
                  {l.label} ↗
                </a>
              ))}
              {!pdf && !links.length ? <span className="muted">Файл книги пока не добавлен.</span> : null}
            </div>
          </div>
        </section>

        <div className="bgrid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            {doc.about ? (
              <section className="card card-pad prose">
                <h2 className="h2" style={{ fontSize: 30, marginBottom: 12 }}>
                  О книге
                </h2>
                {paragraphs(doc.about).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ) : null}

            {courses.length ? (
              <section className="card card-pad bcourses">
                <span className="tl-label">Изучить с преподавателем</span>
                {courses.map((c) => (
                  <Link key={c.id} href={`/courses/${c.slug}`} className="bcourse">
                    <span>
                      <b>{c.title}</b>
                      <small>Курс · {labelOf(COURSE_LEVELS, (c as any).level)}</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </section>
            ) : null}
          </div>

          <aside className="card card-pad bfacts">
            <span className="tl-label">Сведения о книге</span>
            <dl>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {commentaries.length ? (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="h2" style={{ margin: 0, fontSize: 32 }}>
              Шархи и переводы этой книги
            </h2>
            <div className="lib-grid">
              {commentaries.map((c) => (
                <BookTile key={c.id} b={toBookItem({ ...c, baseBook: null })} />
              ))}
            </div>
          </section>
        ) : null}

        <p>
          <Link href="/library" style={{ fontWeight: 700 }}>
            ← Вся библиотека
          </Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
