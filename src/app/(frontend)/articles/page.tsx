import type { Metadata } from 'next'

import { ArticleCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { ARTICLE_CATEGORIES, labelOf } from '@/lib/constants'
import { getArticles } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Статьи и вопросы' }

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const valid = ARTICLE_CATEGORIES.some((c) => c.value === category) ? category : undefined
  const articles = await getArticles({ category: valid, limit: 200 })
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Статьи и вопросы', href: valid ? '/articles' : undefined }, ...(valid ? [{ label: labelOf(ARTICLE_CATEGORIES, valid) }] : [])]}
        eyebrow="Статьи и вопросы"
        title={valid ? labelOf(ARTICLE_CATEGORIES, valid) : 'Статьи и разборы'}
        lead="Ответы на вопросы учеников с опорой на книги мазхаба."
      />
      <main className="container section">
        <FilterChips base="/articles" param="category" options={ARTICLE_CATEGORIES} current={valid} />
        {articles.length ? (
          <div className="grid grid-320">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <p className="empty">В этой рубрике статей пока нет.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
