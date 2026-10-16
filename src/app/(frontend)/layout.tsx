import type { Metadata } from 'next'
import { Amiri, Cormorant_Garamond, Manrope } from 'next/font/google'
import React from 'react'

import { AudioPlayerProvider } from '@/components/audio/AudioPlayer'

import './styles.css'

const display = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const body = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const arabic = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'Академия имама Ахмада — онлайн-школа ханбалитского фикха',
    template: '%s — Академия имама Ахмада',
  },
  description:
    'Последовательное изучение ханбалитского мазхаба: видео- и аудиоуроки по матнам, тесты после каждого урока, библиотека и статьи.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} ${arabic.variable}`}>
      <body>
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </body>
    </html>
  )
}
