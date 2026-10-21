'use client'

import { useMemo, useState } from 'react'

import { ArticleCardClient } from './ArticleCardClient'

export type ArticleItem = {
  id: string
  slug: string
  title: string
  kind: string
  category: string
  categoryLabel: string
  excerpt: string
  question: string | null
  publishedAt: string | null
  readingMinutes: number | null
}

/** Поиск по статьям и разборам (по заголовку, описанию и тексту вопроса). */
export function ArticlesBrowser({ items }: { items: ArticleItem[] }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return items
    return items.filter((i) => [i.title, i.excerpt, i.question, i.categoryLabel].some((v) => v?.toLowerCase().includes(n)))
  }, [items, q])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <label className="search search-solo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input type="search" placeholder="Поиск: например, «таяммум» или «намаз в пути»" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск по статьям и вопросам" />
      </label>
      {list.length ? (
        <div className="grid grid-320">
          {list.map((a) => (
            <ArticleCardClient key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <div className="empty" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <span>{q ? 'Ничего не нашлось. Возможно, ответа на этот вопрос ещё нет.' : 'Материалов пока нет.'}</span>
          <a href="/contact" className="btn btn-outline">
            Задать свой вопрос
          </a>
        </div>
      )}
    </div>
  )
}
