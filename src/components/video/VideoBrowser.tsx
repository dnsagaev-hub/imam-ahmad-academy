'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { CATEGORY_AR } from '@/lib/constants'
import { useLocalProgress } from '@/lib/localProgress'
import type { MediaItem } from '@/lib/media'

/** Обложка видео: картинка из админки или нарисованная (зелёная, с названием рубрики по-арабски). */
export function VideoCover({ item, big = false }: { item: MediaItem; big?: boolean }) {
  return (
    <div className={`vcover${big ? ' big' : ''}`}>
      {item.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbUrl} alt="" loading="lazy" />
      ) : (
        <div className="vcover-gen" aria-hidden="true">
          <span className="ar" lang="ar">
            {CATEGORY_AR[item.category] ?? 'العلم'}
          </span>
          <span className="vcover-title">{item.title}</span>
        </div>
      )}
      <span className="vplay" aria-hidden="true">
        <svg width={big ? 30 : 22} height={big ? 30 : 22} viewBox="0 0 24 24" fill="#003D2C">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {item.duration ? <span className="vdur">{item.duration}</span> : null}
    </div>
  )
}

export function VideoTile({ item, passed = false }: { item: MediaItem; passed?: boolean }) {
  return (
    <Link href={`/lessons/${item.slug}`} className="card lift vtile">
      <VideoCover item={item} />
      <div className="vtile-body">
        <div className="vtile-tags">
          <span className="tag">{item.categoryLabel}</span>
          {passed ? <span className="tag-done">✓ Пройден</span> : item.hasTest ? <span className="tag-test">тест</span> : null}
          {item.hasNotes ? <span className="tag-soft">конспект</span> : null}
          {item.hasFiles ? <span className="tag-soft">файлы</span> : null}
        </div>
        <h3>{item.title}</h3>
        <span className="vtile-meta">
          {[item.courseTitle ? `${item.courseTitle}${item.lessonNumber ? ` · урок ${item.lessonNumber}` : ''}` : null, item.teacher]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
    </Link>
  )
}

type View = 'all' | 'courses'

/** Видеоуроки: поиск, вид «Все видео» / «По курсам», отметки пройденных уроков. */
export function VideoBrowser({ items, localMode, hideInAll }: { items: MediaItem[]; localMode: boolean; hideInAll?: string }) {
  const { progress } = useLocalProgress()
  const [q, setQ] = useState('')
  const [view, setView] = useState<View>('all')
  const isPassed = (id: string) => localMode && progress.passed.has(id)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter(
      (i) => !needle || [i.title, i.courseTitle, i.teacher, i.categoryLabel].some((v) => v?.toLowerCase().includes(needle)),
    )
  }, [items, q])

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; slug: string | null; items: MediaItem[] }>()
    for (const i of list) {
      const key = i.courseSlug ?? '—'
      if (!map.has(key)) map.set(key, { title: i.courseTitle ?? 'Отдельные уроки', slug: i.courseSlug, items: [] })
      map.get(key)!.items.push(i)
    }
    const arr = [...map.values()]
    arr.forEach((g) => g.items.sort((a, b) => (a.lessonNumber ?? 0) - (b.lessonNumber ?? 0)))
    return arr.sort((a, b) => (a.slug ? 0 : 1) - (b.slug ? 0 : 1))
  }, [list])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="media-toolbar">
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input type="search" placeholder="Поиск по названию, курсу, преподавателю" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск видеоуроков" />
        </label>
        <div className="seg" role="group" aria-label="Вид списка">
          <button type="button" aria-pressed={view === 'all'} onClick={() => setView('all')}>
            Все видео
          </button>
          <button type="button" aria-pressed={view === 'courses'} onClick={() => setView('courses')}>
            По курсам
          </button>
        </div>
      </div>

      {!list.length ? (
        <p className="empty">{q ? 'Ничего не найдено. Попробуйте другой запрос.' : 'В этом разделе видеоуроков пока нет.'}</p>
      ) : view === 'all' ? (
        <div className="grid grid-320">
          {list.filter((i) => i.id !== hideInAll || q.trim()).map((i) => (
            <VideoTile key={i.id} item={i} passed={isPassed(i.id)} />
          ))}
        </div>
      ) : (
        groups.map((g) => {
          const done = g.items.filter((i) => isPassed(i.id)).length
          return (
            <section key={g.slug ?? 'none'} className="vgroup">
              <div className="vgroup-head">
                <div>
                  <h2 className="display">{g.title}</h2>
                  <span className="muted">
                    {g.items.length} видео{localMode && done ? ` · пройдено ${done}` : ''}
                  </span>
                </div>
                {g.slug ? (
                  <Link href={`/courses/${g.slug}`} style={{ fontWeight: 700 }}>
                    Программа курса →
                  </Link>
                ) : null}
              </div>
              <div className="vrow">
                {g.items.map((i) => (
                  <VideoTile key={i.id} item={i} passed={isPassed(i.id)} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
