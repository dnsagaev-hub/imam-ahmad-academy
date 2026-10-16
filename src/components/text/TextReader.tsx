'use client'

import { useEffect, useRef, useState } from 'react'

type Mode = 'both' | 'ru' | 'ar'
const SIZES = [15, 17, 19, 21]
const KEY = 'imam-ahmad-academy:reader:v1'

/**
 * Обёртка текстового урока: режим «арабский + русский / только перевод / только арабский»,
 * размер шрифта и полоса прочитанного. Настройки запоминаются в браузере.
 */
export function TextReader({
  children,
  hasArabic,
  readingMinutes,
}: {
  children: React.ReactNode
  hasArabic: boolean
  readingMinutes?: number
}) {
  const [mode, setMode] = useState<Mode>('both')
  const [size, setSize] = useState(1)
  const [read, setRead] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(window.localStorage.getItem(KEY) || '{}')
      if (s.mode) setMode(s.mode)
      if (typeof s.size === 'number') setSize(s.size)
    } catch {
      /* без сохранённых настроек */
    }
  }, [])

  const save = (next: { mode?: Mode; size?: number }) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ mode, size, ...next }))
    } catch {
      /* не удалось сохранить */
    }
  }

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      const done = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.3) / Math.max(total, 1)))
      setRead(done)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const setM = (m: Mode) => {
    setMode(m)
    save({ mode: m })
  }

  return (
    <article className="card tl" data-mode={hasArabic ? mode : 'ru'} style={{ ['--tl-size' as string]: `${SIZES[size]}px` }}>
      <div className="tl-progress" aria-hidden="true">
        <div style={{ width: `${Math.round(read * 100)}%` }} />
      </div>
      <div className="tl-toolbar">
        <span className="tl-meta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
            <path d="M4 19V5" />
          </svg>
          Текстовый урок{readingMinutes ? ` · ≈ ${readingMinutes} мин чтения` : ''}
        </span>
        <div className="tl-controls">
          {hasArabic ? (
            <div className="seg seg-sm" role="group" aria-label="Что показывать">
              <button type="button" aria-pressed={mode === 'both'} onClick={() => setM('both')}>
                Араб. + рус.
              </button>
              <button type="button" aria-pressed={mode === 'ru'} onClick={() => setM('ru')}>
                Перевод
              </button>
              <button type="button" aria-pressed={mode === 'ar'} onClick={() => setM('ar')} lang="ar">
                العربية
              </button>
            </div>
          ) : null}
          <div className="tl-size" role="group" aria-label="Размер шрифта">
            <button
              type="button"
              aria-label="Мельче"
              disabled={size === 0}
              onClick={() => {
                setSize(size - 1)
                save({ size: size - 1 })
              }}
            >
              A−
            </button>
            <button
              type="button"
              aria-label="Крупнее"
              disabled={size === SIZES.length - 1}
              onClick={() => {
                setSize(size + 1)
                save({ size: size + 1 })
              }}
            >
              A+
            </button>
          </div>
        </div>
      </div>
      <div className="tl-body" ref={ref}>
        {children}
      </div>
    </article>
  )
}
