import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { ARTICLE_CATEGORIES, labelOf } from '@/lib/constants'
import { getArticleBySlug } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticleBySlug(slug)
  return { title: a?.title ?? 'Статья', description: a?.excerpt }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = await getArticleBySlug(slug)
  if (!a) notFound()
  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Статьи и вопросы', href: '/articles' },
          { label: labelOf(ARTICLE_CATEGORIES, a.category), href: `/articles?category=${a.category}` },
          { label: a.title },
        ]}
        eyebrow={`${labelOf(ARTICLE_CATEGORIES, a.category)} · ${a.kind === 'question' ? 'Разбор вопроса' : 'Статья'}${date ? ` · ${date}` : ''}`}
        title={a.title}
        lead={a.excerpt}
      />
      <main className="container section" style={{ maxWidth: 820 }}>
        <article className="card prose" style={{ padding: 36 }}>
          <RichText data={a.content} />
        </article>
      </main>
      <Footer />
    </>
  )
}
