import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SearchIcon } from '@/components/Icons'
import { FilterChips, PageHead } from '@/components/PageHead'
import { SEARCH_GROUPS, search, type SearchGroup, type SearchHit } from '@/lib/search'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Поиск по сайту' }

// В разделе «Все» — первые результаты каждого раздела, в одном разделе — больше
const PER_GROUP = 5
const IN_GROUP = 100

function Hit({ hit }: { hit: SearchHit }) {
  return (
    <li className="sr-hit">
      <Link href={hit.href} className="sr-link">
        <span className="sr-where">{hit.where}</span>
        <span className="sr-title">
          {hit.title}
          {hit.titleAr ? (
            <span className="ar sr-title-ar" lang="ar">
              {hit.titleAr}
            </span>
          ) : null}
        </span>
        {hit.snippet ? (
          <span className={`sr-snippet${hit.snippet.ar ? ' ar' : ''}`} lang={hit.snippet.ar ? 'ar' : undefined}>
            {hit.snippet.pieces.map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
          </span>
        ) : null}
      </Link>
    </li>
  )
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; in?: string | string[] }> }) {
  const sp = await searchParams
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? '').trim().slice(0, 100)
  const inRaw = Array.isArray(sp.in) ? sp.in[0] : sp.in
  const group = SEARCH_GROUPS.find((g) => g.value === inRaw)?.value as SearchGroup | undefined
  const result = q ? await search(q, group ? IN_GROUP : PER_GROUP) : null
  const total = result ? Object.values(result.counts).reduce((a, b) => a + b, 0) : 0
  const shown = group ? SEARCH_GROUPS.filter((g) => g.value === group) : SEARCH_GROUPS

  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Поиск' }]}
        eyebrow="Поиск по сайту"
        title={q ? `Поиск: «${q}»` : 'Поиск по сайту'}
        lead="Коран, хадисы, фикх, курсы, уроки, статьи и библиотека. Можно писать по-русски или по-арабски, огласовки не нужны."
      >
        <form action="/search" method="get" role="search" className="sr-form">
          <label className="search sr-input">
            <SearchIcon />
            <input type="search" name="q" defaultValue={q} placeholder="Например: таяммум, намаз в пути, الطهارة" aria-label="Что искать" autoFocus={!q} maxLength={100} />
          </label>
          {group ? <input type="hidden" name="in" value={group} /> : null}
          <button type="submit" className="btn">
            Найти
          </button>
        </form>
      </PageHead>

      <main className="section">
        <div className="container sr">
        {!q ? (
          <p className="empty">Введите слово или несколько слов и нажмите «Найти».</p>
        ) : !result?.words.length ? (
          <p className="empty">Слово слишком короткое: введите хотя бы 2 буквы.</p>
        ) : (
          <>
            <FilterChips base="/search" keep={{ q }} param="in" options={SEARCH_GROUPS} current={group} counts={result.counts} />
            {(group ? result.counts[group] : total) === 0 ? (
              <div className="empty">
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--ink)' }}>Ничего не найдено</p>
                <p style={{ margin: 0 }}>
                  Попробуйте другое слово, часть слова или напишите его иначе. Не нашли ответа на вопрос —{' '}
                  <Link href="/contact">задайте его нам</Link>.
                </p>
              </div>
            ) : (
              shown
                .filter((g) => result.counts[g.value] > 0)
                .map((g) => (
                  <section key={g.value} className="sr-group" aria-labelledby={`sr-${g.value}`}>
                    <h2 className="sr-group-title" id={`sr-${g.value}`}>
                      {g.label} <span className="chip-count">{result.counts[g.value]}</span>
                    </h2>
                    <ul className="sr-list">
                      {result.hits[g.value].map((h, i) => (
                        <Hit key={`${h.href}-${i}`} hit={h} />
                      ))}
                    </ul>
                    {!group && result.counts[g.value] > PER_GROUP ? (
                      <Link className="sr-more" href={`/search?${new URLSearchParams({ q, in: g.value })}`}>
                        Все результаты раздела «{g.label}» ({result.counts[g.value]}) →
                      </Link>
                    ) : null}
                    {group && result.counts[g.value] > IN_GROUP ? (
                      <p className="sr-note">
                        Показаны первые {IN_GROUP} из {result.counts[g.value]}. Добавьте ещё слово, чтобы сузить поиск.
                      </p>
                    ) : null}
                  </section>
                ))
            )}
          </>
        )}
        </div>
      </main>
      <Footer />
    </>
  )
}
