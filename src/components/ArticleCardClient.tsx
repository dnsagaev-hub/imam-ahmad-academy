import Link from 'next/link'

import type { ArticleItem } from './ArticlesBrowser'

/** Карточка статьи или разбора вопроса (для списка с поиском). */
export function ArticleCardClient({ a }: { a: ArticleItem }) {
  const isQ = a.kind === 'question'
  const q = a.question ?? ''
  return (
    <article className={`card lift article-card${isQ ? ' qa-card' : ''}`}>
      <div className="text-card-top">
        <span className={isQ ? 'tag-q' : 'tag-a'}>{isQ ? 'Разбор вопроса' : 'Статья'}</span>
        <span className="tag">{a.categoryLabel}</span>
      </div>
      <h3>
        <Link href={`/articles/${a.slug}`}>{a.title}</Link>
      </h3>
      {isQ && q ? <blockquote className="qa-quote">{q.length > 180 ? `${q.slice(0, 180)}…` : q}</blockquote> : null}
      <p>{a.excerpt}</p>
      <div className="text-card-foot">
        <span>
          {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          {a.readingMinutes ? ` · ≈ ${a.readingMinutes} мин` : ''}
        </span>
        <Link href={`/articles/${a.slug}`} style={{ fontWeight: 700, fontSize: 14 }}>
          {isQ ? 'Читать ответ →' : 'Читать →'}
        </Link>
      </div>
    </article>
  )
}
