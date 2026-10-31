'use client'

import { useEffect, useRef, useState } from 'react'

/* Кнопка «Послушать» у слова словаря: проигрывает произношение, повторное нажатие — заново. */

let current: HTMLAudioElement | null = null

export function SayButton({ src, word, small }: { src: string; word: string; small?: boolean }) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => ref.current?.pause(), [])

  const play = () => {
    if (!ref.current) {
      const a = new Audio(src)
      a.preload = 'auto'
      a.addEventListener('playing', () => setPlaying(true))
      a.addEventListener('ended', () => setPlaying(false))
      a.addEventListener('pause', () => setPlaying(false))
      a.addEventListener('error', () => setPlaying(false))
      ref.current = a
    }
    const a = ref.current
    if (current && current !== a) current.pause()
    current = a
    a.currentTime = 0
    void a.play().catch(() => setPlaying(false))
  }

  return (
    <button
      type="button"
      className={`say-btn${small ? ' say-btn-sm' : ''}${playing ? ' is-playing' : ''}`}
      onClick={play}
      aria-label={`Послушать: ${word}`}
      title="Послушать"
    >
      <svg width={small ? 14 : 18} height={small ? 14 : 18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}
