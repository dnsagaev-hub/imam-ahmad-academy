'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { fmtClock, useListenMap } from '@/lib/listenStore'
import type { MediaItem } from '@/lib/media'

import { useAudioPlayer, type Track } from './AudioPlayer'

const toTrack = (i: MediaItem): Track => ({
  id: i.id,
  title: i.title,
  subtitle: [i.courseTitle ?? i.categoryLabel, i.teacher].filter(Boolean).join(' · '),
  url: i.audioUrl!,
  href: `/lessons/${i.slug}`,
})

type Sort = 'order' | 'new' | 'course' | 'short'

/** Список аудиоуроков: поиск, сортировка, «слушать подряд», отметки прослушанного.
 *  `ordered` — уроки одной книги уже стоят по порядку изучения; этот порядок предлагается первым. */
export function AudioBrowser({ items, compact = false, ordered = false }: { items: MediaItem[]; compact?: boolean; ordered?: boolean }) {
  const { current, playing, play } = useAudioPlayer()
  const listen = useListenMap()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>(ordered ? 'order' : 'new')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = items.filter(
      (i) =>
        i.audioUrl &&
        (!needle || [i.title, i.courseTitle, i.teacher, i.categoryLabel].some((v) => v?.toLowerCase().includes(needle))),
    )
    const sorted = [...filtered]
    if (sort === 'course')
      sorted.sort((a, b) => (a.courseTitle ?? '￿').localeCompare(b.courseTitle ?? '￿', 'ru') || (a.lessonNumber ?? 0) - (b.lessonNumber ?? 0))
    else if (sort === 'new' && ordered) sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else if (sort === 'short') sorted.sort((a, b) => (a.seconds || 1e9) - (b.seconds || 1e9))
    return sorted
  }, [items, q, sort])

  const queue = list.map(toTrack)
  const firstUnheard = list.find((i) => !listen[i.id]?.done) ?? list[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {compact ? null : (
      <div className="media-toolbar">
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input type="search" placeholder="Поиск по названию, курсу, преподавателю" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск аудиоуроков" />
        </label>
        <select className="input select-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка">
          {ordered ? <option value="order">По порядку изучения</option> : null}
          <option value="new">Сначала новые</option>
          <option value="course">По курсам и порядку</option>
          <option value="short">Сначала короткие</option>
        </select>
        {firstUnheard ? (
          <button type="button" className="btn" onClick={() => play(toTrack(firstUnheard), queue)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            Слушать подряд
          </button>
        ) : null}
      </div>
      )}

      {list.length ? (
        <ol className="card track-list">
          {list.map((i, n) => {
            const isCur = current?.id === i.id
            const l = listen[i.id]
            const pct = l ? (l.done ? 100 : Math.round((l.t / Math.max(l.d, 1)) * 100)) : 0
            return (
              <li key={i.id} className={`track${isCur ? ' current' : ''}`}>
                <button
                  type="button"
                  className="track-play"
                  onClick={() => play(toTrack(i), queue)}
                  aria-label={isCur && playing ? `Пауза: ${i.title}` : `Слушать: ${i.title}`}
                >
                  {isCur && playing ? (
                    <span className="eq" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <span className="track-n" aria-hidden="true">
                  {String(n + 1).padStart(2, '0')}
                </span>
                <div className="track-info">
                  <Link href={`/lessons/${i.slug}`} className="track-title">
                    {i.title}
                  </Link>
                  <div className="track-meta">
                    <span className="tag-soft">{i.categoryLabel}</span>
                    {i.courseTitle ? (
                      <span>
                        {i.courseTitle}
                        {i.lessonNumber ? ` · урок ${i.lessonNumber}` : ''}
                      </span>
                    ) : null}
                    {i.teacher ? <span>{i.teacher}</span> : null}
                    {i.hasTest ? <span className="tag-test">тест</span> : null}
                    {i.hasNotes ? <span className="tag-soft">конспект</span> : null}
                    {i.hasFiles ? <span className="tag-soft">файлы</span> : null}
                  </div>
                  {l ? (
                    <div className="track-progress">
                      <div className="bar thin">
                        <div style={{ width: `${pct}%` }} />
                      </div>
                      <span>{l.done ? 'Прослушано' : `Остановились на ${fmtClock(l.t)}`}</span>
                    </div>
                  ) : null}
                </div>
                <span className="track-dur">{i.duration ?? ''}</span>
                <a href={i.audioUrl!} download className="track-dl" aria-label={`Скачать MP3: ${i.title}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14" /></svg>
                </a>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="empty">{q ? 'Ничего не найдено. Попробуйте другой запрос.' : 'В этом разделе аудиоуроков пока нет.'}</p>
      )}
    </div>
  )
}

/** Кнопка «Слушать» для одного урока (на странице урока, в карточках). */
export function ListenButton({ item, label = 'Слушать урок' }: { item: Pick<MediaItem, 'id' | 'title' | 'audioUrl' | 'slug' | 'courseTitle' | 'categoryLabel' | 'teacher'>; label?: string }) {
  const { current, playing, play } = useAudioPlayer()
  const listen = useListenMap()
  if (!item.audioUrl) return null
  const isCur = current?.id === item.id
  const l = listen[item.id]
  const track: Track = {
    id: item.id,
    title: item.title,
    subtitle: [item.courseTitle ?? item.categoryLabel, item.teacher].filter(Boolean).join(' · '),
    url: item.audioUrl,
    href: `/lessons/${item.slug}`,
  }
  return (
    <button type="button" className="btn btn-white" onClick={() => play(track)}>
      {isCur && playing ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
      )}
      {isCur && playing ? 'Пауза' : l && !l.done && l.t > 5 ? `Продолжить с ${fmtClock(l.t)}` : label}
    </button>
  )
}
