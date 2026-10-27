'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { normalize } from '@/lib/arabic'

/* Словарь курса (сквозной реестр слов): поиск по-арабски и по-русски, отбор по пометке. */

export type RegistryRow = {
  key: string
  word: string
  translation: string
  root?: string
  forms?: string
  tag?: string
  theme?: string
  lesson: number
  lessonSlug: string
  repeats: number[]
}

const TAG: Record<string, string> = { term: 'термин', book: 'книжное', daily: 'быт' }

export function RegistryTable({ rows, showLow }: { rows: RegistryRow[]; showLow: boolean }) {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const list = useMemo(() => {
    const ar = normalize(q)
    const ru = q.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (!tag || r.tag === tag) &&
        (!ru || (ar && normalize(r.word + ' ' + (r.forms ?? '') + ' ' + (r.root ?? '')).includes(ar)) || r.translation.toLowerCase().includes(ru)),
    )
  }, [rows, q, tag])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="reg-filter">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: كتاب или «книга»" aria-label="Поиск по словарю" dir="auto" />
        <div className="chips" style={{ margin: 0 }}>
          {[['', 'Все'], ...Object.entries(TAG)].map(([v, label]) => (
            <button key={v} type="button" className={`chip${tag === v ? ' active' : ''}`} onClick={() => setTag(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="muted" style={{ fontSize: 14 }}>
        Слов: {list.length}
        {list.length !== rows.length ? ` из ${rows.length}` : ''}
      </div>
      <div className="reg-wrap">
        <table className="reg-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Слово</th>
              <th>Корень</th>
              <th>Перевод</th>
              <th>Тема</th>
              <th>Урок</th>
              <th>Повторы</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const low = showLow && r.repeats.length < 5
              return (
                <tr key={r.key}>
                  <td className="muted">{rows.indexOf(r) + 1}</td>
                  <td>
                    <span className="ar reg-ar" lang="ar" dir="rtl">
                      {r.word}
                    </span>
                    {r.forms ? (
                      <span className="ar reg-forms" lang="ar" dir="rtl">
                        {r.forms}
                      </span>
                    ) : null}
                  </td>
                  <td className="ar" lang="ar" dir="rtl">
                    {r.root ?? ''}
                  </td>
                  <td>
                    {r.translation}
                    {r.tag && TAG[r.tag] ? <span className={`word-tag word-tag-${r.tag}`}>{TAG[r.tag]}</span> : null}
                  </td>
                  <td>{r.theme ?? ''}</td>
                  <td>
                    <Link href={`/lessons/${r.lessonSlug}`}>{r.lesson}</Link>
                  </td>
                  <td className={low ? 'reg-low' : undefined} title={r.repeats.length ? `Уроки: ${r.repeats.join(', ')}` : 'Пока не повторялось'}>
                    <b>{r.repeats.length}</b>
                    {r.repeats.length ? <span className="reg-rep"> ({r.repeats.slice(0, 8).join(', ')}{r.repeats.length > 8 ? '…' : ''})</span> : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
