'use client'

import { useMemo, useState } from 'react'

import type { BookItem } from '@/lib/books'
import { BOOK_CATEGORIES, BOOK_KINDS } from '@/lib/constants'

import { BookTile } from './BookTile'

type Sort = 'order' | 'old' | 'new' | 'title'

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[ً-ْٰ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[‘’ʿʼ'`-]/g, '')

/** Каталог: вид книги, раздел, язык, поиск (в т. ч. по-арабски) и сортировка — всё в браузере. */
export function LibraryBrowser({ items, initialCategory }: { items: BookItem[]; initialCategory?: string }) {
  const [kind, setKind] = useState('')
  const [cat, setCat] = useState(initialCategory ?? '')
  const [lang, setLang] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('order')

  const byKind = useMemo(() => items.filter((b) => !kind || b.kind === kind), [items, kind])
  const list = useMemo(() => {
    const query = norm(q.trim())
    const res = byKind.filter(
      (b) =>
        (!cat || b.category === cat) &&
        (!lang || b.language === lang || (lang !== 'ar-ru' && b.language === 'ar-ru')) &&
        (!query || norm([b.title, b.titleAr, b.author, b.authorAr, b.description].join(' ')).includes(query)),
    )
    const s = [...res]
    if (sort === 'old') s.sort((a, b) => (a.authorDeath ?? 9999) - (b.authorDeath ?? 9999))
    if (sort === 'new') s.sort((a, b) => (b.authorDeath ?? 0) - (a.authorDeath ?? 0))
    if (sort === 'title') s.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
    return s
  }, [byKind, cat, lang, q, sort])

  const kinds = [{ label: 'Все книги', value: '' }, ...BOOK_KINDS.filter((k) => items.some((b) => b.kind === k.value))]
  const cats = BOOK_CATEGORIES.filter((c) => byKind.some((b) => b.category === c.value))
  const count = (k: string) => (k ? items.filter((b) => b.kind === k).length : items.length)

  return (
    <div className="lib">
      <div className="lib-top">
        <div className="seg" role="group" aria-label="Вид книги">
          {kinds.map((k) => (
            <button key={k.value || 'all'} type="button" aria-pressed={kind === k.value} onClick={() => setKind(k.value)}>
              {k.label} <span className="chip-count">{count(k.value)}</span>
            </button>
          ))}
        </div>
        <label className="lib-search">
          <span className="sr-only">Поиск по библиотеке</span>
          <input
            type="search"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Название или автор — можно по-арабски"
          />
        </label>
      </div>

      <div className="lib-filters">
        <div className="chips" role="group" aria-label="Раздел">
          <button type="button" className={`chip${cat ? '' : ' active'}`} onClick={() => setCat('')}>
            Все разделы <span className="chip-count">{byKind.length}</span>
          </button>
          {cats.map((c) => (
            <button key={c.value} type="button" className={`chip${cat === c.value ? ' active' : ''}`} onClick={() => setCat(c.value)}>
              {c.label} <span className="chip-count">{byKind.filter((b) => b.category === c.value).length}</span>
            </button>
          ))}
        </div>
        <div className="lib-selects">
          <label>
            <span className="sr-only">Язык</span>
            <select className="input" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="">Любой язык</option>
              <option value="ar">Арабский</option>
              <option value="ru">Русский</option>
              <option value="ar-ru">Арабский + русский</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Порядок</span>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="order">По порядку изучения</option>
              <option value="old">Сначала ранние авторы</option>
              <option value="new">Сначала поздние авторы</option>
              <option value="title">По названию</option>
            </select>
          </label>
        </div>
      </div>

      <p className="muted lib-found" aria-live="polite">
        Найдено: {list.length}
      </p>

      {list.length ? (
        <div className="lib-grid">
          {list.map((b) => (
            <BookTile key={b.id} b={b} />
          ))}
        </div>
      ) : (
        <p className="empty">Ничего не нашлось. Попробуйте другое слово или сбросьте фильтры.</p>
      )}
    </div>
  )
}
