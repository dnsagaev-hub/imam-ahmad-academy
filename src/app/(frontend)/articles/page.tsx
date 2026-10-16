import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticlesBrowser } from '@/components/ArticlesBrowser'
import { toArticleItem } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { ARTICLE_CATEGORIES, labelOf } from '@/lib/constants'
import { getArticles } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Статьи и вопросы' }

const KINDS = [
  { value: '', label: 'Все материалы' },
  { value: 'question', label: 'Разборы вопросов' },
  { value: 'article', label: 'Статьи' },
]

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string; kind?: string }> }) {
  const { category, kind } = await searchParams
  const validCat = ARTICLE_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const validKind = kind === 'question' || kind === 'article' ? kind : ''
  const all = await getArticles({ limit: 500 })

  const byKind = validKind ? all.filter((a) => (a.kind ?? 'article') === validKind) : all
  const counts: Record<string, number> = {}
  for (const a of byKind) counts[a.category] = (counts[a.category] ?? 0) + 1
  const list = validCat ? byKind.filter((a) => a.category === validCat) : byKind
  const kindCount = (k: string) => (k ? all.filter((a) => (a.kind ?? 'article') === k).length : all.length)
  const qs = (k: string, c?: string) => {
    const p = new URLSearchParams()
    if (k) p.set('kind', k)
    if (c) p.set('category', c)
    const s = p.toString()
    return s ? `/articles?${s}` : '/articles'
  }

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Статьи и вопросы', href: validCat || validKind ? '/articles' : undefined },
          ...(validCat ? [{ label: labelOf(ARTICLE_CATEGORIES, validCat) }] : []),
        ]}
        eyebrow="Статьи и вопросы"
        title={validCat ? labelOf(ARTICLE_CATEGORIES, validCat) : 'Статьи и разборы вопросов'}
        lead="Ответы на вопросы с опорой на книги мазхаба: текст источника, перевод и пояснение. Не нашли ответа — задайте свой вопрос."
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
          <Link href="/contact" className="btn">
            Задать вопрос
          </Link>
        </div>
      </PageHead>

      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="seg" role="group" aria-label="Тип материалов" style={{ marginBottom: 16 }}>
          {KINDS.map((k) => (
            <Link
              key={k.value || 'all'}
              href={qs(k.value, validCat)}
              aria-current={validKind === k.value ? 'page' : undefined}
              className={`seg-link${validKind === k.value ? ' on' : ''}`}
            >
              {k.label} <span className="chip-count">{kindCount(k.value)}</span>
            </Link>
          ))}
        </div>
        <FilterChips
          base="/articles"
          keep={{ kind: validKind }}
          param="category"
          options={ARTICLE_CATEGORIES}
          current={validCat}
          counts={counts}
        />
        <ArticlesBrowser items={list.map(toArticleItem)} />
      </main>
      <Footer />
    </>
  )
}
