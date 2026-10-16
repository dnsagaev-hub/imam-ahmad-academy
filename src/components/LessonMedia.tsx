'use client'

import { useState } from 'react'

/** Плеер урока с переключателем «Видео / Аудио». */
export function LessonMedia({ videoUrl, audioUrl, title }: { videoUrl?: string | null; audioUrl?: string | null; title: string }) {
  const safeVideo = videoUrl && /^https:\/\//.test(videoUrl) ? videoUrl : null
  const [mode, setMode] = useState<'video' | 'audio'>(safeVideo ? 'video' : 'audio')
  if (!safeVideo && !audioUrl) return null

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
          <div style={{ fontWeight: 700, fontSize: 17 }}>{title} — аудио</div>
          <audio controls preload="metadata" src={audioUrl}>
            Ваш браузер не поддерживает аудио.
          </audio>
          <a href={audioUrl} download style={{ color: '#E6F5EE', fontSize: 14, fontWeight: 600 }}>
            Скачать MP3
          </a>
        </div>
      ) : null}
    </div>
  )
}
