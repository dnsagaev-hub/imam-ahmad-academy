import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { LessonText } from '@/components/text/LessonText'
import { ARTICLE_CATEGORIES, labelOf } from '@/lib/constants'
import { getArticleBySlug, getRelatedArticles } from '@/lib/queries'

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
  const related = await getRelatedArticles(a.category, a.id, 3)
  const isQ = a.kind === 'question'
  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const blocks = Array.isArray(a.blocks) ? a.blocks : []

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Статьи и вопросы', href: '/articles' },
          { label: labelOf(ARTICLE_CATEGORIES, a.category), href: `/articles?category=${a.category}` },
          { label: isQ ? 'Разбор вопроса' : 'Статья' },
        ]}
        eyebrow={`${isQ ? 'Разбор вопроса' : 'Статья'} · ${labelOf(ARTICLE_CATEGORIES, a.category)}${date ? ` · ${date}` : ''}`}
        title={a.title}
        lead={isQ ? undefined : a.excerpt}
      />

      <main className="container section" style={{ maxWidth: 980, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {isQ && a.question ? (
          <section className="qa-box">
            <div className="qa-q">
              <span className="qa-label">Вопрос</span>
              <p>{a.question}</p>
            </div>
            {a.shortAnswer ? (
              <div className="qa-a">
                <span className="qa-label">Краткий ответ</span>
                <p>{a.shortAnswer}</p>
                {blocks.length ? <a href="#razbor" className="qa-more">Подробный разбор с текстами книг ↓</a> : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {blocks.length ? (
          <div id="razbor">
            <LessonText blocks={blocks} sourceRef={a.sourceRef} readingMinutes={a.readingMinutes} label={isQ ? 'Подробный разбор' : 'Статья'} />
          </div>
        ) : null}

        {a.body ? (
          <article className="card prose" style={{ padding: 36 }}>
            <RichText data={a.body} />
          </article>
        ) : null}

        <aside className="qa-disclaimer">
          <b>Важно.</b> Разборы объясняют, что говорится в книгах ханбалитского мазхаба. Если ваш случай особый, обратитесь
          к знающему учёному, который выслушает все обстоятельства.
        </aside>

        <section className="ask-cta">
          <div>
            <h2 className="display">Остался вопрос?</h2>
            <p className="muted" style={{ margin: 0 }}>
              Задайте его нам — полезные ответы публикуются в этом разделе.
            </p>
          </div>
          <Link href="/contact" className="btn btn-lg">
            Задать вопрос
          </Link>
        </section>

        {related.length ? (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="h2" style={{ margin: 0, fontSize: 32 }}>
              По этой же теме
            </h2>
            <div className="grid grid-280">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  )
}
