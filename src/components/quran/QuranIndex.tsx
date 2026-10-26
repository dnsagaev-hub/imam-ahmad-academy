'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { PLACE_LABEL, searchKey, type Surah } from '@/lib/quran'
import { plural } from '@/lib/quran'

type Filter = 'all' | 'm' | 'd' | 'tr'

/** Список 114 сур: поиск по номеру, названию (по-русски и по-арабски), фильтр по месту ниспослания и переводу. */
export function QuranIndex({ translated, surahs }: { translated: number[]; surahs: Surah[] }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const hasTr = useMemo(() => new Set(translated), [translated])

  const counts = {
    all: surahs.length,
    m: surahs.filter((s) => s.place === 'm').length,
    d: surahs.filter((s) => s.place === 'd').length,
    tr: translated.length,
  }

  const list = useMemo(() => {
    const needle = searchKey(q.trim())
    return surahs.filter((s) => {
      if (filter === 'm' || filter === 'd') {
        if (s.place !== filter) return false
      } else if (filter === 'tr' && !hasTr.has(s.n)) return false
      if (!needle) return true
      if (/^\d+$/.test(needle)) return String(s.n) === needle
      return [s.ru, s.meaning, s.ar].some((v) => searchKey(v).includes(needle))
    })
  }, [q, filter, hasTr, surahs])

  const chips: { v: Filter; label: string }[] = [
    { v: 'all', label: 'Все суры' },
    { v: 'm', label: 'Мекканские' },
    { v: 'd', label: 'Мединские' },
    { v: 'tr', label: 'С переводом' },
  ]

  return (
    <div className="qi">
      <div className="qi-tools">
        <label className="search search-solo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            type="search"
            placeholder="Номер или название суры"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Поиск суры"
          />
        </label>
        <div className="chips" role="list">
          {chips.map((c) => (
            <button
              type="button"
              role="listitem"
              key={c.v}
              className={`chip${filter === c.v ? ' active' : ''}`}
              onClick={() => setFilter(c.v)}
            >
              {c.label}
              <span className="chip-count">{counts[c.v]}</span>
            </button>
          ))}
        </div>
      </div>

      {list.length ? (
        <ul className="qi-grid">
          {list.map((s) => (
            <li key={s.n}>
              <Link href={`/quran/${s.n}`} className="qi-card">
                <span className="qi-num" aria-label={`Сура ${s.n}`}>
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <rect x="9" y="9" width="30" height="30" rx="3" />
                    <rect x="9" y="9" width="30" height="30" rx="3" transform="rotate(45 24 24)" />
                  </svg>
                  <b>{s.n}</b>
                </span>
                <span className="qi-main">
                  <span className="qi-ru">{s.ru}</span>
                  <span className="qi-mean">{s.meaning}</span>
                  <span className="qi-meta">
                    {PLACE_LABEL[s.place]} · {s.ayahs} {plural(s.ayahs, ['аят', 'аята', 'аятов'])}
                    {hasTr.has(s.n) ? <span className="qi-tr">перевод</span> : null}
                  </span>
                </span>
                <span className="qi-ar" lang="ar" dir="rtl">
                  {s.ar}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">Сура не найдена. Попробуйте номер (1–114) или другое написание названия.</p>
      )}
    </div>
  )
}
