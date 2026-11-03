'use client'

import { useState } from 'react'

import { toEmbedUrl } from '@/lib/video'

import { fmtClock, useListenMap } from '@/lib/listenStore'

import { ListenButton } from './audio/AudioBrowser'

/** Плеер урока: видео (встроенный Kinescope / VK / Rutube) и одно или несколько аудио через общий плеер сайта. */
export function LessonMedia({
  videoUrl,
  audioUrl,
  title,
  lessonId,
  slug,
  courseTitle,
  categoryLabel,
  teacher,
  audios,
}: {
  videoUrl?: string | null
  audioUrl?: string | null
  /** Дополнительные аудио урока (поле «Ещё аудио к уроку»): подпись и ссылка на файл. */
  audios?: { id: string; caption: string; url: string }[]
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
  // Основное аудио хранит позицию прослушивания под id урока (как раньше), дополнительные — под «id:строка».
  const tracks = [
    ...(audioUrl ? [{ id: String(lessonId), caption: 'Аудиозапись урока', url: audioUrl }] : []),
    ...(audios ?? []).map((a) => ({ id: `${lessonId}:${a.id}`, caption: a.caption, url: a.url })),
  ]
  const hasAudio = tracks.length > 0
  if (!safeVideo && !hasAudio) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {safeVideo && hasAudio ? (
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

      {mode === 'audio' && tracks.length ? (
        <div className="audio-player">
          {tracks.length > 1 ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--gold-light)' }}>Аудиозаписи урока: {tracks.length}</div>
            </div>
          ) : null}
          {tracks.map((t) => {
            const l = listen[t.id]
            const many = tracks.length > 1
            return (
              <div key={t.id} className={many ? 'audio-part' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: many ? 16 : 17 }}>{many ? t.caption : title}</div>
                    <div style={{ fontSize: 14, color: 'var(--gold-light)' }}>
                      {l ? (l.done ? 'Прослушано' : `Вы остановились на ${fmtClock(l.t)}`) : many ? 'Аудиозапись' : 'Аудиозапись урока'}
                    </div>
                  </div>
                  <ListenButton
                    label={many ? 'Слушать' : 'Слушать урок'}
                    item={{
                      id: t.id,
                      title: many ? `${title}: ${t.caption}` : title,
                      audioUrl: t.url,
                      slug,
                      courseTitle: courseTitle ?? null,
                      categoryLabel: categoryLabel ?? '',
                      teacher: teacher ?? null,
                    }}
                  />
                </div>
                {l ? (
                  <div className="bar thin" style={{ background: 'rgba(255,255,255,.15)' }}>
                    <div style={{ width: `${l.done ? 100 : Math.round((l.t / Math.max(l.d, 1)) * 100)}%`, background: 'var(--sky)' }} />
                  </div>
                ) : null}
                {many ? (
                  <a href={t.url} download style={{ fontSize: 13, color: '#E6F5EE', fontWeight: 600, alignSelf: 'flex-start' }}>
                    Скачать MP3
                  </a>
                ) : null}
              </div>
            )
          })}
          <div style={{ fontSize: 13, color: '#CFE9DE' }}>
            Плеер продолжит играть внизу экрана, даже если перейти на другую страницу.
            {tracks.length === 1 ? (
              <>
                {' '}
                <a href={tracks[0].url} download style={{ color: '#E6F5EE', fontWeight: 600 }}>
                  Скачать MP3
                </a>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
