'use client'

import { useState } from 'react'

import { toEmbedUrl } from '@/lib/video'

import { fmtClock, useListenMap } from '@/lib/listenStore'

import { ListenButton } from './audio/AudioBrowser'

/** Плеер урока: видео (встроенный Kinescope / VK / Rutube) и аудио через общий плеер сайта. */
export function LessonMedia({
  videoUrl,
  audioUrl,
  title,
  lessonId,
  slug,
  courseTitle,
  categoryLabel,
  teacher,
}: {
  videoUrl?: string | null
  audioUrl?: string | null
  title: string
  lessonId: string | number
  slug: string
  courseTitle?: string | null
  categoryLabel?: string
  teacher?: string | null
}) {
  const safeVideo = toEmbedUrl(videoUrl)
  const [mode, setMode] = useState<'video' | 'audio'>(safeVideo ? 'video' : 'audio')
  const listen = useListenMap()
  if (!safeVideo && !audioUrl) return null
  const l = listen[String(lessonId)]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {safeVideo && audioUrl ? (
        <div className="seg" role="group" aria-label="Формат урока">
          <button type="button" aria-pressed={mode === 'video'} onClick={() => setMode('video')}>
            Видео
          </button>
          <button type="button" aria-pressed={mode === 'audio'} onClick={() => setMode('audio')}>
            Аудио
          </button>
        </div>
      ) : null}

      {mode === 'video' && safeVideo ? (
        <div className="player">
          <iframe
            src={safeVideo}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : null}

      {mode === 'audio' && audioUrl ? (
        <div className="audio-player">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--gold-light)' }}>
                {l ? (l.done ? 'Прослушано' : `Вы остановились на ${fmtClock(l.t)}`) : 'Аудиозапись урока'}
              </div>
            </div>
            <ListenButton
              item={{ id: String(lessonId), title, audioUrl, slug, courseTitle: courseTitle ?? null, categoryLabel: categoryLabel ?? '', teacher: teacher ?? null }}
            />
          </div>
          {l ? (
            <div className="bar thin" style={{ background: 'rgba(255,255,255,.15)' }}>
              <div style={{ width: `${l.done ? 100 : Math.round((l.t / Math.max(l.d, 1)) * 100)}%`, background: 'var(--sky)' }} />
            </div>
          ) : null}
          <div style={{ fontSize: 13, color: '#CFE9DE' }}>
            Плеер продолжит играть внизу экрана, даже если перейти на другую страницу.{' '}
            <a href={audioUrl} download style={{ color: '#E6F5EE', fontWeight: 600 }}>
              Скачать MP3
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
