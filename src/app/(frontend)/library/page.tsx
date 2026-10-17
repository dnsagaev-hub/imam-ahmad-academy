import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { BookCover } from '@/components/library/BookCover'
import { LibraryBrowser } from '@/components/library/LibraryBrowser'
import { deathLabel, studyPath, toBookItem } from '@/lib/books'
import { BOOK_CATEGORIES, COURSE_LEVELS, labelOf } from '@/lib/constants'
import { getBooks, plural } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Библиотека',
  description: 'Матны и шархи ханбалитского мазхаба по ступеням изучения, опорные книги, переводы и пособия.',
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = BOOK_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const items = (await getBooks({ limit: 500 })).map(toBookItem)
  const path = studyPath(items)
  const mutamad = items.filter((b) => b.isMutamad)
  const matns = items.filter((b) => b.kind === 'matn').length
  const sharhs = items.filter((b) => b.kind === 'sharh' || b.kind === 'hashiya').length

  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Библиотека', href: valid ? '/library' : undefined }, ...(valid ? [{ label: labelOf(BOOK_CATEGORIES, valid) }] : [])]}
        eyebrow="Библиотека"
        title="Книги мазхаба — по ступеням"
        lead="Матны, которые учат наизусть, их шархи, опорные книги для сверки и пособия академии. У каждой книги — описание, ступень, на которой её изучают, и где её читать."
      >
        {items.length ? (
          <div className="media-stats">
            <span>
              <b>{items.length}</b> {plural(items.length, ['книга', 'книги', 'книг'])}
            </span>
            <span>
              <b>{matns}</b> {plural(matns, ['матн', 'матна', 'матнов'])}
            </span>
            <span>
              <b>{sharhs}</b> {plural(sharhs, ['шарх', 'шарха', 'шархов'])}
            </span>
          </div>
        ) : null}
      </PageHead>

      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {path.length && !valid ? (
          <section className="path" aria-labelledby="path-h">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <p className="eyebrow">Путь изучения фикха</p>
                <h2 className="h2" id="path-h" style={{ margin: 0 }}>
                  С какой книги начать
                </h2>
              </div>
              <p className="muted" style={{ maxWidth: 520, margin: 0 }}>
                Книги фикха по четырём ступеням программы академии. Переходите дальше, когда освоили предыдущую ступень.
              </p>
            </div>
            <ol className="path-steps">
              {path.map((step, i) => (
                <li key={step.level} className="path-step">
                  <div className="path-head">
                    <span className="path-num">{COURSE_LEVELS.find((l) => l.value === step.level)?.roman ?? i + 1}</span>
                    <span>
                      <b>{COURSE_LEVELS.find((l) => l.value === step.level)?.name}</b>
                      <small>{COURSE_LEVELS.find((l) => l.value === step.level)?.label.toLowerCase()} ступень</small>
                    </span>
                  </div>
                  {step.matns.map(({ matn, commentaries, translations }) => (
                    <div key={matn.id} className="path-book">
                      <Link href={`/library/${matn.slug}`} className="path-matn">
                        <span lang="ar" dir="rtl" className="path-ar">
                          {matn.titleAr || matn.title}
                        </span>
                        <span className="path-ru">{matn.title}</span>
                        <span className="path-author">{[matn.author, deathLabel(matn.authorDeath)].filter(Boolean).join(', ')}</span>
                        {matn.baseTitle ? <span className="path-author">шарх на «{matn.baseTitle}»</span> : null}
                      </Link>
                      {commentaries.length || translations.length ? (
                        <ul className="path-sub">
                          {commentaries.map((c) => (
                            <li key={c.id}>
                              <span className="btag btag-sharh">{c.kindLabel}</span>
                              <Link href={`/library/${c.slug}`}>{c.title}</Link>
                            </li>
                          ))}
                          {translations.map((c) => (
                            <li key={c.id}>
                              <span className="btag btag-translation">Перевод</span>
                              <Link href={`/library/${c.slug}`}>{c.title}</Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {mutamad.length && !valid ? (
          <section className="mutamad" aria-labelledby="mut-h">
            <div>
              <p className="eyebrow" style={{ color: 'var(--sky)' }}>
                Опорные книги
              </p>
              <h2 className="h2" id="mut-h" style={{ margin: '0 0 8px', color: '#fff' }}>
                По ним определяется основное мнение мазхаба
              </h2>
              <p style={{ margin: 0, color: 'var(--gold-light)', maxWidth: 560, lineHeight: 1.6 }}>
                В уроках академии «основное мнение» (му‘тамад) сверяется с этими книгами. Если они расходятся, приводятся
                оба мнения.
              </p>
            </div>
            <div className="mutamad-row">
              {mutamad.map((b) => (
                <Link key={b.id} href={`/library/${b.slug}`} className="mutamad-book">
                  <BookCover titleAr={b.titleAr} title={b.title} authorAr={b.authorAr} kind={b.kind} coverUrl={b.coverUrl} />
                  <b>{b.title}</b>
                  <small>{b.author}</small>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="cat-h" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 className="h2" id="cat-h" style={{ margin: 0 }}>
            Каталог
          </h2>
          {items.length ? (
            <LibraryBrowser key={valid ?? "all"} items={items} initialCategory={valid} />
          ) : (
            <p className="empty">Книги появятся здесь, когда вы добавите их в админке («Материалы» → «Библиотека»).</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
